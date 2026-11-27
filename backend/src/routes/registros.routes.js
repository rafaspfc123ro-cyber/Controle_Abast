import { Router } from 'express'
import { AppDataSource } from '../database/data-source.js'
import { RegistroEntity } from '../database/entities/RegistroEntity.js'
import { requireAdmin, requireAuth } from '../middlewares/auth.js'
import { identificarColaborador } from '../services/colaboradorService.js'

const router = Router()

function formatRegistro(entity) {
  return {
    id: entity.id,
    tipo: entity.tipo,
    dataHora: entity.dataHora,
    cracha: entity.cracha,
    matricula: entity.matricula || entity.cracha,
    nome: entity.nome,
    marca: entity.marca,
    celula: entity.celula,
    produto: entity.produto,
    qtd: Number(entity.qtd),
    valorUnitario: Number(entity.valorUnitario),
    valorTotal: Number(entity.valorTotal),
  }
}

function buildRegistroPayload(body, existing = {}) {
  const cracha = String(body.cracha ?? existing.cracha ?? '').trim()
  const celula = String(body.celula ?? existing.celula ?? '')
    .trim()
    .toUpperCase()
  const produto = String(body.produto ?? existing.produto ?? '').trim()
  const marca = String(body.marca ?? existing.marca ?? '')
    .trim()
    .toUpperCase()
  const tipo = String(body.tipo ?? existing.tipo ?? '').trim()
  const dataHora = String(body.dataHora ?? existing.dataHora ?? '').trim()
  const qtd = Number(body.qtd ?? existing.qtd ?? 0)
  const valorUnitario = Number(body.valorUnitario ?? existing.valorUnitario ?? 0)
  const valorTotal = Number(body.valorTotal ?? existing.valorTotal ?? 0)
  const nome =
    String(body.nome ?? existing.nome ?? '').trim() || (cracha ? `Crachá ${cracha}` : '')
  const matricula = String(body.matricula ?? existing.matricula ?? '').trim() || null

  return {
    tipo,
    dataHora,
    cracha,
    matricula,
    nome,
    marca,
    celula,
    produto,
    qtd,
    valorUnitario: Number.isFinite(valorUnitario) ? valorUnitario : 0,
    valorTotal: Number.isFinite(valorTotal) ? valorTotal : 0,
  }
}

function validateRegistro(payload) {
  if (!['Abastecimento', 'Resíduo'].includes(payload.tipo)) {
    return 'Campo "tipo" deve ser "Abastecimento" ou "Resíduo".'
  }
  if (!payload.dataHora) return 'Campo "dataHora" é obrigatório.'
  if (!payload.celula) return 'Campo "celula" é obrigatório.'
  if (!payload.produto) return 'Campo "produto" é obrigatório.'
  if (!payload.cracha) return 'Campo "cracha" é obrigatório.'
  if (!Number.isFinite(payload.qtd) || payload.qtd <= 0) {
    return 'Campo "qtd" deve ser um número maior que zero.'
  }
  return null
}

router.get('/', async (req, res, next) => {
  try {
    const repo = AppDataSource.getRepository(RegistroEntity)
    const qb = repo.createQueryBuilder('r').orderBy('r.id', 'DESC')

    const { tipo, marca, celula, cracha, produto } = req.query
    if (tipo) qb.andWhere('LOWER(r.tipo) = LOWER(:tipo)', { tipo: String(tipo) })
    if (marca) qb.andWhere('LOWER(r.marca) = LOWER(:marca)', { marca: String(marca) })
    if (celula) qb.andWhere('LOWER(r.celula) = LOWER(:celula)', { celula: String(celula) })
    if (cracha) {
      qb.andWhere('(TRIM(r.cracha) = :cracha OR TRIM(r.matricula) = :cracha)', {
        cracha: String(cracha).trim(),
      })
    }
    if (produto) {
      qb.andWhere('LOWER(r.produto) LIKE LOWER(:produto)', {
        produto: `%${String(produto)}%`,
      })
    }

    const rows = await qb.getMany()
    return res.status(200).json(rows.map(formatRegistro))
  } catch (err) {
    return next(err)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const payload = buildRegistroPayload(req.body || {})
    const validationError = validateRegistro(payload)
    if (validationError) {
      return res.status(400).json({ message: validationError })
    }

    // Identifica o operador no schema legado `colaborador` (matrícula / crachá / RFID)
    const colab = await identificarColaborador(payload.cracha)
    if (colab) {
      payload.matricula = colab.matricula || payload.matricula || payload.cracha
      if (colab.nome) {
        payload.nome = colab.nome
      }
    } else if (!payload.matricula) {
      payload.matricula = payload.cracha
    }

    const repo = AppDataSource.getRepository(RegistroEntity)
    const created = repo.create(payload)
    const saved = await repo.save(created)

    return res.status(201).json(formatRegistro(saved))
  } catch (err) {
    return next(err)
  }
})

router.put('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) {
      return res.status(400).json({ message: 'ID inválido.' })
    }

    const repo = AppDataSource.getRepository(RegistroEntity)
    const existing = await repo.findOne({ where: { id } })
    if (!existing) {
      return res.status(404).json({ message: 'Registro não encontrado.' })
    }

    const updatedPayload = buildRegistroPayload(req.body || {}, existing)
    const validationError = validateRegistro(updatedPayload)
    if (validationError) {
      return res.status(400).json({ message: validationError })
    }

    if (req.body?.cracha && req.body.cracha !== existing.cracha) {
      const colab = await identificarColaborador(updatedPayload.cracha)
      if (colab) {
        updatedPayload.matricula = colab.matricula || updatedPayload.cracha
        if (colab.nome) updatedPayload.nome = colab.nome
      }
    }

    repo.merge(existing, updatedPayload)
    const saved = await repo.save(existing)

    return res.status(200).json(formatRegistro(saved))
  } catch (err) {
    return next(err)
  }
})

router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) {
      return res.status(400).json({ message: 'ID inválido.' })
    }

    const repo = AppDataSource.getRepository(RegistroEntity)
    const existing = await repo.findOne({ where: { id } })
    if (!existing) {
      return res.status(404).json({ message: 'Registro não encontrado.' })
    }

    await repo.remove(existing)
    return res.status(200).json({ message: 'Lançamento excluído com sucesso.' })
  } catch (err) {
    return next(err)
  }
})

export default router
