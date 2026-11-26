// src/stores/registros.js
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { api } from '../services/api'
import { useAuthStore } from './auth'

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
  const authStore = useAuthStore()
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

  // 4. Registros de abastecimento e resíduo (conectado à API REST)
  const registros = ref([])
  const loading = ref(false)
  const error = ref(null)

  const normalizarRegistro = (item) => ({
    ...item,
    cracha:
      item.cracha ||
      (item.nome && item.nome.includes('Crachá')
        ? item.nome.replace('Crachá', '').trim()
        : item.nome || '—'),
  })

  const fetchRegistros = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const res = await api.get('/registros', { params })
      const lista = Array.isArray(res) ? res : res?.data || res?.registros || []
      registros.value = lista.map(normalizarRegistro)
      return { ok: true, data: registros.value }
    } catch (err) {
      error.value = err?.message || 'Erro ao carregar registros do servidor.'
      return { ok: false, msg: error.value }
    } finally {
      loading.value = false
    }
  }

  const adicionarRegistro = async (dados) => {
    loading.value = true
    error.value = null
    try {
      const res = await api.post('/registros', dados)
      const criado = res?.registro || res?.data || res
      const registroFinal = normalizarRegistro(
        criado && typeof criado === 'object' && criado.id !== undefined
          ? criado
          : {
              id: Date.now(),
              ...dados,
              ...(criado && typeof criado === 'object' ? criado : {}),
            },
      )
      registros.value.unshift(registroFinal)
      return { ok: true, data: registroFinal, msg: 'Lançamento registrado com sucesso!' }
    } catch (err) {
      error.value = err?.message || 'Erro ao registrar lançamento.'
      return { ok: false, msg: error.value }
    } finally {
      loading.value = false
    }
  }

  const atualizarRegistro = async (id, dados) => {
    loading.value = true
    error.value = null
    try {
      const res = await api.put(`/registros/${id}`, dados)
      const atualizado = res?.registro || res?.data || res
      const index = registros.value.findIndex((reg) => reg.id === id)
      if (index !== -1) {
        registros.value[index] = normalizarRegistro({
          ...registros.value[index],
          ...dados,
          ...(atualizado && typeof atualizado === 'object' ? atualizado : {}),
        })
      }
      return {
        ok: true,
        data: index !== -1 ? registros.value[index] : atualizado,
        msg: 'Lançamento atualizado com sucesso!',
      }
    } catch (err) {
      error.value = err?.message || 'Erro ao atualizar lançamento.'
      return { ok: false, msg: error.value }
    } finally {
      loading.value = false
    }
  }

  const excluirRegistro = async (id) => {
    loading.value = true
    error.value = null
    try {
      await api.delete(`/registros/${id}`)
      registros.value = registros.value.filter((reg) => reg.id !== id)
      return { ok: true, msg: 'Lançamento excluído com sucesso!' }
    } catch (err) {
      error.value = err?.message || 'Erro ao excluir lançamento.'
      return { ok: false, msg: error.value }
    } finally {
      loading.value = false
    }
  }

  // ----------------------------------------------------
  // 5. Gestão de Administradores e Usuário Logado (integrado à authStore)
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

  const usuarioAdminLogado = computed(() => authStore.usuario)
  const isAdmin = computed(() => authStore.isAdmin)

  const loginAdmin = async (credenciais) => {
    if (typeof credenciais === 'string') {
      return authStore.login({ cracha: credenciais, senha: '' })
    }
    return authStore.login(credenciais)
  }

  const logoutAdmin = () => {
    authStore.logout()
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

  const validarEExecutarExclusao = async () => {
    let resultado = null
    if (typeof modalExclusao.value.onConfirm === 'function') {
      resultado = await modalExclusao.value.onConfirm()
    }

    fecharModalExclusao()

    if (resultado && resultado.ok === false) {
      mostrarNotificacaoCentro({
        tipo: 'erro',
        titulo: resultado.titulo || 'Erro na Operação',
        mensagem: resultado.msg || 'Não foi possível concluir a operação.',
      })
      return { ok: false, msg: resultado.msg }
    }

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
    loading,
    error,
    fetchRegistros,
    adicionarRegistro,
    atualizarRegistro,
    excluirRegistro,
    removerRegistro: excluirRegistro,
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
