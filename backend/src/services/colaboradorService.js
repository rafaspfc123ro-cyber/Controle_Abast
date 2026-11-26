import { env } from '../config/env.js'
import { AppDataSource } from '../database/data-source.js'

/**
 * Identifica um colaborador nas tabelas legadas do schema `colaborador` (somente leitura)
 * a partir de matrícula, código de barras (crachá) ou tag RFID.
 */
export async function identificarColaborador(codigoBruto) {
  const codigo = String(codigoBruto || '').trim()
  if (!codigo) return null

  try {
    const rows = await AppDataSource.query(
      `
      SELECT
        COALESCE(cf.matricula, cc.matricula) AS matricula,
        COALESCE(cf.nome, cc.nome) AS nome,
        cf.nome_setor AS setor,
        cf.funcao AS funcao,
        cf.gerente AS gerente,
        cc.rfid AS rfid,
        cc.codbarras AS codbarras,
        cc.unidade_dass AS unidade
      FROM colaborador.colaboradores cc
      FULL OUTER JOIN colaborador.lista_funcionario cf
        ON TRIM(cf.matricula::text) = TRIM(cc.matricula::text)
      WHERE TRIM(cc.matricula::text) = $1
         OR TRIM(cc.codbarras::text) = $1
         OR TRIM(cc.rfid::text) = $1
         OR TRIM(cf.matricula::text) = $1
      LIMIT 1
      `,
      [codigo],
    )

    if (rows.length > 0) {
      return rows[0]
    }
  } catch (err) {
    // 42P01 = undefined_table, 3F000 = invalid_schema_name (ex.: banco local sem schema legado)
    if (err?.code !== '42P01' && err?.code !== '3F000') {
      throw err
    }
  }

  // Fallback HTTP para o serviço legado do dass_auth_service (busca por matrícula)
  try {
    const response = await fetch(
      `${env.dassAuthUrl}/colaborador/${encodeURIComponent(codigo)}`,
      { headers: { Accept: 'application/json' } },
    )
    if (!response.ok) return null
    const payload = await response.json()
    const colab = payload?.data
    if (!colab) return null
    return {
      matricula: colab.matricula || codigo,
      nome: colab.nome || null,
      setor: colab.nome_setor || null,
      funcao: colab.funcao || null,
      gerente: colab.gerente || null,
      rfid: colab.rfid || null,
      codbarras: colab.codbarras || null,
      unidade: null,
    }
  } catch {
    return null
  }
}
