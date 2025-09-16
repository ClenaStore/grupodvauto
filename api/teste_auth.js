// pages/api/teste_auth.js
export default async function handler(req, res) {
  const url = "https://mercatto.varejofacil.com/api/v1/auth";

  // Pega credenciais do .env
  const key     = process.env.VAREJO_FACIL_API_KEY || "";
  const client  = process.env.VAREJO_FACIL_CLIENT_ID || "";
  const secret  = process.env.VAREJO_FACIL_CLIENT_SECRET || "";

  // Três possíveis formatos que a API pode aceitar
  const payloads = [
    { chave: key },                       // formato 1
    { api_key: key },                     // formato 2
    { client_id: client, client_secret: secret } // formato 3
  ];

  const results = [];

  for (let i = 0; i < payloads.length; i++) {
    try {
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloads[i])
      });

      const raw = await r.text(); // pega resposta mesmo se não for JSON
      let json = null;
      try { json = JSON.parse(raw); } catch(e) {}

      results.push({
        tentativa: i + 1,
        status: r.status,
        enviado: payloads[i],
        resposta: json || raw
      });

      if (r.ok) break; // se deu certo, não precisa continuar testando
    } catch (e) {
      results.push({
        tentativa: i + 1,
        erro: e.message
      });
    }
  }

  res.status(200).json({ resultados: results });
}
