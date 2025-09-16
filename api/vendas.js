export default async function handler(req, res) {
  try {
    const { inicio, fim } = req.query;

    // 1. Obter token da nossa rota /api/auth
    const authResp = await fetch(`${process.env.BASE_URL}/api/auth`);
    const authData = await authResp.json();

    if (!authData.accessToken) {
      return res.status(401).json({ error: "Falha no login", data: authData });
    }

    // 2. Buscar vendas direto no endpoint oficial
    const vendasResp = await fetch(
      `https://mercatto.varejofacil.com/api/v1/pdv/vendas?dataInicio=${inicio}&dataFim=${fim}`,
      {
        headers: {
          "Authorization": `Bearer ${authData.accessToken}`,
          "Content-Type": "application/json"
        }
      }
    );

    const raw = await vendasResp.text();
    let data;

    try {
      data = JSON.parse(raw); // tenta converter
    } catch (err) {
      data = { raw }; // se não for JSON válido, manda cru
    }

    res.status(vendasResp.status).json(data);

  } catch (err) {
    res.status(500).json({ error: "Erro interno em vendas.js", details: err.message });
  }
}
