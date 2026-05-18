const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8083'
const ACCESS_KEY = 'gespa_access_token'
const REFRESH_KEY = 'gespa_refresh_token'

export function getAuth() {
  return {
    accessToken: localStorage.getItem(ACCESS_KEY),
    refreshToken: localStorage.getItem(REFRESH_KEY),
  }
}

export function setAuth({ accessToken, refreshToken }) {
  if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken)
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken)
}

export function clearAuth() {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

function notifyAuthExpired() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('gespa:auth-expired'))
  }
}

async function request(path, options = {}, retry = true) {
  const { accessToken, refreshToken } = getAuth()
  const hasBody = options.body !== undefined && options.body !== null
  const isBodyString = typeof options.body === 'string'
  const isBodyFormData = typeof FormData !== 'undefined' && options.body instanceof FormData
  const isBodyBlob = typeof Blob !== 'undefined' && options.body instanceof Blob
  const requestBody = hasBody && !isBodyString && !isBodyFormData && !isBodyBlob
    ? JSON.stringify(options.body)
    : options.body
  const headers = {
    Accept: 'application/json',
    ...(options.headers || {}),
  }

  if (hasBody && !headers['Content-Type'] && !headers['content-type']) {
    headers['Content-Type'] = 'application/json'
  }

  if (accessToken && !headers.Authorization) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body: requestBody,
  })

  if (response.status === 401 && retry && refreshToken && !path.startsWith('/api/auth/')) {
    const refreshed = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })

    if (refreshed.ok) {
      const authPayload = await refreshed.json()
      setAuth({ accessToken: authPayload.accessToken, refreshToken: authPayload.refreshToken })
      return request(path, options, false)
    }

    clearAuth()
    notifyAuthExpired()
  } else if (response.status === 401 && !path.startsWith('/api/auth/')) {
    clearAuth()
    notifyAuthExpired()
  }

  if (response.status === 204) return null

  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  if (!response.ok) {
    const detail = data?.details?.length ? ` (${data.details[0]})` : ''
    const message = data?.message || data?.error || `Error HTTP ${response.status}`
    throw new Error(`${message}${detail}`)
  }

  return data
}

export const apiClient = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  delete: (path) => request(path, { method: 'DELETE' }),
}
