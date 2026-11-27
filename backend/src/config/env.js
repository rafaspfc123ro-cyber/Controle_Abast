import 'dotenv/config'

const databaseUrl = process.env.DATABASE_URL?.trim()
if (!databaseUrl) {
  throw new Error('FATAL: DATABASE_URL é obrigatória para conectar ao PostgreSQL.')
}

const dbSchema = (process.env.DB_SCHEMA || 'controle_abast').trim()
if (!/^[a-z_][a-z0-9_]*$/i.test(dbSchema)) {
  throw new Error(`FATAL: DB_SCHEMA inválido: "${dbSchema}"`)
}

export const env = {
  port: Number(process.env.PORT) || 3000,
  databaseUrl,
  dbSchema,
  dbPoolMax: Number(process.env.DB_POOL_MAX || 20),
  dbPoolIdleTimeoutMs: Number(process.env.DB_POOL_IDLE_TIMEOUT_MS || 30000),
  dbPoolConnTimeoutMs: Number(process.env.DB_POOL_CONN_TIMEOUT_MS || 5000),
  dassAuthUrl: (process.env.DASS_AUTH_URL || 'http://localhost:2123').replace(/\/+$/, ''),
  jwtSecret: process.env.JWT_SECRET || '',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
}
