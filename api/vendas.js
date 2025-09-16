// /api/vendas.js
export default async function handler(req, res) {
  try {
    const { inicio, fim } = req.query;

    // 1. Buscar token no seu próprio endpoint auth
    const authResp = await fetch(`${process.env.VERCEL_URL}/api/auth`, {
      method: "POST",
    });

    const authData = await authResp.json();
    if (!authData.accessToken) {
      return res.status(401).json({ error: "Falha ao autenticar", raw: authData });
    }

    // 2. Chamar cupons fiscais com o accessToken cru
    const apiResp = await fetch("https://mercatto.varejofacil.com/api/v1/venda/cupons-fiscais", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "access_token": authData.accessToken,   // <<< AQUI usa direto
      },
      body: JSON.stringify({
        filtro: {
          tipoDeData: "DATA_MOVIMENTO",
          periodo: {
            inicio: inicio,
            termino: fim,
          },
          formato: "FORMA_DE_PAGAMENTO",
          tipoQuebra: "LOJA",
        },
      }),
    });

    const raw = await apiResp.text();

    // 3. Se for JSON válido, retorna; se não, devolve o texto cru
    try {
      const data = JSON.parse(raw);
      return res.status(apiResp.status).json(data);
    } catch (e) {
      return res.status(apiResp.status).json({ raw });
    }
  } catch (err) {
    return res.status(500).json({ error: "Erro ao buscar cupons fiscais", details: err.message });
  }
}
