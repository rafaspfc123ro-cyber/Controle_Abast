// src/stores/registros.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '../services/api'
import { useAuthStore } from './auth'

export const useRegistrosStore = defineStore('registros', () => {
  const authStore = useAuthStore()

  // 1. Marcas e Logos (persistidos no PostgreSQL via API)
  const marcas = ref([])
  const logosMarcas = ref({})

  const fetchMarcas = async () => {
    try {
      const lista = await api.get('/cadastros/marcas')
      const arr = Array.isArray(lista) ? lista : []
      marcas.value = arr.map((m) => m.nome)
      const mapaLogos = {}
      arr.forEach((m) => {
        if (m.logoDataUrl) {
          mapaLogos[m.nome.toUpperCase()] = m.logoDataUrl
        }
      })
      logosMarcas.value = mapaLogos
      return { ok: true }
    } catch (err) {
      return { ok: false, msg: err?.message || 'Erro ao carregar marcas.' }
    }
  }

  const adicionarMarca = async (nome, logoDataUrl = null) => {
    const nomeLimpo = (nome || '').trim().toUpperCase()
    if (!nomeLimpo) return { ok: false, msg: 'Nome da marca não pode ser vazio.' }
    try {
      const criada = await api.post('/cadastros/marcas', {
        nome: nomeLimpo,
        logoDataUrl,
      })
      if (!marcas.value.includes(criada.nome)) {
        marcas.value.push(criada.nome)
      }
      if (criada.logoDataUrl) {
        logosMarcas.value[criada.nome.toUpperCase()] = criada.logoDataUrl
      }
      return { ok: true, msg: 'Marca cadastrada com sucesso!' }
    } catch (err) {
      return { ok: false, msg: err?.message || 'Erro ao cadastrar marca.' }
    }
  }

  const removerMarca = async (nome) => {
    try {
      await api.delete(`/cadastros/marcas/${encodeURIComponent(nome)}`)
      marcas.value = marcas.value.filter((m) => m !== nome)
      delete logosMarcas.value[nome.toUpperCase()]
      return { ok: true, msg: 'Marca removida com sucesso.' }
    } catch (err) {
      return { ok: false, msg: err?.message || 'Erro ao remover marca.' }
    }
  }

  const importarMarcasEmLote = async (listaNomes, substituir = false) => {
    try {
      const res = await api.post('/cadastros/marcas/importar', {
        itens: listaNomes,
        substituir,
      })
      await fetchMarcas()
      return { ok: true, ...res }
    } catch (err) {
      return { ok: false, msg: err?.message || 'Erro ao importar marcas.' }
    }
  }

  const definirLogoMarca = async (marca, urlOuBase64) => {
    if (!marca) return { ok: false }
    try {
      await api.put(`/cadastros/marcas/${encodeURIComponent(marca)}/logo`, {
        logoDataUrl: urlOuBase64,
      })
      logosMarcas.value[marca.toUpperCase()] = urlOuBase64
      return { ok: true }
    } catch (err) {
      return { ok: false, msg: err?.message || 'Erro ao salvar logo.' }
    }
  }

  const removerLogoMarca = async (marca) => {
    if (!marca) return { ok: false }
    try {
      await api.put(`/cadastros/marcas/${encodeURIComponent(marca)}/logo`, {
        logoDataUrl: null,
      })
      delete logosMarcas.value[marca.toUpperCase()]
      return { ok: true }
    } catch (err) {
      return { ok: false, msg: err?.message || 'Erro ao remover logo.' }
    }
  }

  // 2. Produtos cadastrados
  const produtos = ref([])

  const fetchProdutos = async () => {
    try {
      const lista = await api.get('/cadastros/produtos')
      produtos.value = Array.isArray(lista) ? lista : []
      return { ok: true }
    } catch (err) {
      return { ok: false, msg: err?.message || 'Erro ao carregar produtos.' }
    }
  }

  const adicionarProduto = async ({ nome, valor }) => {
    const nomeLimpo = (nome || '').trim()
    const valorNum = Number(valor)

    if (!nomeLimpo) return { ok: false, msg: 'Nome do produto é obrigatório.' }
    if (isNaN(valorNum) || valorNum < 0) {
      return { ok: false, msg: 'Informe um valor válido maior ou igual a zero.' }
    }

    try {
      const criado = await api.post('/cadastros/produtos', {
        nome: nomeLimpo,
        valor: valorNum,
      })
      produtos.value.push(criado)
      return { ok: true, msg: 'Produto cadastrado com sucesso!' }
    } catch (err) {
      return { ok: false, msg: err?.message || 'Erro ao cadastrar produto.' }
    }
  }

  const removerProduto = async (id) => {
    try {
      await api.delete(`/cadastros/produtos/${id}`)
      produtos.value = produtos.value.filter((p) => p.id !== id)
      return { ok: true, msg: 'Produto removido com sucesso.' }
    } catch (err) {
      return { ok: false, msg: err?.message || 'Erro ao remover produto.' }
    }
  }

  const importarProdutosEmLote = async (listaProdutos, substituir = false) => {
    try {
      const res = await api.post('/cadastros/produtos/importar', {
        itens: listaProdutos,
        substituir,
      })
      await fetchProdutos()
      return { ok: true, ...res }
    } catch (err) {
      return { ok: false, msg: err?.message || 'Erro ao importar produtos.' }
    }
  }

  // 3. Células de Produção cadastradas
  const celulas = ref([])

  const fetchCelulas = async () => {
    try {
      const lista = await api.get('/cadastros/celulas')
      celulas.value = Array.isArray(lista) ? lista.map((c) => c.nome) : []
      return { ok: true }
    } catch (err) {
      return { ok: false, msg: err?.message || 'Erro ao carregar células.' }
    }
  }

  const adicionarCelula = async (nome) => {
    const nomeLimpo = (nome || '').trim().toUpperCase()
    if (!nomeLimpo) return { ok: false, msg: 'Nome da célula não pode ser vazio.' }
    try {
      const criada = await api.post('/cadastros/celulas', { nome: nomeLimpo })
      if (!celulas.value.includes(criada.nome)) {
        celulas.value.push(criada.nome)
      }
      return { ok: true, msg: 'Célula cadastrada com sucesso!' }
    } catch (err) {
      return { ok: false, msg: err?.message || 'Erro ao cadastrar célula.' }
    }
  }

  const removerCelula = async (nome) => {
    try {
      await api.delete(`/cadastros/celulas/${encodeURIComponent(nome)}`)
      celulas.value = celulas.value.filter((c) => c !== nome)
      return { ok: true, msg: 'Célula removida com sucesso.' }
    } catch (err) {
      return { ok: false, msg: err?.message || 'Erro ao remover célula.' }
    }
  }

  const importarCelulasEmLote = async (listaNomes, substituir = false) => {
    try {
      const res = await api.post('/cadastros/celulas/importar', {
        itens: listaNomes,
        substituir,
      })
      await fetchCelulas()
      return { ok: true, ...res }
    } catch (err) {
      return { ok: false, msg: err?.message || 'Erro ao importar células.' }
    }
  }

  const fetchCadastros = async () => {
    await Promise.all([fetchMarcas(), fetchProdutos(), fetchCelulas()])
  }

  // 4. Identificação de Operador via legado do dass_auth (matrícula / crachá / RFID)
  const identificarOperador = async (codigo) => {
    const limpo = String(codigo || '').trim()
    if (!limpo) return { ok: false, msg: 'Informe matrícula, crachá ou RFID.' }
    try {
      const res = await api.get(`/colaboradores/identificar/${encodeURIComponent(limpo)}`)
      return { ok: true, colaborador: res?.colaborador || null }
    } catch (err) {
      return { ok: false, msg: err?.message || 'Colaborador não encontrado.' }
    }
  }

  // 5. Registros de abastecimento e resíduo (conectado à API REST)
  const registros = ref([])
  const loading = ref(false)
  const error = ref(null)

  const normalizarRegistro = (item) => ({
    ...item,
    cracha:
      item.cracha ||
      item.matricula ||
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
      const registroFinal = normalizarRegistro(criado)
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

  // 6. Gestão de Administradores Locais (tabela controle_abast.admins_locais, sem admin padrão)
  const admins = ref([])

  const usuarioAdminLogado = computed(() => authStore.usuario)
  const isAdmin = computed(() => authStore.isAdmin)

  const fetchAdmins = async () => {
    if (!authStore.isAdmin) {
      admins.value = []
      return { ok: false }
    }
    try {
      const lista = await api.get('/admins')
      admins.value = Array.isArray(lista) ? lista : []
      return { ok: true, data: admins.value }
    } catch (err) {
      return { ok: false, msg: err?.message || 'Erro ao carregar administradores.' }
    }
  }

  const adicionarAdmin = async ({ cracha, matricula, nome }) => {
    const codigo = (matricula || cracha || '').trim()
    const nomeLimpo = (nome || '').trim()

    if (!codigo) return { ok: false, msg: 'A matrícula ou crachá é obrigatório.' }

    try {
      const criado = await api.post('/admins', {
        matricula: codigo,
        nome: nomeLimpo,
      })
      admins.value.push(criado)
      return { ok: true, msg: `${criado.nome} adicionado(a) com permissões de administrador!` }
    } catch (err) {
      return { ok: false, msg: err?.message || 'Erro ao adicionar administrador.' }
    }
  }

  const removerAdmin = async (matricula) => {
    try {
      const res = await api.delete(`/admins/${encodeURIComponent(matricula)}`)
      admins.value = admins.value.filter(
        (a) => a.matricula !== matricula && a.cracha !== matricula,
      )
      return { ok: true, msg: res?.message || 'Permissão removida com sucesso.' }
    } catch (err) {
      return { ok: false, msg: err?.message || 'Erro ao remover administrador.' }
    }
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

  // Modal de Confirmação de Exclusão e Notificações Centrais
  const modalExclusao = ref({
    aberto: false,
    titulo: 'Confirmar Exclusão',
    descricao: '',
    itemNome: '',
    onConfirm: null,
  })

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

  // Backup Completo (Exportação JSON)
  const exportarBackupCompleto = () => {
    const dadosBackup = {
      sistema: 'ControlAbast',
      versao: '1.1',
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

  const importarBackupCompleto = async (dadosBackup) => {
    if (!dadosBackup || typeof dadosBackup !== 'object') {
      return { ok: false, msg: 'Arquivo de backup inválido ou formato corrompido.' }
    }

    if (Array.isArray(dadosBackup.marcas)) {
      await importarMarcasEmLote(dadosBackup.marcas, false)
    }
    if (dadosBackup.logosMarcas && typeof dadosBackup.logosMarcas === 'object') {
      for (const [m, logo] of Object.entries(dadosBackup.logosMarcas)) {
        await definirLogoMarca(m, logo)
      }
    }
    if (Array.isArray(dadosBackup.produtos)) {
      await importarProdutosEmLote(dadosBackup.produtos, false)
    }
    if (Array.isArray(dadosBackup.celulas)) {
      await importarCelulasEmLote(dadosBackup.celulas, false)
    }

    return {
      ok: true,
      msg: `Cadastros restaurados com sucesso! (${marcas.value.length} marcas, ${produtos.value.length} produtos e ${celulas.value.length} células)`,
    }
  }

  return {
    marcas,
    logosMarcas,
    fetchMarcas,
    definirLogoMarca,
    removerLogoMarca,
    adicionarMarca,
    removerMarca,
    importarMarcasEmLote,
    produtos,
    fetchProdutos,
    adicionarProduto,
    removerProduto,
    importarProdutosEmLote,
    celulas,
    fetchCelulas,
    adicionarCelula,
    removerCelula,
    importarCelulasEmLote,
    fetchCadastros,
    identificarOperador,
    registros,
    loading,
    error,
    fetchRegistros,
    adicionarRegistro,
    atualizarRegistro,
    excluirRegistro,
    removerRegistro: excluirRegistro,
    admins,
    fetchAdmins,
    usuarioAdminLogado,
    isAdmin,
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
