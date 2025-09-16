// /api/auth.js
export default async function handler(req, res) {
  try {
    const resp = await fetch("https://mercatto.varejofacil.com/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: process.env.VAREJO_FACIL_USER,
        password: process.env.VAREJO_FACIL_PASS
      })
    });

    const data = await resp.json();

    if (!resp.ok) {
      return res.status(resp.status).json({ error: "Falha na autenticação", raw: data });
    }

    res.status(200).json({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
