import { Router } from 'express'
import { AppDataSource } from '../database/data-source.js'
import { CelulaEntity } from '../database/entities/CelulaEntity.js'
import { MarcaEntity } from '../database/entities/MarcaEntity.js'
import { ProdutoEntity } from '../database/entities/ProdutoEntity.js'
import { requireAdmin, requireAuth } from '../middlewares/auth.js'

const router = Router()

// --- MARCAS ---
router.get('/marcas', async (_req, res, next) => {
  try {
    const rows = await AppDataSource.getRepository(MarcaEntity).find({
      order: { nome: 'ASC' },
    })
    return res.status(200).json(
      rows.map((m) => ({
        id: m.id,
        nome: m.nome,
        logoDataUrl: m.logoDataUrl || null,
      })),
    )
  } catch (err) {
    return next(err)
  }
})

router.post('/marcas', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const nome = String(req.body?.nome || '')
      .trim()
      .toUpperCase()
    if (!nome) return res.status(400).json({ message: 'Nome da marca é obrigatório.' })

    const repo = AppDataSource.getRepository(MarcaEntity)
    const existing = await repo.findOne({ where: { nome } })
    if (existing) return res.status(409).json({ message: 'Esta marca já está cadastrada.' })

    const created = repo.create({
      nome,
      logoDataUrl: req.body?.logoDataUrl || null,
    })
    const saved = await repo.save(created)
    return res.status(201).json({ id: saved.id, nome: saved.nome, logoDataUrl: saved.logoDataUrl })
  } catch (err) {
    return next(err)
  }
})

router.put('/marcas/:nome/logo', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const nome = decodeURIComponent(req.params.nome).trim().toUpperCase()
    const repo = AppDataSource.getRepository(MarcaEntity)
    const existing = await repo.findOne({ where: { nome } })
    if (!existing) return res.status(404).json({ message: 'Marca não encontrada.' })

    existing.logoDataUrl = req.body?.logoDataUrl || null
    const saved = await repo.save(existing)
    return res.status(200).json({ id: saved.id, nome: saved.nome, logoDataUrl: saved.logoDataUrl })
  } catch (err) {
    return next(err)
  }
})

router.delete('/marcas/:nome', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const nome = decodeURIComponent(req.params.nome).trim().toUpperCase()
    const repo = AppDataSource.getRepository(MarcaEntity)
    const existing = await repo.findOne({ where: { nome } })
    if (!existing) return res.status(404).json({ message: 'Marca não encontrada.' })

    await repo.remove(existing)
    return res.status(200).json({ message: 'Marca removida com sucesso.' })
  } catch (err) {
    return next(err)
  }
})

router.post('/marcas/importar', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const itens = Array.isArray(req.body?.itens) ? req.body.itens : []
    const substituir = Boolean(req.body?.substituir)
    const repo = AppDataSource.getRepository(MarcaEntity)

    if (substituir) {
      await repo.clear()
    }

    const atuais = await repo.find()
    const set = new Set(atuais.map((m) => m.nome.toUpperCase()))
    let adicionados = 0
    let ignorados = 0

    for (const raw of itens) {
      const nome = String(raw || '')
        .trim()
        .toUpperCase()
      if (!nome) continue
      if (set.has(nome)) {
        ignorados++
        continue
      }
      set.add(nome)
      await repo.save(repo.create({ nome }))
      adicionados++
    }

    const total = await repo.count()
    return res.status(200).json({ adicionados, ignorados, total })
  } catch (err) {
    return next(err)
  }
})

// --- CÉLULAS ---
router.get('/celulas', async (_req, res, next) => {
  try {
    const rows = await AppDataSource.getRepository(CelulaEntity).find({
      order: { nome: 'ASC' },
    })
    return res.status(200).json(rows.map((c) => ({ id: c.id, nome: c.nome })))
  } catch (err) {
    return next(err)
  }
})

router.post('/celulas', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const nome = String(req.body?.nome || '')
      .trim()
      .toUpperCase()
    if (!nome) return res.status(400).json({ message: 'Nome da célula é obrigatório.' })

    const repo = AppDataSource.getRepository(CelulaEntity)
    const existing = await repo.findOne({ where: { nome } })
    if (existing) return res.status(409).json({ message: 'Esta célula já está cadastrada.' })

    const saved = await repo.save(repo.create({ nome }))
    return res.status(201).json({ id: saved.id, nome: saved.nome })
  } catch (err) {
    return next(err)
  }
})

