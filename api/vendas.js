export default async function handler(req, res) {
  try {
    const { inicio, fim } = req.query;

    // 1. Pega token de auth.js
    const authResp = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth`);
    const authData = await authResp.json();

    if (!authResp.ok || !authData.accessToken) {
      return res.status(401).json({
        error: "Falha no login em vendas.js",
        raw: authData,
      });
    }

    const token = authData.accessToken;
    console.log("✅ Token recebido:", token.substring(0, 30) + "...");

    // 2. Chama endpoint de vendas
    const url = `https://mercatto.varejofacil.com/api/v1/vendas?inicio=${inicio}&fim=${fim}`;
    console.log("➡️ Chamando URL de vendas:", url);

    const resp = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const rawText = await resp.text();
    console.log("📩 Resposta bruta de vendas:", rawText);

    let data;
    try {
      data = JSON.parse(rawText);
    } catch (e) {
      return res.status(500).json({
        error: "Falha ao parsear JSON de vendas",
        raw: rawText,
      });
    }

    if (!resp.ok) {
      return res.status(resp.status).json({
        error: "Erro na API de vendas",
        status: resp.status,
        raw: data,
      });
    }

    // 3. Resumo por forma de pagamento
    const resumo = {};
    if (Array.isArray(data)) {
      for (const venda of data) {
        const forma = venda.formaPagamento || "Não informada";
        resumo[forma] = (resumo[forma] || 0) + (venda.valor || 0);
      }
    }

    return res.status(200).json({ resumo, raw: data });
  } catch (err) {
    console.error("💥 Erro interno em vendas.js:", err);
    return res.status(500).json({
      error: "Erro interno em vendas.js",
      details: err.message,
    });
  }
}
