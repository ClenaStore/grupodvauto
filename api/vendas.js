// /api/vendas.js
export default async function handler(req, res) {
  try {
    const { inicio, fim } = req.query;

    // 1. Obter o token
    const authResp = await fetch(`${process.env.API_BASE_URL}/api/auth`);
    const authData = await authResp.json();
    if (!authData.accessToken) {
      throw new Error("Token não encontrado");
    }

    // 2. Montar payload no formato esperado
    const payload = new URLSearchParams();
    payload.append("filtro.tipoDeData", "DATA_MOVIMENTO");
    payload.append("filtro.periodo.inicio", inicio.split("-").reverse().join("/")); // de AAAA-MM-DD -> DD/MM/AAAA
    payload.append("filtro.periodo.termino", fim.split("-").reverse().join("/"));
    payload.append("filtro.formato", "FORMA_DE_PAGAMENTO");
    payload.append("filtro.tipoQuebra", "LOJA");

    // 3. Fazer POST para o endpoint real
    const vendasResp = await fetch("https://mercatto.varejofacil.com/resumoDeVendas/geraTotalizadores", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Bearer ${authData.accessToken}`
      },
      body: payload.toString()
    });

    const raw = await vendasResp.text();

    // 4. Tentar converter para JSON, senão retornar o texto cru
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
