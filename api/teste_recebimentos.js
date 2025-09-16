// /api/teste_recebimentos.js
export default async function handler(req, res) {
  try {
    const { inicio, fim } = req.query;

    // 1. Autenticar
    const authResp = await fetch("https://mercatto.varejofacil.com/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: process.env.VAREJO_FACIL_USER,
        password: process.env.VAREJO_FACIL_PASS
      })
    });

    const authData = await authResp.json();
    const token = authData.accessToken;

    if (!token) {
      return res.status(401).json({ error: "Falha na autenticação" });
    }

    // 2. Monta a URL com filtros opcionais
    let url = "https://mercatto.varejofacil.com/api/v1/financeiro/recebimentos-pdv";
    const params = new URLSearchParams();
    if (inicio) params.append("dataInicio", inicio);
    if (fim) params.append("dataFim", fim);
    if ([...params].length > 0) url += "?" + params.toString();

    // 3. Buscar os recebimentos
    const recResp = await fetch(url, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    const raw = await recResp.text(); // pega sempre o texto cru
    let data;
    try {
      data = JSON.parse(raw); // tenta converter em JSON
    } catch {
      data = { raw }; // se não for JSON válido, mostra como texto
    }

    res.status(recResp.status).json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
