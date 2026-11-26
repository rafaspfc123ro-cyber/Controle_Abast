import { Router } from 'express'
import { identificarColaborador } from '../services/colaboradorService.js'

const router = Router()

router.get('/identificar/:codigo', async (req, res, next) => {
  try {
    const codigo = String(req.params.codigo || '').trim()
    if (!codigo) {
      return res.status(400).json({ message: 'Informe matrícula, crachá ou RFID.' })
    }

    const colaborador = await identificarColaborador(codigo)
    if (!colaborador) {
      return res.status(404).json({
        message: 'Colaborador não encontrado para esta matrícula, crachá ou RFID.',
      })
    }

    return res.status(200).json({ colaborador })
  } catch (err) {
    return next(err)
  }
})

export default router
