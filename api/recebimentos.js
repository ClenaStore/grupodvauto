// /api/recebimentos.js
export default async function handler(req, res) {
  try {
    // 1. Autentica e gera o token
    const authResp = await fetch("https://mercatto.varejofacil.com/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: process.env.VAREJO_FACIL_USER,
        password: process.env.VAREJO_FACIL_PASS
      })
    });

    const authData = await authResp.json();
    if (!authResp.ok) {
      return res.status(authResp.status).json(authData);
    }

    const token = authData.accessToken;

    // 2. Chama os recebimentos PDV já autenticado
    const { inicio, fim } = req.query;
    const url = new URL("https://mercatto.varejofacil.com/api/v1/financeiro/recebimentos-pdv");

    // filtros opcionais (exemplo: periodo ou paginação)
    if (inicio && fim) {
      url.searchParams.append("q", `dataRecebimento=ge=${inicio};dataRecebimento=le=${fim}`);
    }
    url.searchParams.append("count", "100"); // exemplo: retorna 100 linhas

    const resp = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` }
    });

    const text = await resp.text();
    try {
      const data = JSON.parse(text);
      res.status(resp.status).json(data);
    } catch {
      res.status(resp.status).json({ raw: text });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
