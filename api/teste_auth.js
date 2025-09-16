export default async function handler(req, res) {
  try {
    const chave = process.env.VAREJO_FACIL_API_KEY; // sua chave cadastrada no painel do Varejo Fácil

    const response = await fetch("https://mercatto.varejofacil.com/api/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ chave })
    });

    const data = await response.json();

    res.status(response.status).json(data);

  } catch (error) {
    res.status(500).json({ error: "Erro ao autenticar", details: error.message });
  }
}
