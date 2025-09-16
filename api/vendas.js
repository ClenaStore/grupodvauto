// /pages/api/vendas.js
export default async function handler(req, res) {
  try {
    const { inicio, fim } = req.query;

    // 1. Primeiro autentica (gera token)
    const authResp = await fetch("https://mercatto.varejofacil.com/api/v1/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: process.env.VAREJO_FACIL_USER,
        password: process.env.VAREJO_FACIL_PASS
      })
    });

    const authData = await authResp.json();
    if (!authResp.ok || !authData.accessToken) {
      return res.status(401).json({ error: "Falha ao autenticar", raw: authData });
    }

    const token = authData.accessToken;

    // 2. Busca os recebimentos consolidados
    const vendasResp = await fetch(
      `https://mercatto.varejofacil.com/api/v1/financeiro/recebimentos-pdv?inicio=${inicio}&fim=${fim}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    const vendasData = await vendasResp.json();

    if (!vendasResp.ok) {
      return res.status(vendasResp.status).json({
        error: "Erro ao buscar vendas",
        raw: vendasData
      });
    }

    // 3. Retorna o JSON direto para o navegador
    res.status(200).json(vendasData);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
