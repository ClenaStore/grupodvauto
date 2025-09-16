// /api/auth.js
export default async function handler(req, res) {
  try {
    const resp = await fetch("https://mercatto.varejofacil.com/api/v1/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: process.env.VAREJO_FACIL_USER,
        password: process.env.VAREJO_FACIL_PASS
      })
    });

    if (!resp.ok) {
      return res.status(resp.status).json({ error: "Erro na autenticação" });
    }

    const data = await resp.json();
    res.status(200).json(data); // retorna accessToken e refreshToken
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
