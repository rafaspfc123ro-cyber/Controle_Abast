import cors from 'cors'
import express from 'express'
import { env } from './config/env.js'
import authRoutes from './routes/auth.routes.js'
import registrosRoutes from './routes/registros.routes.js'

const app = express()

const allowedOrigins = env.corsOrigin
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(
  cors({
    origin: allowedOrigins.length === 0 || allowedOrigins.includes('*') ? true : allowedOrigins,
    credentials: true,
  }),
)

app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.status(200).json({ ok: true, service: 'controle-abast-backend' })
})

app.use('/api/auth', authRoutes)
app.use('/api/registros', registrosRoutes)

app.use((_req, res) => {
  res.status(404).json({ message: 'Rota não encontrada.' })
})

app.use((err, _req, res, _next) => {
  console.error('[API Error]', err)
  const status = err?.status || 500
  const message = status >= 500 ? 'Erro interno no servidor.' : err.message
  res.status(status).json({ message })
})

export default app
