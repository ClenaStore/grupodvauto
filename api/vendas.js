export default async function handler(req, res) {
  try {
    const { inicio, fim } = req.query;

    // 1. LOGIN
    const loginResp = await fetch("https://mercatto.varejofacil.com/api/v1/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: process.env.VAREJO_FACIL_USER,
        password: process.env.VAREJO_FACIL_PASS
      })
    });

    const loginText = await loginResp.text(); // pega texto cru
    let loginData;
    try {
      loginData = JSON.parse(loginText);
    } catch {
      return res.status(500).json({ error: "Falha ao parsear resposta do AUTH", raw: loginText });
    }

    if (!loginData.accessToken) {
      return res.status(401).json({ error: "AUTH falhou", raw: loginData });
    }

    const token = loginData.accessToken;

    // 2. BUSCAR VENDAS
    const vendasResp = await fetch(
      `https://mercatto.varejofacil.com/api/v1/financeiro/recebimentos-pdv?inicio=${inicio}&fim=${fim}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    const vendasText = await vendasResp.text(); // pega texto cru
    let vendasData;
    try {
      vendasData = JSON.parse(vendasText);
    } catch {
      return res.status(500).json({ error: "Falha ao parsear resposta do VENDAS", raw: vendasText });
    }

    // 3. RESUMIR POR FORMA DE PAGAMENTO
    const resumo = {};
    if (Array.isArray(vendasData)) {
      vendasData.forEach(v => {
        const forma = v.formaPagamento || "Indefinido";
        resumo[forma] = (resumo[forma] || 0) + (v.valor || 0);
      });
    }

    res.status(200).json({ resumo, raw: vendasData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
