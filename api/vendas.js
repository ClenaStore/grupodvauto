// /pages/api/vendas.js
export default async function handler(req, res) {
  try {
    const { inicio, fim } = req.query;

    // 1. Autenticar
    const authResp = await fetch("https://mercatto.varejofacil.com/api/v1/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: process.env.VAREJO_FACIL_USER,
        password: process.env.VAREJO_FACIL_PASS
      })
    });

    const authText = await authResp.text();
    let authData;
    try {
      authData = JSON.parse(authText);
    } catch (e) {
      return res.status(500).json({ error: "Falha ao parsear resposta do AUTH", raw: authText });
    }

    if (!authResp.ok || !authData.accessToken) {
      return res.status(401).json({ error: "Falha ao autenticar", raw: authData });
    }

    const token = authData.accessToken;

    // 2. Buscar recebimentos
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

    const raw = await vendasResp.text(); // pega o texto cru
    let vendasData;
    try {
      vendasData = JSON.parse(raw);
    } catch (e) {
      return res.status(vendasResp.status).json({ error: "Resposta inválida", raw });
    }

    res.status(200).json(vendasData);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
