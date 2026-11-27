import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { ensureFirstMasterIfEmpty, findActiveLocalAdmin } from '../services/adminLocalService.js'

/**
 * Extrai token JWT do header Authorization Bearer ou dos cookies centrais do dass_auth.
 */
export function extractToken(req) {
  const authHeader = req.headers.authorization || ''
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim() || null
  }
  return req.cookies?.token || req.cookies?.adminToken || null
}

async function verifyWithDassAuth(token) {
  if (env.jwtSecret) {
    return jwt.verify(token, env.jwtSecret)
  }

  const res = await fetch(`${env.dassAuthUrl}/auth/me`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Cookie: `token=${token}`,
    },
  })

  if (!res.ok) {
    throw new Error('Token inválido no dass_auth')
  }

  const body = await res.json()
  if (body?.userData) {
    return JSON.parse(Buffer.from(body.userData, 'base64').toString('utf-8'))
  }
  return body?.data || body
}

export async function buildSessionUser(payload) {
  await ensureFirstMasterIfEmpty(payload)
  const localAdmin = await findActiveLocalAdmin(payload?.matricula, payload?.usuario)
  const isGlobalAdmin = Boolean(payload?.is_admin)
  const isLocalAdmin = Boolean(localAdmin)
  const isMaster = Boolean(localAdmin?.isMaster)
  const isAdmin = isGlobalAdmin || isLocalAdmin

  return {
    id: payload?.id ?? null,
    matricula: payload?.matricula || payload?.usuario || '',
    cracha: payload?.codbarras || payload?.matricula || payload?.usuario || '',
    usuario: payload?.usuario || '',
    nome: payload?.nome || payload?.usuario || 'Usuário',
    setor: payload?.setor || null,
    unidade: payload?.unidade || null,
    perfil: isMaster ? 'Master' : isAdmin ? 'Admin' : 'Operador',
    isMaster,
    isAdmin,
    isGlobalAdmin,
    isLocalAdmin,
  }
}

export async function requireAuth(req, res, next) {
  const token = extractToken(req)
  if (!token) {
    return res.status(401).json({
      message: 'Autenticação necessária para realizar esta operação.',
    })
  }

  try {
    const payload = await verifyWithDassAuth(token)
    req.user = await buildSessionUser(payload)
    return next()
  } catch {
    return res.status(401).json({
      message: 'Sessão expirada ou token inválido. Faça login novamente.',
    })
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: 'Autenticação necessária.' })
  }

  if (!req.user.isAdmin && !req.user.isGlobalAdmin) {
    return res.status(403).json({
      message: 'Acesso restrito a administradores.',
    })
  }

  return next()
}
