import 'dotenv/config'

export const env = {
  port: Number(process.env.PORT) || 3000,
  jwtSecret: process.env.JWT_SECRET || 'controlabast-dev-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '12h',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  defaultMasterPassword: process.env.DEFAULT_MASTER_PASSWORD || '123456',
}
