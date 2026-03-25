const API_BASE = '/api'

function getToken() {
  return localStorage.getItem('paotabs_token')
}

export function setToken(token) {
  if (token) localStorage.setItem('paotabs_token', token)
  else localStorage.removeItem('paotabs_token')
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    return { data: null, error: { message: data.error || `Request failed (${res.status})` } }
  }
  return { data, error: null }
}

export const api = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
}
