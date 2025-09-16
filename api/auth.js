export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const resp = await fetch("https://mercatto.varejofacil.com/api/v1/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: process.env.VAREJO_USER,
        password: process.env.VAREJO_PASS,
      }),
    });

    const raw = await resp.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return res.status(500).json({ error: "Falha ao parsear AUTH", raw });
    }

    if (!resp.ok || !data.token) {
      return res.status(401).json({ error: "Autenticação falhou", raw: data });
    }

    return res.status(200).json({ token: data.token });
  } catch (err) {
    return res.status(500).json({ error: "Erro no AUTH", details: err.message });
  }
}
