import { Router } from 'express'
import { authenticateOptional, requireAdmin, requireAuth } from '../middlewares/auth.js'
import { getRegistros, saveRegistros } from '../services/storage.js'

const router = Router()

function buildRegistroPayload(body, existing = {}) {
  const cracha = String(body.cracha ?? existing.cracha ?? '').trim()
  const celula = String(body.celula ?? existing.celula ?? '')
    .trim()
    .toUpperCase()
  const produto = String(body.produto ?? existing.produto ?? '').trim()
  const marca = String(body.marca ?? existing.marca ?? '').trim()
  const tipo = String(body.tipo ?? existing.tipo ?? '').trim()
  const dataHora = String(body.dataHora ?? existing.dataHora ?? '').trim()
  const qtd = Number(body.qtd ?? existing.qtd ?? 0)
  const valorUnitario = Number(body.valorUnitario ?? existing.valorUnitario ?? 0)
  const valorTotal = Number(body.valorTotal ?? existing.valorTotal ?? 0)
  const nome =
    String(body.nome ?? existing.nome ?? '').trim() || (cracha ? `Crachá ${cracha}` : '')

  return {
    tipo,
    dataHora,
    cracha,
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
  if (!payload.dataHora) {
    return 'Campo "dataHora" é obrigatório.'
  }
  if (!payload.celula) {
    return 'Campo "celula" é obrigatório.'
  }
  if (!payload.produto) {
    return 'Campo "produto" é obrigatório.'
  }
  if (!payload.cracha) {
    return 'Campo "cracha" é obrigatório.'
  }
  if (!Number.isFinite(payload.qtd) || payload.qtd <= 0) {
    return 'Campo "qtd" deve ser um número maior que zero.'
  }
  return null
}

router.get('/', authenticateOptional, async (req, res, next) => {
  try {
    const registros = await getRegistros()
    const { tipo, marca, celula, cracha, produto } = req.query

    const filtrados = registros.filter((item) => {
      if (tipo && String(item.tipo).toLowerCase() !== String(tipo).toLowerCase()) return false
      if (marca && String(item.marca).toLowerCase() !== String(marca).toLowerCase()) return false
      if (celula && String(item.celula).toLowerCase() !== String(celula).toLowerCase()) return false
      if (cracha && String(item.cracha).trim() !== String(cracha).trim()) return false
      if (produto && !String(item.produto).toLowerCase().includes(String(produto).toLowerCase())) {
        return false
      }
      return true
    })

    return res.status(200).json(filtrados)
  } catch (err) {
    return next(err)
  }
})

router.post('/', authenticateOptional, async (req, res, next) => {
  try {
    const payload = buildRegistroPayload(req.body || {})
    const validationError = validateRegistro(payload)
    if (validationError) {
      return res.status(400).json({ message: validationError })
    }

    const registros = await getRegistros()
    const maxId = registros.reduce((max, item) => {
      const num = Number(item.id)
      return Number.isFinite(num) && num > max ? num : max
    }, 0)

    const novoRegistro = {
      id: maxId + 1,
      ...payload,
    }

    registros.unshift(novoRegistro)
    await saveRegistros(registros)

    return res.status(201).json(novoRegistro)
  } catch (err) {
    return next(err)
  }
})

router.put('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params
    const registros = await getRegistros()
    const index = registros.findIndex((item) => String(item.id) === String(id))

    if (index === -1) {
      return res.status(404).json({ message: 'Registro não encontrado.' })
    }

    const atualizadoPayload = buildRegistroPayload(req.body || {}, registros[index])
    const validationError = validateRegistro(atualizadoPayload)
    if (validationError) {
      return res.status(400).json({ message: validationError })
    }

    const registroAtualizado = {
      ...registros[index],
      ...atualizadoPayload,
    }

    registros[index] = registroAtualizado
    await saveRegistros(registros)

    return res.status(200).json(registroAtualizado)
  } catch (err) {
    return next(err)
  }
})

router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params
    const registros = await getRegistros()
    const index = registros.findIndex((item) => String(item.id) === String(id))

    if (index === -1) {
      return res.status(404).json({ message: 'Registro não encontrado.' })
    }

    registros.splice(index, 1)
    await saveRegistros(registros)

    return res.status(200).json({ message: 'Lançamento excluído com sucesso.' })
  } catch (err) {
    return next(err)
  }
})

export default router
