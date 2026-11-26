import { EntitySchema } from 'typeorm'
import { env } from '../../config/env.js'

export const MarcaEntity = new EntitySchema({
  name: 'Marca',
  tableName: 'marcas',
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
    logoDataUrl: {
      name: 'logo_data_url',
      type: 'text',
      nullable: true,
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
