// /api/teste_auth.js
export default async function handler(req, res) {
  try {
    const authResp = await fetch("https://mercatto.varejofacil.com/api/v1/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chave: process.env.VAREJO_FACIL_API_KEY // 👈 sua chave do painel
      })
    });

    const txt = await authResp.text(); // pega a resposta bruta
    console.log("Resposta AUTH:", txt);

    // Tenta converter para JSON, se não der, retorna como texto
    try {
      const json = JSON.parse(txt);
      return res.status(200).json(json);
    } catch (e) {
      return res.status(200).send(txt);
    }

  } catch (e) {
    console.error("Erro no teste_auth:", e);
    res.status(500).json({ error: e.message });
  }
}
