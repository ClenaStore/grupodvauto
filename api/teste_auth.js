// pages/api/teste_auth.js
export default async function handler(req, res) {
  const authUrl = "https://mercatto.varejofacil.com/api/v1/auth";

  const clientId  = process.env.VAREJO_FACIL_CLIENT_ID || "";
  const clientSec = process.env.VAREJO_FACIL_CLIENT_SECRET || "";
  const apiKey    = process.env.VAREJO_FACIL_API_KEY || "";

  // 3 formatos possíveis (um deles vai funcionar)
  const payloads = [
    { chave: apiKey },
    { api_key: apiKey },
    { client_id: clientId, client_secret: clientSec }
  ];

  let ultimoRaw = null;

  for (let body of payloads) {
    try {
      const r = await fetch(authUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const raw = await r.text();
      ultimoRaw = raw;

      if (r.ok) {
        try {
          return res.status(200).json(JSON.parse(raw));
        } catch {
          return res.status(200).send(raw);
        }
      }
    } catch (e) {
      ultimoRaw = e.message;
    }
  }

  res.status(401).json({ status: 401, raw: ultimoRaw });
}
