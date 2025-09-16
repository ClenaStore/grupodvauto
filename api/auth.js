export default async function handler(req, res) {
  try {
    // credenciais de teste (vem das variáveis de ambiente)
    const { VAREJO_USER, VAREJO_PASS } = process.env;

    // chama o endpoint real do Varejo Fácil
    const resp = await fetch("https://mercatto.varejofacil.com/api/v1/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: VAREJO_USER,
        password: VAREJO_PASS,
      }),
    });

    const raw = await resp.text(); // pega a resposta SEM tentar parsear ainda

    let json;
    try {
      json = JSON.parse(raw);
    } catch (e) {
      json = null;
    }

    res.status(resp.status).json({
      status: resp.status,
      ok: resp.ok,
      raw,        // resposta bruta (para debug)
      parsed: json // se conseguiu converter para JSON
    });

  } catch (err) {
    res.status(500).json({
      error: "Falha no auth.js",
      details: err.message,
    });
  }
}
