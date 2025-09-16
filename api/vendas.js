import { getToken } from "./utils.js";

export default async function handler(req, res) {
  try {
    const { inicio, fim } = req.query;
    const token = await getToken();

    const url = `https://mercatto.varejofacil.com/api/v1/financeiro/recebimentos-pdv?inicio=${inicio}&fim=${fim}`;
    const resp = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await resp.json();

    if (!resp.ok) {
      return res.status(500).json({ error: "Erro API", raw: data });
    }

    // consolida por forma de pagamento
    const resumo = {};
    data.forEach((venda) => {
      const forma = venda.formaPagamento || "Outros";
      resumo[forma] = (resumo[forma] || 0) + venda.valor;
    });

    res.json({ resumo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
