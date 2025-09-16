// /api/resumo_financeiro.js
export default async function handler(req, res) {
  try {
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
      throw new Error("Falha na autenticação, token não recebido.");
    }

    // 2. Buscar dados financeiros (ajuste a URL correta do endpoint)
    const url = "https://mercatto.varejofacil.com/api/v1/financeiro/contas-receber";
    const resp = await fetch(url, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!resp.ok) {
      throw new Error(`Erro ao buscar dados: ${resp.status}`);
    }

    const dados = await resp.json();

    // 3. Retornar o JSON para o frontend
    res.status(200).json(dados);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
