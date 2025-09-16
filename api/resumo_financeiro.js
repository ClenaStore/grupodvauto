// /api/resumo_financeiro.js
export default async function handler(req, res) {
  try {
    // valida a senha (já tem no front)
    const key = req.headers['x-api-key'];
    if (!key || key !== process.env.DV_PAINEL_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // 🔑 autenticação no Varejo Fácil
    const authResp = await fetch("https://api.varejofacil.com.br/auth/obter_token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.VAREJO_FACIL_CLIENT_ID,
        client_secret: process.env.VAREJO_FACIL_CLIENT_SECRET
      })
    });

    if (!authResp.ok) {
      throw new Error("Falha ao autenticar na API do Varejo Fácil");
    }
    const authData = await authResp.json();
    const token = authData?.access_token;

    // 📊 chama a API de recebimentos
    const recResp = await fetch("https://api.varejofacil.com.br/financeiro/recebimentos", {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!recResp.ok) {
      throw new Error("Erro ao consultar recebimentos");
    }

    const recebimentos = await recResp.json();

    // 🔄 mapeia para o formato esperado pelo painel
    const dados = recebimentos.map(r => ({
      Empresa: r.empresa_nome || "Não informado",
      Data: r.data_recebimento?.split("T")[0] || "",
      Categoria: r.forma_pagamento || "OUTROS",
      Valor: r.valor || 0
    }));

    res.status(200).json(dados);

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
}
