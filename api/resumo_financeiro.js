// /api/resumo_financeiro.js
export default async function handler(req, res) {
  try {
    // --- Valida senha do painel ---
    const key = req.headers['x-api-key'];
    if (!key || key !== process.env.DV_PAINEL_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // --- Lê filtros vindos da query string ---
    const { inicio, fim, empresa } = req.query;

    // --- Autenticação no Varejo Fácil (com chave única) ---
    const authResp = await fetch("https://api.varejofacil.com.br/auth/obter_token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chave: process.env.VAREJO_FACIL_API_KEY   // 🔑 usa a chave única que você viu no painel
      })
    });

    if (!authResp.ok) {
      throw new Error("Falha ao autenticar na API do Varejo Fácil");
    }

    const authData = await authResp.json();
    const token = authData?.access_token;

    if (!token) {
      throw new Error("Token não retornado pela API do Varejo Fácil");
    }

    // --- Monta URL de recebimentos com filtros ---
    let url = "https://api.varejofacil.com.br/financeiro/recebimentos";
    const params = new URLSearchParams();
    if (inicio) params.append("data_inicio", inicio);
    if (fim) params.append("data_fim", fim);
    if (empresa) params.append("empresa", empresa);
    if ([...params].length > 0) url += "?" + params.toString();

    // --- Chama a API de recebimentos ---
    const recResp = await fetch(url, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!recResp.ok) {
      throw new Error("Erro ao consultar recebimentos");
    }

    const recebimentos = await recResp.json();

    // --- Mapeia para o formato que o index espera ---
    const dados = recebimentos.map(r => ({
      Empresa: r.empresa_nome || "Não informado",
      Data: (r.data_recebimento || "").split("T")[0], // YYYY-MM-DD
      Categoria: r.forma_pagamento || "OUTROS",
      Valor: r.valor || 0
    }));

    res.status(200).json(dados);

  } catch (e) {
    console.error("Erro no resumo_financeiro:", e);
    res.status(500).json({ error: e.message });
  }
}
