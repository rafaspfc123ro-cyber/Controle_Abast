import pg from 'pg'
import { env } from '../config/env.js'
import { AppDataSource } from './data-source.js'

const MIGRATION_LOCK_KEY = 2093847462

async function ensureSchema() {
  const client = new pg.Client({ connectionString: env.databaseUrl })
  await client.connect()
  try {
    await client.query(`CREATE SCHEMA IF NOT EXISTS "${env.dbSchema}"`)
  } finally {
    await client.end()
  }
}

async function run() {
  const action = process.argv[2] || 'up'
  await ensureSchema()
  await AppDataSource.initialize()

  const queryRunner = AppDataSource.createQueryRunner()
  await queryRunner.connect()
  await queryRunner.startTransaction()

  try {
    await queryRunner.query(`SELECT pg_advisory_xact_lock(CAST($1 AS bigint))`, [
      MIGRATION_LOCK_KEY,
    ])
    await queryRunner.commitTransaction()
  } catch (err) {
    await queryRunner.rollbackTransaction()
    throw err
  } finally {
    await queryRunner.release()
  }

  try {
    if (action === 'revert') {
      await AppDataSource.undoLastMigration()
      console.log('[DB] Última migration revertida com sucesso.')
    } else {
      const executed = await AppDataSource.runMigrations()
      console.log(
        `[DB] Migrations concluídas (${executed.length} executada(s)) no schema "${env.dbSchema}".`,
      )
    }
  } finally {
    await AppDataSource.destroy()
  }
}

run().catch((err) => {
  console.error('[DB] Falha ao executar migrations:', err)
  process.exit(1)
})
