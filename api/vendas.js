// /api/vendas.js
export default async function handler(req, res) {
  try {
    // --- Autenticação ---
    const authResp = await fetch("https://mercatto.varejofacil.com/api/v1/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: process.env.VAREJO_FACIL_USER,
        password: process.env.VAREJO_FACIL_PASS
      })
    });

    if (!authResp.ok) {
      throw new Error("Falha na autenticação");
    }

    const authData = await authResp.json();
    const token = authData?.id || authData?.accessToken;

    if (!token) {
      throw new Error("Token não recebido");
    }

    // --- Monta URL de recebimentos ---
    let url = "https://mercatto.varejofacil.com/api/v1/financeiro/recebimentos-pdv";
    const params = new URLSearchParams();
    if (req.query.start) params.append("start", req.query.start);
    if (req.query.count) params.append("count", req.query.count);
    if ([...params].length > 0) url += "?" + params.toString();

    // --- Chamada de recebimentos ---
    const recResp = await fetch(url, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!recResp.ok) {
      throw new Error("Erro ao buscar vendas");
    }

    const dados = await recResp.json();

    // --- Consolida por forma de pagamento ---
    const resumo = {};
    dados.items?.forEach(item => {
      const forma = item.descricao || "OUTROS";
      const valor = item.lojas?.reduce((s, l) => s + (l.valorRecebimento || 0), 0) || 0;
      resumo[forma] = (resumo[forma] || 0) + valor;
    });

    res.status(200).json({ resumo, bruto: dados });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
