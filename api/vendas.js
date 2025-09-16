export default async function handler(req, res) {
  const { inicio, fim } = req.query;

  try {
    // 1. Autenticação
    const authResp = await fetch("https://mercatto.varejofacil.com/api/v1/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: process.env.VAREJO_FACIL_USER,
        password: process.env.VAREJO_FACIL_PASS,
      }),
    });

    const rawAuth = await authResp.text();
    let authData;

    try {
      authData = JSON.parse(rawAuth);
    } catch (e) {
      return res
        .status(401)
        .json({ error: "Falha ao parsear AUTH", raw: rawAuth });
    }

    if (!authData.accessToken) {
      return res.status(401).json({ error: "AUTH sem accessToken", raw: authData });
    }

    const token = authData.accessToken;

    // 2. Buscar vendas
    const vendasResp = await fetch(
      `https://mercatto.varejofacil.com/api/v1/financeiro/recebimentos-pdv?inicio=${inicio}&fim=${fim}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const rawVendas = await vendasResp.text();
    let vendasData;
    try {
      vendasData = JSON.parse(rawVendas);
    } catch (e) {
      return res
        .status(500)
        .json({ error: "Falha ao parsear vendas", raw: rawVendas });
    }

    if (!vendasResp.ok) {
      return res
        .status(vendasResp.status)
        .json({ error: "Erro na API de vendas", raw: vendasData });
    }

    // 3. Consolidar resumo por forma de pagamento
    const resumo = {};
    (vendasData || []).forEach((item) => {
      const forma = item.formaPagamento || "Outros";
      resumo[forma] = (resumo[forma] || 0) + (item.valor || 0);
    });

    return res.status(200).json({ resumo, bruto: vendasData });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
