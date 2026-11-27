import app from './app.js'
import { env } from './config/env.js'
import { AppDataSource } from './database/data-source.js'

async function start() {
  await AppDataSource.initialize()

  app.listen(env.port, '0.0.0.0', () => {
    console.log(
      `ControlAbast API rodando em http://0.0.0.0:${env.port}/api (schema: ${env.dbSchema})`,
    )
  })
}

start().catch((err) => {
  console.error('Falha ao iniciar o servidor:', err)
  process.exit(1)
})
