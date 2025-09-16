export default async function handler(req, res) {
  try {
    // 1. Login
    const authResp = await fetch(`${process.env.VAREJO_FACIL_BASE}/api/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: process.env.VAREJO_FACIL_USER,
        password: process.env.VAREJO_FACIL_PASS,
      }),
    });

    const authData = await authResp.json();
    const token = authData?.accessToken;
    if (!token) {
      return res.status(401).json({ error: "Login falhou" });
    }

    // 2. Monta payload
    const { inicio, fim } = req.query;
    const payload = new URLSearchParams({
      "filtro.tipoDeData": "DATA_MOVIMENTO",
      "filtro.periodo.inicio": inicio.split("-").reverse().join("/"),
      "filtro.periodo.termino": fim.split("-").reverse().join("/"),
      "filtro.formato": "FORMA_DE_PAGAMENTO",
      "filtro.tipoQuebra": "LOJA",
    });

    // 3. Chama o endpoint protegido
    const resp = await fetch(
      `${process.env.VAREJO_FACIL_BASE}/resumoDeVendas/geraTotalizadores`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${token}`,
        },
        body: payload,
      }
    );

    const raw = await resp.text();
    let data;
    try {
      data = JSON.parse(raw); // tenta parsear JSON
    } catch {
      return res.status(500).json({ error: "Resposta não é JSON", raw });
    }

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar resumo", details: err.message });
  }
}
