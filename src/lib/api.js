const API_BASE = '/api'

function getToken() {
  return localStorage.getItem('paotabs_token')
}

export function setToken(token) {
  if (token) localStorage.setItem('paotabs_token', token)
  else localStorage.removeItem('paotabs_token')
}

async function request(path, options = {}, retries = 2) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers.Authorization = `Bearer ${token}`

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 15000)

      const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
        signal: controller.signal,
      })
      clearTimeout(timeout)

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        if (res.status >= 500 && attempt < retries) {
          await new Promise(r => setTimeout(r, 500 * (attempt + 1)))
          continue
        }
        return { data: null, error: { message: data.error || `Request failed (${res.status})` } }
      }
      return { data, error: null }
    } catch (err) {
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 500 * (attempt + 1)))
        continue
      }
      const message = err.name === 'AbortError'
        ? 'Request timed out. Please check your connection.'
        : 'Network error. Please check your connection.'
      return { data: null, error: { message } }
    }
  }
  return { data: null, error: { message: 'Request failed. Please try again.' } }
}

export const api = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
}
