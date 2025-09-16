// /pages/api/recebimentos.js
export default async function handler(req, res) {
  try {
    // 1. Autenticar para obter o token
    const authResp = await fetch("https://mercatto.varejofacil.com/api/v1/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: process.env.VAREJO_FACIL_USER,
        password: process.env.VAREJO_FACIL_PASS
      })
    });

    if (!authResp.ok) {
      throw new Error("Falha ao autenticar");
    }

    const authData = await authResp.json();
    const token = authData.accessToken;

    // 2. Monta a URL com filtros opcionais
    const { inicio, fim } = req.query;
    let url = "https://mercatto.varejofacil.com/api/v1/financeiro/recebimentos-pdv";

    const params = new URLSearchParams();
    if (inicio) params.append("dataInicio", inicio);
    if (fim) params.append("dataFim", fim);
    if ([...params].length > 0) url += "?" + params.toString();

    // 3. Consulta o endpoint protegido
    const recResp = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const dados = await recResp.json();

    // 4. Retorna JSON direto
    res.status(recResp.status).json(dados);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
