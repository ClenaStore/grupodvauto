// /api/vendas.js
export default async function handler(req, res) {
  try {
    const { inicio, fim } = req.query;

    const params = new URLSearchParams();
    params.append("filtro.tipoDeData", "DATA_MOVIMENTO");
    params.append("filtro.periodo.inicio", inicio.split("-").reverse().join("/")); // converte YYYY-MM-DD → DD/MM/YYYY
    params.append("filtro.periodo.termino", fim.split("-").reverse().join("/"));
    params.append("filtro.formato", "FORMA_DE_PAGAMENTO");
    params.append("filtro.tipoQuebra", "LOJA");

    const authResp = await fetch(`${process.env.VAREJO_FACIL_BASE}/api/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: process.env.VAREJO_FACIL_USER,
        password: process.env.VAREJO_FACIL_PASS,
      }),
    });

    const { accessToken } = await authResp.json();

    const resp = await fetch("https://mercatto.varejofacil.com/resumoDeVendas/geraTotalizadores", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: params.toString(),
    });

    const data = await resp.json();
    res.status(200).json(data);

  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar resumo", details: err.message });
  }
}
