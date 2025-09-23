import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const { empresa, inicio, fim, tipo = "Despesa" } = req.query;

    // 🔹 1. Faz login e pega JWT
    const loginResp = await fetch(`${process.env.F360_BASEURL}/PublicLoginAPI/DoLogin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: process.env.F360_LOGIN_TOKEN }),
    });

    if (!loginResp.ok) {
      return res.status(401).json({ error: "Falha no login F360" });
    }

    const loginData = await loginResp.json();
    const jwtToken = loginData.Token;

    // 🔹 2. Monta URL de parcelas
    const url = `${process.env.F360_BASEURL}/ParcelasDeTituloPublicAPI/ListarParcelasDeTitulos?pagina=1&tipo=${tipo}&inicio=${inicio}&fim=${fim}&empresas=${encodeURIComponent(empresa)}`;

    // 🔹 3. Busca parcelas
    const parcelasResp = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${jwtToken}`,
      },
    });

    if (!parcelasResp.ok) {
      const errText = await parcelasResp.text();
      return res.status(parcelasResp.status).json({ error: "Erro ao buscar parcelas", details: errText });
    }

    const parcelasData = await parcelasResp.json();

    // 🔹 4. Normaliza dados para o painel
    const titulos = parcelasData.Result?.Parcelas?.map(p => ({
      linha: p.ParcelaId,
      fornecedor: p.DadosDoTitulo?.ClienteFornecedor?.Nome || "N/A",
      vencimento: p.Vencimento,
      valor: p.ValorBruto,
      meio_pagamento: p.MeioDePagamento,
      status: p.Status?.includes("Aberto") ? "Pendente" : "Aprovado", // mapeia status
      observacao: p.DadosDoTitulo?.Observacao || "",
      historico: p.Rateio?.map(r => r.PlanoDeContas).join(", ") || "",
    })) || [];

    res.status(200).json({ titulos });

  } catch (err) {
    console.error("Erro API f360:", err);
    res.status(500).json({ error: "Erro interno", details: err.message });
  }
}
