// /api/vendas.js
// Retorna os cupons fiscais (vendas) do VarejoFácil via /api/v1/venda/cupons-fiscais

function ymdToBr(d) {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

function getBaseUrl(req) {
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  return `${proto}://${host}`;
}

export default async function handler(req, res) {
  const { inicio, fim } = req.query;

  if (!inicio || !fim) {
    return res.status(400).json({
      error: "Parâmetros inválidos",
      message: "Use ?inicio=YYYY-MM-DD&fim=YYYY-MM-DD",
    });
  }

  try {
    // 1. Autenticação - pega token de /api/auth
    const baseUrl = getBaseUrl(req);
    const authResp = await fetch(`${baseUrl}/api/auth`);
    const authBody = await authResp.text();
    let authJson;
    try {
      authJson = JSON.parse(authBody);
    } catch {
      return res.status(500).json({
        error: "Falha em /api/auth",
        raw: authBody,
      });
    }

    const token = authJson.accessToken;
    if (!token) {
      return res.status(401).json({
        error: "Token ausente",
        raw: authJson,
      });
    }

    // 2. Busca os cupons fiscais
    const url = `https://mercatto.varejofacil.com/api/v1/venda/cupons-fiscais?dataInicio=${ymdToBr(inicio)}&dataFim=${ymdToBr(fim)}`;
    const vfResp = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json",
      },
    });

    const raw = await vfResp.text();

    if (!vfResp.ok) {
      return res.status(vfResp.status).json({
        error: "Erro ao buscar cupons fiscais",
        status: vfResp.status,
        raw,
      });
    }

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return res.status(500).json({ error: "Resposta não é JSON", raw });
    }

    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: "Erro interno", details: err.message });
  }
}
