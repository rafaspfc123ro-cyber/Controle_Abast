import { env } from '../../config/env.js'

export class EnsureMarcasLogoColumn1732631000000 {
  name = 'EnsureMarcasLogoColumn1732631000000'

  async up(queryRunner) {
    const s = `"${env.dbSchema}"`
    await queryRunner.query(
      `ALTER TABLE ${s}.marcas ADD COLUMN IF NOT EXISTS logo_data_url TEXT NULL`,
    )
  }

  async down(queryRunner) {
    const s = `"${env.dbSchema}"`
    await queryRunner.query(`ALTER TABLE ${s}.marcas DROP COLUMN IF EXISTS logo_data_url`)
  }
}
