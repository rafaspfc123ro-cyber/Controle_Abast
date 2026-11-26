import { EntitySchema } from 'typeorm'
import { env } from '../../config/env.js'

export const RegistroEntity = new EntitySchema({
  name: 'Registro',
  tableName: 'registros',
  schema: env.dbSchema,
  columns: {
    id: {
      type: 'int',
      primary: true,
      generated: true,
    },
    tipo: {
      type: 'varchar',
      length: 30,
      nullable: false,
    },
    dataHora: {
      name: 'data_hora',
      type: 'varchar',
      length: 20,
      nullable: false,
    },
    cracha: {
      type: 'varchar',
      length: 60,
      nullable: false,
    },
    matricula: {
      type: 'varchar',
      length: 40,
      nullable: true,
    },
    nome: {
      type: 'varchar',
      length: 180,
      nullable: false,
    },
    marca: {
      type: 'varchar',
      length: 120,
      nullable: false,
    },
    celula: {
      type: 'varchar',
      length: 120,
      nullable: false,
    },
    produto: {
      type: 'varchar',
      length: 160,
      nullable: false,
    },
    qtd: {
      type: 'numeric',
      precision: 12,
      scale: 3,
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
    valorTotal: {
      name: 'valor_total',
      type: 'numeric',
      precision: 14,
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
