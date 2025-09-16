export default async function handler(req, res) {
  try {
    const { inicio, fim } = req.query;

    // === LOGIN AUTH ===
    const authResp = await fetch("https://mercatto.varejofacil.com/api/v1/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: process.env.VAREJO_FACIL_USER,
        password: process.env.VAREJO_FACIL_PASS
      }),
    });

    const rawAuth = await authResp.text(); // pega o texto bruto
    console.log("AUTH RAW:", rawAuth); // log em console

    let authData;
    try {
      authData = JSON.parse(rawAuth);
    } catch (e) {
      return res.status(500).json({
        error: "Falha ao parsear resposta do AUTH",
        raw: rawAuth, // devolve o que veio de fato
      });
    }

    if (!authResp.ok || !authData.accessToken) {
      return res.status(401).json({
        error: "Falha ao autenticar",
        raw: rawAuth,
      });
    }

    // === BUSCA VENDAS ===
    const vendasResp = await fetch(
      `https://mercatto.varejofacil.com/api/v1/financeiro/recebimentos-pdv?inicio=${inicio}&fim=${fim}`,
      {
        headers: {
          Authorization: `Bearer ${authData.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const rawVendas = await vendasResp.text();
    console.log("VENDAS RAW:", rawVendas);

    let vendasData;
    try {
      vendasData = JSON.parse(rawVendas);
    } catch (e) {
      return res.status(500).json({
        error: "Falha ao parsear resposta de VENDAS",
        raw: rawVendas,
      });
    }

    // === CONSOLIDA POR FORMA DE PAGAMENTO ===
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
