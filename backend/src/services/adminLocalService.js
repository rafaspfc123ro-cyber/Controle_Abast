import { AppDataSource } from '../database/data-source.js'
import { AdminLocalEntity } from '../database/entities/AdminLocalEntity.js'

function getRepo() {
  return AppDataSource.getRepository(AdminLocalEntity)
}

/**
 * Se não existir nenhum administrador local cadastrado, promove o primeiro usuário
 * autenticado via dass_auth a Admin Master automaticamente.
 */
export async function ensureFirstMasterIfEmpty(userPayload) {
  const repo = getRepo()
  const total = await repo.count()
  if (total > 0) return null

  const matricula = String(userPayload?.matricula || userPayload?.usuario || '').trim()
  if (!matricula) return null

  const novoMaster = repo.create({
    matricula,
    usuario: userPayload?.usuario ? String(userPayload.usuario).trim() : null,
    nome: String(userPayload?.nome || userPayload?.usuario || matricula).trim(),
    perfil: 'Master',
    isMaster: true,
    ativo: true,
  })

  return repo.save(novoMaster)
}

export async function findActiveLocalAdmin(matricula, usuario = null) {
  const repo = getRepo()
  const mat = String(matricula || '').trim()
  if (mat) {
    const byMat = await repo.findOne({ where: { matricula: mat, ativo: true } })
    if (byMat) return byMat
  }
  const usr = String(usuario || '').trim()
  if (usr) {
    return repo.findOne({ where: { usuario: usr, ativo: true } })
  }
  return null
}

export async function listLocalAdmins() {
  const repo = getRepo()
  return repo.find({
    where: { ativo: true },
    order: { isMaster: 'DESC', nome: 'ASC' },
  })
}

export async function addLocalAdmin({ matricula, usuario = null, nome }) {
  const repo = getRepo()
  const mat = String(matricula || '').trim()
  const nom = String(nome || '').trim()

  const existing = await repo.findOne({ where: { matricula: mat } })
  if (existing && existing.ativo) {
    return { ok: false, status: 409, message: 'Esta matrícula já possui permissão de administrador.' }
  }

  if (existing && !existing.ativo) {
    existing.ativo = true
    existing.nome = nom || existing.nome
    existing.usuario = usuario || existing.usuario
    const saved = await repo.save(existing)
    return { ok: true, admin: saved }
  }

  const created = repo.create({
    matricula: mat,
    usuario: usuario ? String(usuario).trim() : null,
    nome: nom,
    perfil: 'Admin',
    isMaster: false,
    ativo: true,
  })

  const saved = await repo.save(created)
  return { ok: true, admin: saved }
}

export async function removeLocalAdmin(matricula) {
  const repo = getRepo()
  const mat = String(matricula || '').trim()
  const existing = await repo.findOne({ where: { matricula: mat, ativo: true } })

  if (!existing) {
    return { ok: false, status: 404, message: 'Administrador não encontrado.' }
  }

  if (existing.isMaster) {
    return {
      ok: false,
      status: 403,
      message: 'O administrador Master não pode ter sua permissão revogada.',
    }
  }

  await repo.remove(existing)
  return { ok: true, removed: existing }
}
