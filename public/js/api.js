// ========== API HELPER ==========
// Wrapper padronizado para todas as requisições

async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!data.success) {
    throw new Error(data.message || "Erro na requisição");
  }

  return data;
}

// GET helper
async function apiGet(url) {
  return apiFetch(url);
}

// POST helper
async function apiPost(url, body) {
  return apiFetch(url, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// PUT helper
async function apiPut(url, body) {
  return apiFetch(url, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

// DELETE helper
async function apiDelete(url) {
  return apiFetch(url, { method: "DELETE" });
}