router.delete('/celulas/:nome', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const nome = decodeURIComponent(req.params.nome).trim().toUpperCase()
    const repo = AppDataSource.getRepository(CelulaEntity)
    const existing = await repo.findOne({ where: { nome } })
    if (!existing) return res.status(404).json({ message: 'Célula não encontrada.' })

    await repo.remove(existing)
    return res.status(200).json({ message: 'Célula removida com sucesso.' })
  } catch (err) {
    return next(err)
  }
})

router.post('/celulas/importar', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const itens = Array.isArray(req.body?.itens) ? req.body.itens : []
    const substituir = Boolean(req.body?.substituir)
    const repo = AppDataSource.getRepository(CelulaEntity)

    if (substituir) {
      await repo.clear()
    }

    const atuais = await repo.find()
    const set = new Set(atuais.map((c) => c.nome.toUpperCase()))
    let adicionados = 0
    let ignorados = 0

    for (const raw of itens) {
      const nome = String(raw || '')
        .trim()
        .toUpperCase()
      if (!nome) continue
      if (set.has(nome)) {
        ignorados++
        continue
      }
      set.add(nome)
      await repo.save(repo.create({ nome }))
      adicionados++
    }

    const total = await repo.count()
    return res.status(200).json({ adicionados, ignorados, total })
  } catch (err) {
    return next(err)
  }
})

// --- PRODUTOS ---
router.get('/produtos', async (_req, res, next) => {
  try {
    const rows = await AppDataSource.getRepository(ProdutoEntity).find({
      order: { nome: 'ASC' },
    })
    return res.status(200).json(
      rows.map((p) => ({
        id: p.id,
        nome: p.nome,
        valor: Number(p.valorUnitario),
      })),
    )
  } catch (err) {
    return next(err)
  }
})

router.post('/produtos', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const nome = String(req.body?.nome || '').trim()
    const valor = Number(req.body?.valor ?? req.body?.valorUnitario ?? 0)
    if (!nome) return res.status(400).json({ message: 'Nome do produto é obrigatório.' })
    if (!Number.isFinite(valor) || valor < 0) {
      return res.status(400).json({ message: 'Informe um valor válido maior ou igual a zero.' })
    }

    const repo = AppDataSource.getRepository(ProdutoEntity)
    const existing = await repo
      .createQueryBuilder('p')
      .where('LOWER(p.nome) = LOWER(:nome)', { nome })
      .getOne()
    if (existing) {
      return res.status(409).json({ message: 'Já existe um produto com este nome.' })
    }

    const saved = await repo.save(repo.create({ nome, valorUnitario: valor }))
    return res.status(201).json({ id: saved.id, nome: saved.nome, valor: Number(saved.valorUnitario) })
  } catch (err) {
    return next(err)
  }
})

router.delete('/produtos/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) return res.status(400).json({ message: 'ID inválido.' })

    const repo = AppDataSource.getRepository(ProdutoEntity)
    const existing = await repo.findOne({ where: { id } })
    if (!existing) return res.status(404).json({ message: 'Produto não encontrado.' })

    await repo.remove(existing)
    return res.status(200).json({ message: 'Produto removido com sucesso.' })
  } catch (err) {
    return next(err)
  }
})

router.post('/produtos/importar', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const itens = Array.isArray(req.body?.itens) ? req.body.itens : []
    const substituir = Boolean(req.body?.substituir)
    const repo = AppDataSource.getRepository(ProdutoEntity)

    if (substituir) {
      await repo.clear()
    }

    const atuais = await repo.find()
    const set = new Set(atuais.map((p) => p.nome.toLowerCase()))
    let adicionados = 0
    let ignorados = 0

    for (const item of itens) {
      const nome = String(item?.nome || '').trim()
      const valor = Number(item?.valor ?? 0)
      if (!nome) continue
      if (set.has(nome.toLowerCase())) {
        ignorados++
        continue
      }
      set.add(nome.toLowerCase())
      await repo.save(
        repo.create({
          nome,
          valorUnitario: Number.isFinite(valor) && valor >= 0 ? valor : 0,
        }),
      )
      adicionados++
    }

    const total = await repo.count()
    return res.status(200).json({ adicionados, ignorados, total })
  } catch (err) {
    return next(err)
  }
})

export default router
