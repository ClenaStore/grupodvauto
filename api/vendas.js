export default async function handler(req, res) {
  const { inicio, fim } = req.query;

  if (!inicio || !fim) {
    return res.status(400).json({ error: "Parâmetros 'inicio' e 'fim' são obrigatórios (YYYY-MM-DD)" });
  }

  try {
    // 1. Obter token chamando /api/auth local
    const authResp = await fetch(`${process.env.VERCEL_URL ? "https://" + process.env.VERCEL_URL : "http://localhost:3000"}/api/auth`);
    const authData = await authResp.json();

    if (!authData.accessToken) {
      throw new Error("Falha ao autenticar no Varejo Fácil");
    }

    const token = authData.accessToken;

    // 2. Montar payload igual ao DevTools
    const payload = new URLSearchParams();
    payload.append("filtro.tipoDeData", "DATA_MOVIMENTO");
    payload.append("filtro.periodo.inicio", inicio.split("-").reverse().join("/"));  // YYYY-MM-DD -> DD/MM/YYYY
    payload.append("filtro.periodo.termino", fim.split("-").reverse().join("/"));
    payload.append("filtro.formato", "FORMA_DE_PAGAMENTO");
    payload.append("filtro.tipoQuebra", "LOJA");

    // 3. Chamar o endpoint real
    const resp = await fetch("https://mercatto.varejofacil.com/resumoDeVendas/geraTotalizadores", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Bearer ${token}`,
      },
      body: payload.toString()
    });

    const raw = await resp.text();

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return res.status(500).json({
        error: "Resposta inválida do servidor do Varejo Fácil",
        raw
      });
    }

    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({
      error: "Erro ao buscar resumo",
      details: err.message
    });
  }
}
