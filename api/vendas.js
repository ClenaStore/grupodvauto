// /api/vendas.js
export default async function handler(req, res) {
  try {
    const { inicio, fim } = req.query;

    // monta a URL base dinamicamente
    const baseUrl = req.headers.origin || `https://${process.env.VERCEL_URL}`;

    // chama o endpoint interno de autenticação
    const authResp = await fetch(`${baseUrl}/api/auth`);
    const authData = await authResp.json();
    if (!authData.accessToken) {
      throw new Error("Token não encontrado");
    }

    // prepara payload no formato esperado
    const payload = new URLSearchParams();
    payload.append("filtro.tipoDeData", "DATA_MOVIMENTO");
    payload.append("filtro.periodo.inicio", inicio.split("-").reverse().join("/"));
    payload.append("filtro.periodo.termino", fim.split("-").reverse().join("/"));
    payload.append("filtro.formato", "FORMA_DE_PAGAMENTO");
    payload.append("filtro.tipoQuebra", "LOJA");

    // faz o POST para o endpoint de resumo de vendas
    const vendasResp = await fetch("https://mercatto.varejofacil.com/resumoDeVendas/geraTotalizadores", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Bearer ${authData.accessToken}`
      },
      body: payload.toString()
    });

    const raw = await vendasResp.text();

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      data = { raw };
    }

    res.status(200).json(data);

  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar resumo", details: err.message });
  }
}
