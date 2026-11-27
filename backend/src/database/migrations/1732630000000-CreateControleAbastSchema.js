import { env } from '../../config/env.js'

export class CreateControleAbastSchema1732630000000 {
  name = 'CreateControleAbastSchema1732630000000'

  async up(queryRunner) {
    const s = `"${env.dbSchema}"`
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS ${s}`)

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS ${s}.marcas (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(120) NOT NULL UNIQUE,
        logo_data_url TEXT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS ${s}.celulas (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(120) NOT NULL UNIQUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS ${s}.produtos (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(160) NOT NULL UNIQUE,
        valor_unitario NUMERIC(12, 4) NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS ${s}.registros (
        id SERIAL PRIMARY KEY,
        tipo VARCHAR(30) NOT NULL,
        data_hora VARCHAR(20) NOT NULL,
        cracha VARCHAR(60) NOT NULL,
        matricula VARCHAR(40) NULL,
        nome VARCHAR(180) NOT NULL,
        marca VARCHAR(120) NOT NULL,
        celula VARCHAR(120) NOT NULL,
        produto VARCHAR(160) NOT NULL,
        qtd NUMERIC(12, 3) NOT NULL,
        valor_unitario NUMERIC(12, 4) NOT NULL DEFAULT 0,
        valor_total NUMERIC(14, 4) NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_registros_tipo ON ${s}.registros (tipo)`,
    )
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_registros_marca ON ${s}.registros (marca)`,
    )
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_registros_matricula ON ${s}.registros (matricula)`,
    )
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_registros_data_hora ON ${s}.registros (data_hora)`,
    )

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS ${s}.admins_locais (
        id SERIAL PRIMARY KEY,
        matricula VARCHAR(40) NOT NULL UNIQUE,
        usuario VARCHAR(100) NULL,
        nome VARCHAR(180) NOT NULL,
        perfil VARCHAR(40) NOT NULL DEFAULT 'Admin',
        is_master BOOLEAN NOT NULL DEFAULT FALSE,
        ativo BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)
  }

  async down(queryRunner) {
    const s = `"${env.dbSchema}"`
    await queryRunner.query(`DROP TABLE IF EXISTS ${s}.admins_locais`)
    await queryRunner.query(`DROP TABLE IF EXISTS ${s}.registros`)
    await queryRunner.query(`DROP TABLE IF EXISTS ${s}.produtos`)
    await queryRunner.query(`DROP TABLE IF EXISTS ${s}.celulas`)
    await queryRunner.query(`DROP TABLE IF EXISTS ${s}.marcas`)
  }
}
