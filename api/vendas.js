import auth from "./auth.js";

export default async function handler(req, res) {
  try {
    const { inicio, fim } = req.query;

    // 🔑 chama o auth.js e pega token
    const authRes = await new Promise((resolve) => {
      const mockRes = {
        status: (code) => ({
          json: (obj) => resolve({ code, obj }),
        }),
      };
      auth(req, mockRes);
    });

    if (authRes.code !== 200 || !authRes.obj.accessToken) {
      return res
        .status(401)
        .json({ error: "Falha ao autenticar", raw: authRes.obj });
    }

    const token = authRes.obj.accessToken;

    // 🔎 busca recebimentos PDV
    const vendasResp = await fetch(
      `https://mercatto.varejofacil.com/api/v1/financeiro/recebimentos-pdv?start=0&count=500`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const vendasData = await vendasResp.json();

    if (!vendasResp.ok) {
      return res
        .status(vendasResp.status)
        .json({ error: "Erro ao buscar vendas", raw: vendasData });
    }

    // 📊 consolida valores por forma de pagamento
    const resumo = {};
    (vendasData.items || []).forEach((item) => {
      const forma = item.descricao || "Indefinido";
      const total = (item.lojas || []).reduce(
        (acc, loja) => acc + (loja.valorRecebimento || 0),
        0
      );
      resumo[forma] = (resumo[forma] || 0) + total;
    });

    return res.status(200).json({ inicio, fim, resumo });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
