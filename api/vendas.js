// /api/vendas.js
export default async function handler(req, res) {
  try {
    const { inicio, fim } = req.query;

    // 1. Autentica para pegar o token
    const authResp = await fetch(`${process.env.VERCEL_URL}/api/auth`);
    const authData = await authResp.json();

    if (!authData.accessToken) {
      return res.status(401).json({ error: "Não foi possível autenticar", raw: authData });
    }

    // 2. Chama o endpoint de recebimentos PDV
    const vendasResp = await fetch(
      `https://mercatto.varejofacil.com/api/v1/financeiro/recebimentos-pdv?start=0&count=500`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${authData.accessToken}`,
          "Content-Type": "application/json"
        }
      }
    );

    const vendasData = await vendasResp.json();

    if (!vendasResp.ok) {
      return res.status(vendasResp.status).json({ error: "Erro ao buscar vendas", raw: vendasData });
    }

    // 3. Consolida resumo por forma de pagamento
    const resumo = {};
    (vendasData.items || []).forEach(item => {
      const forma = item.descricao || "Indefinido";
      const total = (item.lojas || []).reduce((acc, loja) => acc + (loja.valorRecebimento || 0), 0);
      resumo[forma] = (resumo[forma] || 0) + total;
    });

    res.status(200).json({
      inicio,
      fim,
      resumo
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
