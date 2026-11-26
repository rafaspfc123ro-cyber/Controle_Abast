// src/services/api.js
const RAW_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
export const API_BASE_URL = RAW_BASE_URL.replace(/\/+$/, '')

export const TOKEN_STORAGE_KEY = 'controlabast_token'
export const USER_STORAGE_KEY = 'controlabast_user'
const LEGACY_ADMIN_KEY = 'controlabast_admin_ativo'

let unauthorizedHandler = null

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = typeof handler === 'function' ? handler : null
}

export function clearStoredSession() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  localStorage.removeItem(USER_STORAGE_KEY)
  localStorage.removeItem(LEGACY_ADMIN_KEY)
}

export class ApiError extends Error {
  constructor(message, status = 0, data = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

function buildUrl(endpoint, params) {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const url = `${API_BASE_URL}${path}`
  if (!params || typeof params !== 'object') return url

  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value))
    }
  })

  const queryString = searchParams.toString()
  return queryString ? `${url}?${queryString}` : url
}

async function parseResponseBody(response) {
  if (response.status === 204) return null
  const contentType = response.headers.get('content-type') || ''
  const text = await response.text()
  if (!text) return null

  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(text)
    } catch {
      return text
    }
  }

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

async function request(endpoint, options = {}) {
  const { method = 'GET', body, headers = {}, params, signal } = options

  const requestHeaders = new Headers({
    Accept: 'application/json',
    ...headers,
  })

  const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_STORAGE_KEY) : null
  if (token && !requestHeaders.has('Authorization')) {
    requestHeaders.set('Authorization', `Bearer ${token}`)
  }

  let payload = body
  if (body !== undefined && body !== null && !(body instanceof FormData)) {
    if (!requestHeaders.has('Content-Type')) {
      requestHeaders.set('Content-Type', 'application/json')
    }
    if (typeof body !== 'string') {
      payload = JSON.stringify(body)
    }
  }

  const response = await fetch(buildUrl(endpoint, params), {
    method,
    headers: requestHeaders,
    body: method === 'GET' || method === 'HEAD' ? undefined : payload,
    signal,
  })

  const data = await parseResponseBody(response)

  if (response.status === 401) {
    clearStoredSession()
    if (unauthorizedHandler) {
      unauthorizedHandler()
    }
    const msg =
      (data && (data.message || data.error || data.msg)) ||
      'Sessão expirada ou não autorizada. Faça login novamente.'
    throw new ApiError(msg, 401, data)
  }

  if (!response.ok) {
    const msg =
      (data && typeof data === 'object' && (data.message || data.error || data.msg)) ||
      (typeof data === 'string' && data) ||
      `Erro na requisição (${response.status})`
    throw new ApiError(msg, response.status, data)
  }

  return data
}

export const api = {
  request,
  get: (endpoint, options = {}) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PUT', body }),
  patch: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PATCH', body }),
  delete: (endpoint, options = {}) => request(endpoint, { ...options, method: 'DELETE' }),
}

export default api
