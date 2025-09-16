// /api/recebimentos.js
export default async function handler(req, res) {
  try {
    // 1. Autentica e pega o token
    const login = await fetch("https://mercatto.varejofacil.com/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: process.env.VAREJO_FACIL_USER,
        password: process.env.VAREJO_FACIL_PASS
      })
    });

    const loginData = await login.json();
    if (!login.ok || !loginData.accessToken) {
      return res.status(401).json({ error: "Falha ao autenticar", detalhe: loginData });
    }

    const token = loginData.accessToken;

    // 2. Prepara a URL de recebimentos com filtros
    const { inicio, fim } = req.query;
    const url = new URL("https://mercatto.varejofacil.com/api/v1/financeiro/recebimentos-pdv");

    if (inicio && fim) {
      url.searchParams.append("q", `dataRecebimento=ge=${inicio};dataRecebimento=le=${fim}`);
    }
    url.searchParams.append("count", "100");

    // 3. Faz a requisição autenticada
    const resp = await fetch(url.toString(), {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const text = await resp.text();

    // 4. Tenta parsear como JSON, mas se não der, retorna texto cru
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = { raw: text };
    }

    res.status(resp.status).json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
