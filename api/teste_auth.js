// /api/teste_auth.js
export default async function handler(req, res) {
  try {
    const authResp = await fetch("https://mercatto.varejofacil.com/api/v1/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chave: process.env.VAREJO_FACIL_API_KEY // sua chave cadastrada no painel
      })
    });

    const status = authResp.status;
    const txt = await authResp.text(); // resposta bruta

    console.log("Resposta AUTH:", status, txt);

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.status(status).send(JSON.stringify({
      status,
      raw: txt
    }, null, 2));

  } catch (e) {
    console.error("Erro no teste_auth:", e);
    res.status(500).json({ error: e.message });
  }
}
