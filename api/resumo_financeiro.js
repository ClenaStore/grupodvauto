export default async function handler(req, res) {
  try {
    const chave = process.env.VAREJO_FACIL_API_KEY;

    // 1. Autenticação
    const authResponse = await fetch("https://mercatto.varejofacil.com/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chave })
    });

    const authData = await authResponse.json();

    if (!authResponse.ok) {
      return res.status(authResponse.status).json({ error: "Falha na autenticação", authData });
    }

    const token = authData.access_token;

    // 2. Buscar cupons fiscais (resumo de vendas)
    const vendasResponse = await fetch("https://mercatto.varejofacil.com/api/venda/cupons-fiscais", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    const vendas = await vendasResponse.json();

    if (!vendasResponse.ok) {
      return res.status(vendasResponse.status).json({ error: "Falha ao carregar vendas", vendas });
    }

    // 3. Resumir por forma de pagamento
    const resumo = {};
    vendas.forEach(venda => {
      const forma = venda.formaPagamento || "DESCONHECIDA";
      const valor = venda.valorTotal || 0;

      resumo[forma] = (resumo[forma] || 0) + valor;
    });

    res.status(200).json({ totalVendas: resumo, vendas });

  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar resumo financeiro", details: error.message });
  }
}
