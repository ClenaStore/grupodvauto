export default async function handler(req, res) {
  try {
    const { inicio, fim } = req.query;

    // Pega o token do auth.js
    const authResp = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth`);
    const authData = await authResp.json();

    if (!authResp.ok || !authData.accessToken) {
      return res.status(401).json({
        error: "Falha no login em vendas.js",
        raw: authData,
      });
    }

    const token = authData.accessToken;

    // Teste direto no endpoint de vendas
    const url = `https://mercatto.varejofacil.com/api/v1/vendas?inicio=${inicio}&fim=${fim}`;
    const resp = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const rawText = await resp.text();

    return res.status(200).json({
      status: resp.status,
      url,
      raw: rawText,
    });

  } catch (err) {
    return res.status(500).json({
      error: "Erro interno em vendas.js",
      details: err.message,
    });
  }
}
