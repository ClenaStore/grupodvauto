// /api/vendas.js
// Retorna o JSON dos totalizadores do VarejoFácil (resumo por forma de pagamento)
// Ex.: /api/vendas?inicio=2025-09-01&fim=2025-09-16

function ymdToBr(d) {
  // '2025-09-16' -> '16/09/2025'
  if (!d || typeof d !== "string" || !d.includes("-")) return d;
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

function getBaseUrl(req) {
  // funciona em Vercel, local e proxies
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  return `${proto}://${host}`;
}

export default async function handler(req, res) {
  try {
    const { inicio, fim } = req.query;

    if (!inicio || !fim) {
      return res.status(400).json({
        error: "Parâmetros inválidos",
        details: "Use ?inicio=YYYY-MM-DD&fim=YYYY-MM-DD",
      });
    }

    // 1) Obter token chamando SEU /api/auth (que já está funcionando)
    const baseUrl = getBaseUrl(req);
    const authResp = await fetch(`${baseUrl}/api/auth`, {
      method: "GET",
      headers: { "Accept": "application/json" },
      cache: "no-store",
    });

    const authText = await authResp.text();
    let authJson;
    try {
      authJson = JSON.parse(authText);
    } catch {
      return res.status(500).json({
        error: "Falha ao parsear retorno do /api/auth",
        raw: authText,
      });
    }

    const token = authJson?.accessToken;
    if (!token) {
      return res.status(401).json({
        error: "Token ausente no /api/auth",
        raw: authJson,
      });
    }

    // 2) Montar payload exatamente como o painel envia
    const payload = new URLSearchParams();
    payload.append("filtro.tipoDeData", "DATA_MOVIMENTO");
    payload.append("filtro.periodo.inicio", ymdToBr(inicio));
    payload.append("filtro.periodo.termino", ymdToBr(fim));
    payload.append("filtro.formato", "FORMA_DE_PAGAMENTO");
    payload.append("filtro.tipoQuebra", "LOJA");

    // 3) Chamar o endpoint oficial de totalizadores
    const urlResumo = "https://mercatto.varejofacil.com/v1/financeiro/recebimentos-pdv";
    const vfResp = await fetch(urlResumo, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Accept": "application/json, text/plain, */*",
        "Authorization": `Bearer ${token}`,
        // Alguns backends são chatos com CORS; esses cabeçalhos ajudam a simular a chamada do app:
        "Origin": "https://mercatto.varejofacil.com",
        "Referer": "https://mercatto.varejofacil.com/",
      },
      body: payload.toString(),
    });

    const raw = await vfResp.text();

    // Se o token estiver errado/expirado, normalmente volta HTML (login) -> dá erro no JSON.
    if (!vfResp.ok) {
      return res.status(vfResp.status).json({
        error: "Erro ao buscar totalizadores",
        status: vfResp.status,
        statusText: vfResp.statusText,
        raw,
      });
    }

    // 4) Tentar parsear como JSON; se não der, devolver texto cru pra debug
    try {
      const data = JSON.parse(raw);
      return res.status(200).json(data);
    } catch {
      // quando o backend responde HTML (ex.: redirecionou pro login)
      return res.status(200).json({ raw });
    }
  } catch (err) {
    return res.status(500).json({
      error: "Erro interno em /api/vendas",
      details: err?.message || String(err),
    });
  }
}
