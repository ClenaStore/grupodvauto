// /api/vendas.js
export default async function handler(req, res) {
  try {
    const authResp = await fetch(`${process.env.BASE_URL}/api/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: process.env.VAREJO_FACIL_USER,
        password: process.env.VAREJO_FACIL_PASS
      })
    });

    const authData = await authResp.json();
    if (!authData.accessToken) {
      return res.status(401).json({ error: "Falha no login", raw: authData });
    }

    const { inicio, fim } = req.query;
    if (!inicio || !fim) {
      return res.status(400).json({ error: "Envie ?inicio=YYYY-MM-DD&fim=YYYY-MM-DD" });
    }

const vendasResp = await fetch(
  `${process.env.BASE_URL}/api/v1/pdv/vendas?dataInicio=${inicio}&dataFim=${fim}`,
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
      data = JSON.parse(raw);
    } catch {
      data = { raw };
    }

    return res.status(vendasResp.status).json(data);

  } catch (err) {
    return res.status(500).json({ error: "Erro interno em vendas.js", details: err.message });
  }
}
