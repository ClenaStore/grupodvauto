// /api/teste_auth.js
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

    const raw = await resp.text(); // pega a resposta como texto

    let data;
    try {
      data = JSON.parse(raw); // tenta converter em JSON
    } catch {
      data = { raw }; // se não for JSON, retorna o texto cru
    }

    res.status(resp.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
