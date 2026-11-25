// src/stores/registros.js
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

// Limpeza única dos dados padrões mockados anteriores para iniciar o app totalmente limpo
if (
  typeof window !== 'undefined' &&
  localStorage.getItem('controlabast_limpar_padroes_v1') !== 'true'
) {
  localStorage.removeItem('controlabast_marcas')
  localStorage.removeItem('controlabast_produtos')
  localStorage.removeItem('controlabast_celulas')
  localStorage.removeItem('controlabast_registros')
  localStorage.removeItem('controlabast_registros_v2')
  localStorage.removeItem('controlabast_senha_exclusao')
  localStorage.setItem('controlabast_limpar_padroes_v1', 'true')
}

const MARCAS_PADRAO = []
const CELULAS_PADRAO = []
const PRODUTOS_PADRAO = []
const DADOS_INICIAIS = []

// Administrador Master padrão (conforme solicitado: 3014716 - Rafael Oliveira da Silva)
const ADMINS_PADRAO = [
  {
    cracha: '3014716',
    nome: 'Rafael Oliveira da Silva',
    perfil: 'Master',
    isMaster: true,
    dataCadastro: '23/11/2026',
  },
]

export const useRegistrosStore = defineStore('registros', () => {
  // 1. Marcas cadastradas
  const marcasSalvas = localStorage.getItem('controlabast_marcas')
  const marcas = ref(marcasSalvas ? JSON.parse(marcasSalvas) : MARCAS_PADRAO)

  watch(
    marcas,
    (novas) => {
      localStorage.setItem('controlabast_marcas', JSON.stringify(novas))
    },
    { deep: true },
  )

  const adicionarMarca = (nome) => {
    const nomeLimpo = (nome || '').trim().toUpperCase()
    if (!nomeLimpo) return { ok: false, msg: 'Nome da marca não pode ser vazio.' }
    if (marcas.value.includes(nomeLimpo)) {
      return { ok: false, msg: 'Esta marca já está cadastrada.' }
    }
    marcas.value.push(nomeLimpo)
    return { ok: true, msg: 'Marca cadastrada com sucesso!' }
  }

  const removerMarca = (nome) => {
    marcas.value = marcas.value.filter((m) => m !== nome)
    if (logosMarcas.value[nome.toUpperCase()]) {
      delete logosMarcas.value[nome.toUpperCase()]
      localStorage.setItem('controlabast_logos_marcas', JSON.stringify(logosMarcas.value))
    }
    return { ok: true, msg: 'Marca removida com sucesso.' }
  }

  const importarMarcasEmLote = (listaNomes, substituir = false) => {
    const existentes = substituir ? [] : [...marcas.value]
    let adicionados = 0
    let ignorados = 0

    listaNomes.forEach((nome) => {
      const limpo = (nome || '').trim().toUpperCase()
      if (limpo) {
        if (!existentes.includes(limpo)) {
          existentes.push(limpo)
          adicionados++
        } else {
          ignorados++
        }
      }
    })

    marcas.value = existentes
    return { ok: true, adicionados, ignorados, total: marcas.value.length }
  }

  // Logos personalizadas das marcas (opcional, base64 ou URL)
  const logosSalvas = localStorage.getItem('controlabast_logos_marcas')
  const logosMarcas = ref(logosSalvas ? JSON.parse(logosSalvas) : {})

  watch(
    logosMarcas,
    (novos) => {
      localStorage.setItem('controlabast_logos_marcas', JSON.stringify(novos))
    },
    { deep: true },
  )

  const definirLogoMarca = (marca, urlOuBase64) => {
    if (!marca) return
    logosMarcas.value[marca.toUpperCase()] = urlOuBase64
  }

  const removerLogoMarca = (marca) => {
    if (!marca) return
    const chave = marca.toUpperCase()
    if (logosMarcas.value[chave]) {
      delete logosMarcas.value[chave]
      localStorage.setItem('controlabast_logos_marcas', JSON.stringify(logosMarcas.value))
    }
  }

  // 2. Produtos cadastrados (com nome e valor)
  const produtosSalvos = localStorage.getItem('controlabast_produtos')
  const produtos = ref(produtosSalvos ? JSON.parse(produtosSalvos) : PRODUTOS_PADRAO)

  watch(
    produtos,
    (novos) => {
      localStorage.setItem('controlabast_produtos', JSON.stringify(novos))
    },
    { deep: true },
  )

  const adicionarProduto = ({ nome, valor }) => {
    const nomeLimpo = (nome || '').trim()
    const valorNum = Number(valor)

    if (!nomeLimpo) return { ok: false, msg: 'Nome do produto é obrigatório.' }
    if (isNaN(valorNum) || valorNum < 0)
      return { ok: false, msg: 'Informe um valor válido maior ou igual a zero.' }

    const jaExiste = produtos.value.some((p) => p.nome.toLowerCase() === nomeLimpo.toLowerCase())
    if (jaExiste) {
      return { ok: false, msg: 'Já existe um produto com este nome.' }
    }

    produtos.value.push({
      id: Date.now(),
      nome: nomeLimpo,
      valor: valorNum,
    })

    return { ok: true, msg: 'Produto cadastrado com sucesso!' }
  }

  const removerProduto = (id) => {
    produtos.value = produtos.value.filter((p) => p.id !== id)
    return { ok: true, msg: 'Produto removido com sucesso.' }
  }

  const importarProdutosEmLote = (listaProdutos, substituir = false) => {
    const existentes = substituir ? [] : [...produtos.value]
    let adicionados = 0
    let ignorados = 0

    listaProdutos.forEach((p) => {
      const nomeLimpo = (p.nome || '').trim()
      const valorNum = Number(p.valor || 0)
      if (nomeLimpo) {
        const jaExiste = existentes.some(
          (item) => item.nome.toLowerCase() === nomeLimpo.toLowerCase(),
        )
        if (!jaExiste) {
          existentes.push({
            id: Date.now() + Math.random(),
            nome: nomeLimpo,
            valor: isNaN(valorNum) || valorNum < 0 ? 0 : valorNum,
          })
          adicionados++
        } else {
          ignorados++
        }
      }
    })

    produtos.value = existentes
    return { ok: true, adicionados, ignorados, total: produtos.value.length }
  }

  // 3. Células de Produção cadastradas
  const celulasSalvas = localStorage.getItem('controlabast_celulas')
  const celulas = ref(celulasSalvas ? JSON.parse(celulasSalvas) : CELULAS_PADRAO)

  watch(
    celulas,
    (novas) => {
      localStorage.setItem('controlabast_celulas', JSON.stringify(novas))
    },
    { deep: true },
  )

  const adicionarCelula = (nome) => {
    const nomeLimpo = (nome || '').trim().toUpperCase()
    if (!nomeLimpo) return { ok: false, msg: 'Nome da célula não pode ser vazio.' }
    if (celulas.value.includes(nomeLimpo)) {
      return { ok: false, msg: 'Esta célula já está cadastrada.' }
    }
    celulas.value.push(nomeLimpo)
    return { ok: true, msg: 'Célula cadastrada com sucesso!' }
  }

  const removerCelula = (nome) => {
    celulas.value = celulas.value.filter((c) => c !== nome)
    return { ok: true, msg: 'Célula removida com sucesso.' }
  }

  const importarCelulasEmLote = (listaNomes, substituir = false) => {
    const existentes = substituir ? [] : [...celulas.value]
    let adicionados = 0
    let ignorados = 0

    listaNomes.forEach((nome) => {
      const limpo = (nome || '').trim().toUpperCase()
      if (limpo) {
        if (!existentes.includes(limpo)) {
          existentes.push(limpo)
          adicionados++
        } else {
          ignorados++
        }
      }
    })

    celulas.value = existentes
    return { ok: true, adicionados, ignorados, total: celulas.value.length }
  }

  // 4. Registros de abastecimento e resíduo
  const dadosSalvos =
    localStorage.getItem('controlabast_registros_v2') ||
    localStorage.getItem('controlabast_registros')
  let dadosIniciais = DADOS_INICIAIS

  if (dadosSalvos) {
    try {
      const parsed = JSON.parse(dadosSalvos)
      if (Array.isArray(parsed) && parsed.length > 0) {
        dadosIniciais = parsed.map((item) => ({
          ...item,
          marca: item.marca || 'NIKE',
          cracha:
            item.cracha ||
            (item.nome && item.nome.includes('Crachá')
              ? item.nome.replace('Crachá', '').trim()
              : item.nome || '—'),
        }))
      }
    } catch {
      dadosIniciais = DADOS_INICIAIS
    }
  }

  const registros = ref(dadosIniciais)

  watch(
    registros,
    (novos) => {
      localStorage.setItem('controlabast_registros_v2', JSON.stringify(novos))
      localStorage.setItem('controlabast_registros', JSON.stringify(novos))
    },
    { deep: true },
  )

  const adicionarRegistro = (registro) => {
    registros.value.unshift({
      id: Date.now(),
      ...registro,
    })
  }

  const removerRegistro = (id) => {
    registros.value = registros.value.filter((reg) => reg.id !== id)
  }

  const atualizarRegistro = (id, dadosAtualizados) => {
    const index = registros.value.findIndex((reg) => reg.id === id)
    if (index !== -1) {
      registros.value[index] = {
        ...registros.value[index],
        ...dadosAtualizados,
      }
      return { ok: true, msg: 'Lançamento atualizado com sucesso!' }
    }
    return { ok: false, msg: 'Registro não encontrado.' }
  }

  // ----------------------------------------------------
  // 5. Gestão de Administradores e Usuário Logado
  // ----------------------------------------------------
  const adminsSalvos = localStorage.getItem('controlabast_admins')
  const admins = ref(adminsSalvos ? JSON.parse(adminsSalvos) : ADMINS_PADRAO)

  // Garante que o Master Rafael Oliveira da Silva (3014716) sempre esteja presente
  if (!admins.value.some((a) => a.cracha === '3014716')) {
    admins.value.unshift(ADMINS_PADRAO[0])
  }

  watch(
    admins,
    (novos) => {
      localStorage.setItem('controlabast_admins', JSON.stringify(novos))
    },
    { deep: true },
  )

  const loginSalvo = localStorage.getItem('controlabast_admin_ativo')
  const usuarioAdminLogado = ref(loginSalvo ? JSON.parse(loginSalvo) : null)
  const isAdmin = computed(() => !!usuarioAdminLogado.value)

  watch(
    usuarioAdminLogado,
    (val) => {
      if (val) {
        localStorage.setItem('controlabast_admin_ativo', JSON.stringify(val))
      } else {
        localStorage.removeItem('controlabast_admin_ativo')
      }
    },
    { deep: true },
  )

  const loginAdmin = (cracha) => {
    const crachaLimpo = (cracha || '').trim()
    const encontrado = admins.value.find((a) => a.cracha === crachaLimpo)
    if (encontrado) {
      usuarioAdminLogado.value = { ...encontrado }
      return { ok: true, usuario: encontrado }
    }
    return { ok: false, msg: 'Crachá não autorizado como administrador.' }
  }

  const logoutAdmin = () => {
    usuarioAdminLogado.value = null
  }

  const adicionarAdmin = ({ cracha, nome }) => {
    const crachaLimpo = (cracha || '').trim()
    const nomeLimpo = (nome || '').trim()

    if (!crachaLimpo) return { ok: false, msg: 'O número do crachá é obrigatório.' }
    if (!nomeLimpo) return { ok: false, msg: 'O nome da pessoa é obrigatório.' }

    if (admins.value.some((a) => a.cracha === crachaLimpo)) {
      return { ok: false, msg: 'Este crachá já possui permissão de administrador.' }
    }

    admins.value.push({
      cracha: crachaLimpo,
      nome: nomeLimpo,
      perfil: 'Administrador (Edição / Exclusão)',
      isMaster: false,
      dataCadastro: new Date().toLocaleDateString('pt-BR'),
    })

    return { ok: true, msg: `${nomeLimpo} adicionado(a) com permissões de editar e excluir!` }
  }

  const removerAdmin = (cracha) => {
    if (cracha === '3014716') {
      return { ok: false, msg: 'O usuário Master principal não pode ser removido.' }
    }

    const admin = admins.value.find((a) => a.cracha === cracha)
    admins.value = admins.value.filter((a) => a.cracha !== cracha)

    if (usuarioAdminLogado.value?.cracha === cracha) {
      logoutAdmin()
    }

    return { ok: true, msg: `Permissão de ${admin?.nome || 'usuário'} removida com sucesso.` }
  }

  // Getters para totais
  const totalAbastecido = computed(() => {
    return registros.value
      .filter((r) => r.tipo === 'Abastecimento')
      .reduce((acc, curr) => acc + Number(curr.qtd || 0), 0)
  })

  const totalResiduos = computed(() => {
    return registros.value
      .filter((r) => r.tipo === 'Resíduo')
      .reduce((acc, curr) => acc + Number(curr.qtd || 0), 0)
  })

  const totaisPorMarca = computed(() => {
    const mapa = {}
    marcas.value.forEach((m) => {
      mapa[m] = 0
    })
    registros.value
      .filter((r) => r.tipo === 'Abastecimento')
      .forEach((r) => {
        const m = (r.marca || '').toUpperCase()
        if (mapa[m] !== undefined) {
          mapa[m] += Number(r.qtd || 0)
        } else {
          mapa[m] = Number(r.qtd || 0)
        }
      })
    return mapa
  })

  const custosTotais = computed(() => {
    return registros.value.reduce((acc, curr) => acc + Number(curr.valorTotal || 0), 0)
  })

  // 4. Sistema de Senha de Exclusão e Notificações Centrais
  // Modal de Confirmação de Exclusão (sem exigência de senha)
  const modalExclusao = ref({
    aberto: false,
    titulo: 'Confirmar Exclusão',
    descricao: '',
    itemNome: '',
    onConfirm: null,
  })

  // Estado da Notificação no Meio da Tela
  const notificacaoCentro = ref({
    aberto: false,
    tipo: 'sucesso',
    titulo: '',
    mensagem: '',
    timerId: null,
  })

  const abrirConfirmacaoExclusao = ({ titulo, descricao, itemNome, onConfirm }) => {
    modalExclusao.value = {
      aberto: true,
      titulo: titulo || 'Confirmar Exclusão',
      descricao: descricao || 'Esta ação não pode ser desfeita.',
      itemNome: itemNome || '',
      onConfirm,
    }
  }

  const fecharModalExclusao = () => {
    modalExclusao.value.aberto = false
    modalExclusao.value.onConfirm = null
  }

  const mostrarNotificacaoCentro = ({
    tipo = 'sucesso',
    titulo = 'Excluído com Sucesso!',
    mensagem = 'O item foi removido com sucesso.',
  }) => {
    if (notificacaoCentro.value.timerId) {
      clearTimeout(notificacaoCentro.value.timerId)
    }

    const timer = setTimeout(() => {
      notificacaoCentro.value.aberto = false
    }, 2400)

    notificacaoCentro.value = {
      aberto: true,
      tipo,
      titulo,
      mensagem,
      timerId: timer,
    }
  }

  const fecharNotificacaoCentro = () => {
    if (notificacaoCentro.value.timerId) {
      clearTimeout(notificacaoCentro.value.timerId)
    }
    notificacaoCentro.value.aberto = false
  }

  const validarEExecutarExclusao = () => {
    let resultado = null
    if (typeof modalExclusao.value.onConfirm === 'function') {
      resultado = modalExclusao.value.onConfirm()
    }

    fecharModalExclusao()

    const tituloSucesso = (resultado && resultado.titulo) || 'Excluído com Sucesso!'
    const msgSucesso =
      (resultado && resultado.msg) || 'O item foi removido permanentemente do sistema.'
    mostrarNotificacaoCentro({
      tipo: 'sucesso',
      titulo: tituloSucesso,
      mensagem: msgSucesso,
    })

    return { ok: true }
  }

  // ----------------------------------------------------
  // 6. Backup Completo e Restauração de Dados (JSON)
  // ----------------------------------------------------
  const exportarBackupCompleto = () => {
    const dadosBackup = {
      sistema: 'ControlAbast',
      versao: '1.0',
      dataExportacao: new Date().toISOString(),
      marcas: marcas.value,
      logosMarcas: logosMarcas.value,
      produtos: produtos.value,
      celulas: celulas.value,
      registros: registros.value,
      admins: admins.value,
    }

    const dataStr = new Date().toISOString().slice(0, 10)
    const jsonStr = JSON.stringify(dadosBackup, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `backup_controlabast_${dataStr}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    return { ok: true, msg: 'Backup exportado com sucesso!' }
  }

  const importarBackupCompleto = (dadosBackup) => {
    if (!dadosBackup || typeof dadosBackup !== 'object') {
      return { ok: false, msg: 'Arquivo de backup inválido ou formato corrompido.' }
    }

    if (Array.isArray(dadosBackup.marcas)) {
      marcas.value = [...dadosBackup.marcas]
    }
    if (dadosBackup.logosMarcas && typeof dadosBackup.logosMarcas === 'object') {
      logosMarcas.value = { ...dadosBackup.logosMarcas }
    }
    if (Array.isArray(dadosBackup.produtos)) {
      produtos.value = [...dadosBackup.produtos]
    }
    if (Array.isArray(dadosBackup.celulas)) {
      celulas.value = [...dadosBackup.celulas]
    }
    if (Array.isArray(dadosBackup.registros)) {
      registros.value = [...dadosBackup.registros]
    }
    if (Array.isArray(dadosBackup.admins)) {
      const novosAdmins = [...dadosBackup.admins]
      if (!novosAdmins.some((a) => a.cracha === '3014716')) {
        novosAdmins.unshift(ADMINS_PADRAO[0])
      }
      admins.value = novosAdmins
    }

    return {
      ok: true,
      msg: `Backup restaurado com sucesso! (${marcas.value.length} marcas, ${produtos.value.length} produtos, ${celulas.value.length} células e ${registros.value.length} lançamentos recuperados)`,
    }
  }

  return {
    marcas,
    logosMarcas,
    definirLogoMarca,
    removerLogoMarca,
    adicionarMarca,
    removerMarca,
    importarMarcasEmLote,
    produtos,
    adicionarProduto,
    removerProduto,
    importarProdutosEmLote,
    celulas,
    adicionarCelula,
    removerCelula,
    importarCelulasEmLote,
    registros,
    adicionarRegistro,
    removerRegistro,
    atualizarRegistro,
    admins,
    usuarioAdminLogado,
    isAdmin,
    loginAdmin,
    logoutAdmin,
    adicionarAdmin,
    removerAdmin,
    totalAbastecido,
    totalResiduos,
    totaisPorMarca,
    custosTotais,
    modalExclusao,
    notificacaoCentro,
    abrirConfirmacaoExclusao,
    fecharModalExclusao,
    mostrarNotificacaoCentro,
    fecharNotificacaoCentro,
    validarEExecutarExclusao,
    exportarBackupCompleto,
    importarBackupCompleto,
  }
})
