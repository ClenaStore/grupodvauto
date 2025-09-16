export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { inicio, fim } = req.query;
    if (!inicio || !fim) {
      return res.status(400).json({ error: "Parâmetros 'inicio' e 'fim' são obrigatórios" });
    }

    // === 1. Autenticação ===
    const authResp = await fetch("https://mercatto.varejofacil.com/api/v1/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: process.env.VAREJO_USER,
        password: process.env.VAREJO_PASS,
      }),
    });

    const authRaw = await authResp.text();
    let authData;
    try {
      authData = JSON.parse(authRaw);
    } catch {
      return res.status(500).json({
        error: "Falha ao parsear resposta do AUTH",
        raw: authRaw,
      });
    }

    if (!authResp.ok || !authData.token) {
      return res.status(401).json({
        error: "Falha na autenticação",
        raw: authData,
      });
    }

    const token = authData.token;

    // === 2. Buscar vendas ===
    const vendasResp = await fetch(
      `https://mercatto.varejofacil.com/api/v1/vendas?inicio=${inicio}&fim=${fim}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const vendasRaw = await vendasResp.text();
    let vendasData;
    try {
      vendasData = JSON.parse(vendasRaw);
    } catch {
      return res.status(500).json({
        error: "Falha ao parsear resposta das vendas",
        raw: vendasRaw,
      });
    }

    if (!vendasResp.ok) {
      return res.status(vendasResp.status).json({
        error: "Erro ao buscar vendas",
        raw: vendasData,
      });
    }

    return res.status(200).json(vendasData);

  } catch (err) {
    return res.status(500).json({ error: "Erro interno", details: err.message });
  }
}
