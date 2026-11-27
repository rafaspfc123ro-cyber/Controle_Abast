import { EntitySchema } from 'typeorm'
import { env } from '../../config/env.js'

export const CelulaEntity = new EntitySchema({
  name: 'Celula',
  tableName: 'celulas',
  schema: env.dbSchema,
  columns: {
    id: {
      type: 'int',
      primary: true,
      generated: true,
    },
    nome: {
      type: 'varchar',
      length: 120,
      unique: true,
      nullable: false,
    },
    createdAt: {
      name: 'created_at',
      type: 'timestamptz',
      createDate: true,
    },
    updatedAt: {
      name: 'updated_at',
      type: 'timestamptz',
      updateDate: true,
    },
  },
})
