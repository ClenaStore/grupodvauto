// /api/vendas.js
export default async function handler(req, res) {
  try {
    const { inicio, fim } = req.query;

    // 1️⃣ Obter token do auth.js
    const authResp = await fetch(`${req.headers.origin}/api/auth`);
    const { accessToken } = await authResp.json();

    if (!accessToken) {
      return res.status(401).json({ error: "Não foi possível autenticar" });
    }

    // 2️⃣ Buscar vendas na API do Varejo Fácil
    const vendasResp = await fetch(
      `https://mercatto.varejofacil.com/api/v1/vendas?inicio=${inicio}&fim=${fim}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const vendasData = await vendasResp.json();

    if (!vendasResp.ok) {
      return res.status(vendasResp.status).json({
        error: "Falha ao buscar vendas",
        raw: vendasData,
      });
    }

    return res.status(200).json(vendasData);
  } catch (err) {
    return res.status(500).json({ error: "Erro interno em vendas.js", details: err.message });
  }
}
