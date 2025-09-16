// /api/vendas.js
export default async function handler(req, res) {
  try {
    // 1. Autentica
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
    const token = authData.accessToken;

    // 2. Pega query
    const { inicio, fim } = req.query;
    if (!inicio || !fim) {
      return res.status(400).json({ error: "Envie ?inicio=YYYY-MM-DD&fim=YYYY-MM-DD" });
    }

    // 3. Faz chamada para recebimentos
    const vendasResp = await fetch(
      `${process.env.BASE_URL}/api/v1/financeiro/recebimentos?dataInicio=${inicio}&dataFim=${fim}`,
      {
        headers: {
          "Authorization": `Bearer ${token}`,
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

    if (!vendasResp.ok) {
      return res.status(vendasResp.status).json({ error: "Falha ao buscar vendas", data });
    }

    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: "Erro interno em vendas.js", details: err.message });
  }
}
