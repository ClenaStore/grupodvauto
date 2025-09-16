export default async function handler(req, res) {
  try {
    const resp = await fetch("https://mercatto.varejofacil.com/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: process.env.VAREJO_FACIL_USER,
        password: process.env.VAREJO_FACIL_PASS,
      }),
    });

    // se a resposta não for JSON, captura como texto
    const text = await resp.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch {
      return res
        .status(resp.status || 500)
        .json({ error: "Resposta AUTH não é JSON", raw: text });
    }

    if (!resp.ok) {
      return res.status(resp.status).json({ error: "Erro no AUTH", raw: data });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
