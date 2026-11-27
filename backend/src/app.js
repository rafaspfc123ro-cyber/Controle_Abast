import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { Router } from 'express'
import { env } from './config/env.js'
import adminsRoutes from './routes/admins.routes.js'
import authRoutes from './routes/auth.routes.js'
import cadastrosRoutes from './routes/cadastros.routes.js'
import colaboradoresRoutes from './routes/colaboradores.routes.js'
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

app.use(cookieParser())
app.use(express.json({ limit: '5mb' }))

const apiRouter = Router()

apiRouter.get('/health', (_req, res) => {
  res.status(200).json({ ok: true, service: 'controle-abast-backend' })
})

apiRouter.use('/auth', authRoutes)
apiRouter.use('/admins', adminsRoutes)
apiRouter.use('/cadastros', cadastrosRoutes)
apiRouter.use('/colaboradores', colaboradoresRoutes)
apiRouter.use('/registros', registrosRoutes)

// Monta em /api (acesso direto) e em / (quando roteado pelo API Gateway que remove /api/controle-abast)
app.use('/api', apiRouter)
app.use('/', apiRouter)

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
