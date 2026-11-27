import { EntitySchema } from 'typeorm'
import { env } from '../../config/env.js'

export const AdminLocalEntity = new EntitySchema({
  name: 'AdminLocal',
  tableName: 'admins_locais',
  schema: env.dbSchema,
  columns: {
    id: {
      type: 'int',
      primary: true,
      generated: true,
    },
    matricula: {
      type: 'varchar',
      length: 40,
      unique: true,
      nullable: false,
    },
    usuario: {
      type: 'varchar',
      length: 100,
      nullable: true,
    },
    nome: {
      type: 'varchar',
      length: 180,
      nullable: false,
    },
    perfil: {
      type: 'varchar',
      length: 40,
      default: 'Admin',
      nullable: false,
    },
    isMaster: {
      name: 'is_master',
      type: 'boolean',
      default: false,
      nullable: false,
    },
    ativo: {
      type: 'boolean',
      default: true,
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
