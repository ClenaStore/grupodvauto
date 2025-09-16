export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { inicio, fim } = req.query;

    if (!inicio || !fim) {
      return res.status(400).json({ error: "Parâmetros 'inicio' e 'fim' são obrigatórios" });
    }

    // === 1. Autenticação (pega token com usuário e senha salvos em variáveis de ambiente) ===
    const authResp = await fetch("https://mercatto.varejofacil.com/api/v1/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: process.env.VAREJO_USER,
        password: process.env.VAREJO_PASS,
      }),
    });

    const authData = await authResp.json();

    if (!authResp.ok || !authData.token) {
      return res.status(401).json({
        error: "Falha ao autenticar no Varejo Fácil",
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

    const vendasData = await vendasResp.json();

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
