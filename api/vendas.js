export default async function handler(req, res) {
  try {
    // 1. Autenticação
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

    // 2. Monta a URL
    const { inicio, fim } = req.query;
    let url = "https://mercatto.varejofacil.com/api/v1/financeiro/recebimentos-pdv";

    if (inicio && fim) {
      url += `?q=dataRecebimento=ge=${inicio};dataRecebimento=le=${fim}&count=200`;
    }

    // 3. Chamada da API
    const resp = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json"
      }
    });

    const text = await resp.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(500).json({ error: "Resposta inválida", raw: text });
    }

    return res.status(200).json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
