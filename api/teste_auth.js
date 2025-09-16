export default async function handler(req, res) {
  const authUrl = "https://mercatto.varejofacil.com/api/v1/auth";

  const apiKey = process.env.VAREJO_FACIL_API_KEY;

  try {
    const r = await fetch(authUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chave: apiKey }) // ou { api_key: apiKey }
    });

    const raw = await r.text();
    try {
      return res.status(r.status).json(JSON.parse(raw));
    } catch {
      return res.status(r.status).send(raw);
    }
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
