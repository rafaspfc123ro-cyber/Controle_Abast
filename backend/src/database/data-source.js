import { DataSource } from 'typeorm'
import { env } from '../config/env.js'
import { AdminLocalEntity } from './entities/AdminLocalEntity.js'
import { CelulaEntity } from './entities/CelulaEntity.js'
import { MarcaEntity } from './entities/MarcaEntity.js'
import { ProdutoEntity } from './entities/ProdutoEntity.js'
import { RegistroEntity } from './entities/RegistroEntity.js'
import { CreateControleAbastSchema1732630000000 } from './migrations/1732630000000-CreateControleAbastSchema.js'
import { EnsureMarcasLogoColumn1732631000000 } from './migrations/1732631000000-EnsureMarcasLogoColumn.js'

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: env.databaseUrl,
  schema: env.dbSchema,
  synchronize: false,
  logging: false,
  entities: [MarcaEntity, CelulaEntity, ProdutoEntity, RegistroEntity, AdminLocalEntity],
  migrations: [CreateControleAbastSchema1732630000000, EnsureMarcasLogoColumn1732631000000],
  migrationsTableName: 'typeorm_migrations',
  extra: {
    max: env.dbPoolMax,
    idleTimeoutMillis: env.dbPoolIdleTimeoutMs,
    connectionTimeoutMillis: env.dbPoolConnTimeoutMs,
  },
})
