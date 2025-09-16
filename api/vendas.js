export default async function handler(req, res) {
  try {
    const { inicio, fim } = req.query;

    // 1. Primeiro autentica
    const authResp = await fetch("https://mercatto.varejofacil.com/api/v1/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: process.env.VAREJO_FACIL_USER,
        password: process.env.VAREJO_FACIL_PASS
      }),
    });

    let authData = {};
    try {
      authData = await authResp.json();
    } catch (e) {
      return res.status(500).json({ error: "Falha ao parsear resposta do AUTH", raw: "" });
    }

    if (!authResp.ok || !authData.accessToken) {
      return res.status(401).json({ error: "Falha ao autenticar", raw: authData });
    }

    // 2. Busca vendas
    const vendasResp = await fetch(
      `https://mercatto.varejofacil.com/api/v1/financeiro/recebimentos-pdv?inicio=${inicio}&fim=${fim}`,
      {
        headers: {
          Authorization: `Bearer ${authData.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    let vendasData = {};
    try {
      vendasData = await vendasResp.json();
    } catch (e) {
      return res.status(500).json({ error: "Falha ao parsear resposta de VENDAS", raw: "" });
    }

    if (!vendasResp.ok) {
      return res.status(vendasResp.status).json({
        error: "Erro ao buscar vendas",
        raw: vendasData,
      });
    }

    // 3. Consolida vendas por forma de pagamento
    const resumo = {};
    if (Array.isArray(vendasData)) {
      vendasData.forEach(v => {
        const forma = v.formaPagamento || "Não informado";
        const valor = parseFloat(v.valor || 0);
        resumo[forma] = (resumo[forma] || 0) + valor;
      });
    }

    return res.status(200).json({ resumo, raw: vendasData });
  } catch (err) {
    return res.status(500).json({ error: err.message, raw: "" });
  }
}
