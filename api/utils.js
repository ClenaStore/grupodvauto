let cache = {
  accessToken: null,
  refreshToken: null,
  expiresAt: 0
};

export async function getToken() {
  const agora = Date.now();

  // Se já tem token válido
  if (cache.accessToken && agora < cache.expiresAt) {
    return cache.accessToken;
  }

  // Se tem refreshToken, tenta renovar
  if (cache.refreshToken) {
    const refreshed = await refreshToken(cache.refreshToken);
    if (refreshed) return cache.accessToken;
  }

  // Se não tem, faz login
  await login();
  return cache.accessToken;
}

async function login() {
  const resp = await fetch("https://mercatto.varejofacil.com/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: process.env.VAREJO_USER,
      password: process.env.VAREJO_PASS
    })
  });

  if (!resp.ok) throw new Error("Falha no login");

  const data = await resp.json();
  cache.accessToken = data.accessToken;
  cache.refreshToken = data.refreshToken;
  cache.expiresAt = Date.now() + (data.expiresIn || 3600) * 1000; // default 1h
}

async function refreshToken(refreshToken) {
  const resp = await fetch("https://mercatto.varejofacil.com/api/auth/refresh", {
    method: "GET",
    headers: { Authorization: refreshToken }
  });

  if (!resp.ok) {
    cache = { accessToken: null, refreshToken: null, expiresAt: 0 };
    return false;
  }

  const data = await resp.json();
  cache.accessToken = data.accessToken;
  cache.refreshToken = data.refreshToken || refreshToken;
  cache.expiresAt = Date.now() + (data.expiresIn || 3600) * 1000;
  return true;
}
