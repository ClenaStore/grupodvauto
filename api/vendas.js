export default async function handler(req, res) {
  try {
    // 1. Obter token
    const authResp = await fetch(`${process.env.VAREJO_FACIL_BASE}/api/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: process.env.VAREJO_FACIL_USER,
        password: process.env.VAREJO_FACIL_PASS
      }),
    });

    const { accessToken } = await authResp.json();
    if (!accessToken) throw new Error("Falha no login");

    // 2. Montar payload igual ao DevTools
    const { inicio, fim } = req.query;
    const payload = {
      "filtro.tipoDeData": "DATA_MOVIMENTO",
      "filtro.periodo.inicio": inicio.split("-").reverse().join("/"), // 2025-09-16 → 16/09/2025
      "filtro.periodo.termino": fim.split("-").reverse().join("/"),
      "filtro.formato": "FORMA_DE_PAGAMENTO",
      "filtro.tipoQuebra": "LOJA"
    };

    // 3. Chamar endpoint certo
    const resp = await fetch(`${process.env.VAREJO_FACIL_BASE}/resumoDeVendas/geraTotalizadores`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify(payload)
    });

    const raw = await resp.text(); // pega como texto
    let data;
    try {
      data = JSON.parse(raw); // tenta converter para JSON
    } catch {
      return res.status(500).json({ error: "Resposta não é JSON", raw });
    }

    res.status(200).json(data);

  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar resumo", details: err.message });
  }
}
