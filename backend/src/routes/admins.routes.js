import { Router } from 'express'
import { requireAdmin, requireAuth } from '../middlewares/auth.js'
import {
  addLocalAdmin,
  listLocalAdmins,
  removeLocalAdmin,
} from '../services/adminLocalService.js'
import { identificarColaborador } from '../services/colaboradorService.js'

const router = Router()

router.get('/', requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const admins = await listLocalAdmins()
    return res.status(200).json(
      admins.map((a) => ({
        id: a.id,
        cracha: a.matricula,
        matricula: a.matricula,
        usuario: a.usuario,
        nome: a.nome,
        perfil: a.perfil,
        isMaster: Boolean(a.isMaster),
        dataCadastro: new Date(a.createdAt).toLocaleDateString('pt-BR'),
      })),
    )
  } catch (err) {
    return next(err)
  }
})

router.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const codigo = String(req.body?.matricula || req.body?.cracha || '').trim()
    let nome = String(req.body?.nome || '').trim()
    const usuario = req.body?.usuario ? String(req.body.usuario).trim() : null

    if (!codigo) {
      return res.status(400).json({ message: 'A matrícula ou crachá é obrigatório.' })
    }

    const colab = await identificarColaborador(codigo)
    const matricula = colab?.matricula || codigo
    if (!nome && colab?.nome) {
      nome = colab.nome
    }

    if (!nome) {
      return res.status(400).json({ message: 'O nome do colaborador é obrigatório.' })
    }

    const result = await addLocalAdmin({ matricula, usuario, nome })
    if (!result.ok) {
      return res.status(result.status || 400).json({ message: result.message })
    }

    const a = result.admin
    return res.status(201).json({
      id: a.id,
      cracha: a.matricula,
      matricula: a.matricula,
      usuario: a.usuario,
      nome: a.nome,
      perfil: a.perfil,
      isMaster: Boolean(a.isMaster),
      dataCadastro: new Date(a.createdAt).toLocaleDateString('pt-BR'),
    })
  } catch (err) {
    return next(err)
  }
})

router.delete('/:matricula', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const matricula = decodeURIComponent(req.params.matricula).trim()
    const result = await removeLocalAdmin(matricula)
    if (!result.ok) {
      return res.status(result.status || 400).json({ message: result.message })
    }

    return res.status(200).json({
      message: `Permissão de ${result.removed.nome} removida com sucesso.`,
    })
  } catch (err) {
    return next(err)
  }
})

export default router
