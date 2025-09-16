// pages/api/resumo_financeiro.js
export default async function handler(req, res) {
  const authUrl   = "https://mercatto.varejofacil.com/api/v1/auth";
  const dataUrl   = "https://mercatto.varejofacil.com/api/v1/financeiro/resumo"; 
  // ajuste este endpoint conforme a doc da API 👆

  const clientId  = process.env.VAREJO_FACIL_CLIENT_ID || "";
  const clientSec = process.env.VAREJO_FACIL_CLIENT_SECRET || "";
  const apiKey    = process.env.VAREJO_FACIL_API_KEY || "";

  // === 1. Autenticar ===
  let token = null;
  let authResp = null;

  // 3 formatos possíveis (igual ao teste_auth)
  const payloads = [
    { chave: apiKey },
    { api_key: apiKey },
    { client_id: clientId, client_secret: clientSec }
  ];

  for (let i = 0; i < payloads.length; i++) {
    try {
      const r = await fetch(authUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloads[i])
      });

      const raw = await r.text();
      try { authResp = JSON.parse(raw); } catch(e) { authResp = raw; }

      if (r.ok && authResp.access_token) {
        token = authResp.access_token;
        break;
      }
    } catch (err) {
      console.error("Erro auth tentativa", i+1, err.message);
    }
  }

  if (!token) {
    return res.status(401).json({ erro: "Falha ao autenticar no Varejo Fácil", authResp });
  }

  // === 2. Buscar dados de resumo financeiro ===
  try {
    const r = await fetch(dataUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const raw = await r.text();
    let json = null;
    try { json = JSON.parse(raw); } catch(e) {}

    return res.status(r.status).json({
      status: r.status,
      dados: json || raw
    });

  } catch (err) {
    return res.status(500).json({ erro: "Falha ao buscar resumo financeiro", detalhe: err.message });
  }
}
