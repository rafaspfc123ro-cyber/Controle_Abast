import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { requireAuth } from '../middlewares/auth.js'
import { getUsers } from '../services/storage.js'
import { verifyPassword } from '../utils/password.js'

const router = Router()

function sanitizeUser(user) {
  return {
    id: user.id,
    cracha: user.cracha,
    nome: user.nome,
    perfil: user.perfil,
    isMaster: Boolean(user.isMaster),
  }
}

router.post('/login', async (req, res, next) => {
  try {
    const cracha = String(req.body?.cracha || '').trim()
    const senha = String(req.body?.senha || '')

    if (!cracha || !senha) {
      return res.status(400).json({
        message: 'Informe o crachá e a senha para autenticar.',
      })
    }

    const users = await getUsers()
    const user = users.find((u) => String(u.cracha).trim() === cracha)

    if (!user || !verifyPassword(senha, user.passwordHash)) {
      return res.status(401).json({
        message: 'Crachá ou senha inválidos.',
      })
    }

    const usuario = sanitizeUser(user)
    const token = jwt.sign(usuario, env.jwtSecret, {
      expiresIn: env.jwtExpiresIn,
    })

    return res.status(200).json({ token, usuario })
  } catch (err) {
    return next(err)
  }
})

router.get('/me', requireAuth, (req, res) => {
  return res.status(200).json({ usuario: req.user })
})

export default router
