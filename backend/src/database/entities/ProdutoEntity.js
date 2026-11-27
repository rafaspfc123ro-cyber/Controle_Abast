import { EntitySchema } from 'typeorm'
import { env } from '../../config/env.js'

export const ProdutoEntity = new EntitySchema({
  name: 'Produto',
  tableName: 'produtos',
  schema: env.dbSchema,
  columns: {
    id: {
      type: 'int',
      primary: true,
      generated: true,
    },
    nome: {
      type: 'varchar',
      length: 160,
      unique: true,
      nullable: false,
    },
    valorUnitario: {
      name: 'valor_unitario',
      type: 'numeric',
      precision: 12,
      scale: 4,
      default: 0,
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
