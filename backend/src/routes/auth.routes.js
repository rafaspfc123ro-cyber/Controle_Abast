import { Router } from 'express'
import { env } from '../config/env.js'
import { buildSessionUser, requireAuth } from '../middlewares/auth.js'

const router = Router()

function decodeDassUserData(body) {
  if (body?.userData) {
    try {
      return JSON.parse(Buffer.from(body.userData, 'base64').toString('utf-8'))
    } catch {
      return null
    }
  }
  return body?.data || null
}

router.post('/login', async (req, res, next) => {
  try {
    const usuarioInput = String(req.body?.usuario || req.body?.cracha || '').trim()
    const senha = String(req.body?.senha || '')

    if (!usuarioInput || !senha) {
      return res.status(400).json({
        message: 'Informe o usuário e a senha do DASS Auth para autenticar.',
      })
    }

    const authResponse = await fetch(`${env.dassAuthUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        usuario: usuarioInput.toUpperCase(),
        senha,
      }),
    })

    if (!authResponse.ok) {
      const errorText = await authResponse.text()
      let message = 'Usuário ou senha inválidos.'
      try {
        const parsed = JSON.parse(errorText)
        message = parsed?.message || message
      } catch {
        if (errorText) message = errorText
      }
      return res.status(authResponse.status === 401 ? 401 : 400).json({ message })
    }

    const body = await authResponse.json()
    const token = body?.data?.token || body?.token
    const rawPayload = decodeDassUserData(body) || body?.data || {}

    if (!token) {
      return res.status(502).json({
        message: 'Resposta inválida do serviço de autenticação DASS.',
      })
    }

    const setCookies = authResponse.headers.getSetCookie?.() || []
    setCookies.forEach((cookie) => res.append('Set-Cookie', cookie))

    const usuario = await buildSessionUser(rawPayload)
    return res.status(200).json({ token, usuario })
  } catch (err) {
    if (err?.cause?.code === 'ECONNREFUSED') {
      return res.status(503).json({
        message: 'Serviço DASS Auth indisponível no momento.',
      })
    }
    return next(err)
  }
})

router.get('/me', requireAuth, (req, res) => {
  return res.status(200).json({ usuario: req.user })
})

router.post('/logout', (_req, res) => {
  res.clearCookie('token')
  res.clearCookie('refreshToken')
  return res.status(200).json({ message: 'Sessão encerrada com sucesso.' })
})

export default router
