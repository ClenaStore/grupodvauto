const authResp = await fetch("https://mercatto.varejofacil.com/api/v1/auth", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ chave: process.env.VAREJO_FACIL_API_KEY })
});

const txt = await authResp.text(); // pega como texto cru
console.log("Resposta do AUTH:", txt);

return res.status(200).send(txt); // <-- temporário, devolve o JSON puro
