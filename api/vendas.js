// /api/vendas.js
import getToken from "./auth";

export default async function handler(req, res) {
  const { inicio, fim } = req.query;

  try {
    // 1. pegar token
    const tokenData = await getToken();
    if (!tokenData?.accessToken) {
      return res.status(401).json({ error: "Falha no login" });
    }

    // 2. chamar o endpoint correto
    const resp = await fetch("https://mercatto.varejofacil.com/resumoDeVendas/geraTotalizadores", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenData.accessToken}`,
      },
      body: JSON.stringify({
        dataInicio: inicio,
        dataFim: fim,
        // aqui talvez precise passar também "empresaId" ou "lojaId"
        // vamos confirmar no Payload do DevTools
      }),
    });

    const raw = await resp.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      data = { raw };
    }

    res.status(resp.status).json(data);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar resumo", details: err.message });
  }
}
