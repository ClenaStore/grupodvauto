export default async function handler(req, res) {
  try {
    // 1. Login na API
    const login = await fetch("https://mercatto.varejofacil.com/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: process.env.VAREJO_FACIL_USER,
        password: process.env.VAREJO_FACIL_PASS
      })
    });

    const loginData = await login.json();
    if (!login.ok || !loginData.accessToken) {
      return res.status(401).json({ error: "Falha ao autenticar", detalhe: loginData });
    }

    const token = loginData.accessToken;

    // 2. Pega datas da query
    const { inicio, fim } = req.query;

    // 🔑 Monta URL correta com FIQL
    const url = new URL("https://mercatto.varejofacil.com/api/v1/financeiro/recebimentos-pdv");
    if (inicio && fim) {
      url.searchParams.append("q", `dataRecebimento=ge=${inicio};dataRecebimento=le=${fim}`);
    }
    url.searchParams.append("count", "200");

    // 3. Faz requisição
    const resp = await fetch(url.toString(), {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json"
      }
    });

    const text = await resp.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(500).json({ error: "Resposta inválida", raw: text });
    }

    // 4. Se não houver items
    if (!data.items || data.items.length === 0) {
      return res.status(200).json({ total: 0, formas: {}, raw: data });
    }

    // 5. Consolida por forma de pagamento
    const resumo = {};
    let total = 0;

    data.items.forEach(item => {
      if (item.lojas) {
        item.lojas.forEach(loja => {
          const forma = loja.tipoRecebimento || "DESCONHECIDO";
          const valor = loja.valorRecebimento || 0;

          resumo[forma] = (resumo[forma] || 0) + valor;
          total += valor;
        });
      }
    });

    res.status(200).json({
      inicio,
      fim,
      total,
      formas: resumo
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
