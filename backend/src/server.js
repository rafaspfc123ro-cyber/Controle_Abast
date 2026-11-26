import app from './app.js'
import { env } from './config/env.js'
import { getRegistros, getUsers } from './services/storage.js'

async function start() {
  // Ensures initial data files exist before accepting traffic.
  await Promise.all([getUsers(), getRegistros()])

  app.listen(env.port, () => {
    console.log(`ControlAbast API rodando em http://localhost:${env.port}/api`)
  })
}

start().catch((err) => {
  console.error('Falha ao iniciar o servidor:', err)
  process.exit(1)
})
