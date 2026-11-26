import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

/**
 * Extracts a Bearer token from the Authorization header when present.
 */
function extractBearerToken(req) {
  const header = req.headers.authorization || ''
  if (!header.startsWith('Bearer ')) return null
  return header.slice(7).trim() || null
}

/**
 * Validates any provided Bearer token without blocking anonymous requests.
 * Rejects malformed or expired tokens with 401 so clients clear stale sessions.
 */
export function authenticateOptional(req, res, next) {
  const token = extractBearerToken(req)
  if (!token) {
    req.user = null
    return next()
  }

  try {
    req.user = jwt.verify(token, env.jwtSecret)
    return next()
  } catch {
    return res.status(401).json({
      message: 'Sessão expirada ou token inválido. Faça login novamente.',
    })
  }
}

/**
 * Requires an authenticated user on the request.
 */
export function requireAuth(req, res, next) {
  const token = extractBearerToken(req)
  if (!token) {
    return res.status(401).json({
      message: 'Autenticação necessária para realizar esta operação.',
    })
  }

  try {
    req.user = jwt.verify(token, env.jwtSecret)
    return next()
  } catch {
    return res.status(401).json({
      message: 'Sessão expirada ou token inválido. Faça login novamente.',
    })
  }
}

/**
 * Requires an authenticated user with administrative privileges.
 */
export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      message: 'Autenticação necessária.',
    })
  }

  const perfil = String(req.user.perfil || req.user.role || '').toLowerCase()
  if (perfil === 'operador') {
    return res.status(403).json({
      message: 'Acesso restrito a administradores.',
    })
  }

  return next()
}
