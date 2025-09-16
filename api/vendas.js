export default async function handler(req, res) {
  try {
    // 1. Login primeiro
    const authResp = await fetch(`${process.env.VAREJO_FACIL_BASE}/api/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: process.env.VAREJO_FACIL_USER,
        password: process.env.VAREJO_FACIL_PASS,
      }),
    });

    const authData = await authResp.json();
    const accessToken = authData?.accessToken;
    if (!accessToken) {
      throw new Error("Falha no login");
    }

    // 2. Monta payload no formato correto
    const { inicio, fim } = req.query;
    const payload = new URLSearchParams({
      "filtro.tipoDeData": "DATA_MOVIMENTO",
      "filtro.periodo.inicio": inicio.split("-").reverse().join("/"), // yyyy-mm-dd → dd/mm/yyyy
      "filtro.periodo.termino": fim.split("-").reverse().join("/"),
      "filtro.formato": "FORMA_DE_PAGAMENTO",
      "filtro.tipoQuebra": "LOJA",
    });

    // 3. Requisição para o endpoint capturado no DevTools
    const resp = await fetch(
      `${process.env.VAREJO_FACIL_BASE}/resumoDeVendas/geraTotalizadores`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${accessToken}`,
        },
        body: payload,
      }
    );

    const raw = await resp.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return res.status(500).json({ error: "Resposta não é JSON", raw });
    }

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar resumo", details: err.message });
  }
}
