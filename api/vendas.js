export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { inicio, fim } = req.query;
    if (!inicio || !fim) {
      return res.status(400).json({ error: "Parâmetros 'inicio' e 'fim' são obrigatórios" });
    }

    // 1. Autenticar
    const authResp = await fetch(`${process.env.VERCEL_URL}/api/auth`, {
      method: "POST",
    });

    const authRaw = await authResp.text();
    let authData;
    try {
      authData = JSON.parse(authRaw);
    } catch {
      return res.status(500).json({ error: "Falha ao parsear resposta do AUTH", raw: authRaw });
    }

    if (!authData.token) {
      return res.status(401).json({ error: "Token não recebido", raw: authData });
    }

    const token = authData.token;

    // 2. Buscar vendas
    const vendasResp = await fetch(
      `https://mercatto.varejofacil.com/api/v1/vendas?inicio=${inicio}&fim=${fim}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const vendasRaw = await vendasResp.text();
    let vendasData;
    try {
      vendasData = JSON.parse(vendasRaw);
    } catch {
      return res.status(500).json({ error: "Falha ao parsear vendas", raw: vendasRaw });
    }

    if (!vendasResp.ok) {
      return res.status(vendasResp.status).json({ error: "Erro ao buscar vendas", raw: vendasData });
    }

    // 3. Resumir por modalidade
    const resumo = {};
    (vendasData || []).forEach(v => {
      const forma = v.forma_pagamento || "Outros";
      const valor = Number(v.valor || 0);
      resumo[forma] = (resumo[forma] || 0) + valor;
    });

    return res.status(200).json({ resumo, raw: vendasData });
  } catch (err) {
    return res.status(500).json({ error: "Erro interno", details: err.message });
  }
}
