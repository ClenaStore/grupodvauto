export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Usuário e senha são obrigatórios" });
    }

    // Chamada para a API real do Varejo Fácil
    const resp = await fetch("https://mercatto.varejofacil.com/api/v1/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await resp.json();

    if (!resp.ok) {
      return res.status(resp.status).json({ error: "Falha na autenticação", raw: data });
    }

    // Token retornado
    return res.status(200).json({
      token: data.token || data.access_token || null,
      raw: data,
    });

  } catch (err) {
    return res.status(500).json({ error: "Erro interno", details: err.message });
  }
}
