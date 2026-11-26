<script setup>
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Tag,
  FlaskConical,
  Building2,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Database,
  ArrowLeft,
  ChevronRight,
  Upload,
  Image as ImageIcon,
  Camera,
  X,
  RotateCcw,
  ClipboardPaste,
  Download,
  FileSpreadsheet,
  FileUp,
  Check,
  Lock,
  LogIn,
  HardDrive,
} from 'lucide-vue-next'
import { useRegistrosStore } from '../stores/registros'
import { useAuthStore } from '../stores/auth'
import BrandLogo from '../components/BrandLogo.vue'

const route = useRoute()
const router = useRouter()
const store = useRegistrosStore()
const authStore = useAuthStore()

// Controle da tela ativa ('marcas' | 'produtos' | 'celulas' | null para menu)
const cadastroAtivo = ref(route.query.tipo || null)

watch(
  () => route.query.tipo,
  (novo) => {
    if (novo) {
      cadastroAtivo.value = novo
    }
  },
)

// Estado do formulário de Marca
const novaMarca = ref('')
const novaLogoPreview = ref(null)
const fileInputNovaMarca = ref(null)
const fileInputAlterarMarca = ref(null)
const marcaParaAlterarLogo = ref(null)
const feedbackMarca = ref({ tipo: '', msg: '' })

// Processamento de logo: redimensiona e remove fundo branco para transparência
const processarImagemLogo = (file, callback) => {
  if (!file) return
  if (!file.type.startsWith('image/')) {
    alert('Por favor, selecione um arquivo de imagem válido (PNG, JPG, etc.).')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const img = new window.Image()
    img.onload = () => {
      const maxW = 260
      const maxH = 120
      let w = img.width
      let h = img.height
      if (w > maxW || h > maxH) {
        const ratio = Math.min(maxW / w, maxH / h)
        w = Math.round(w * ratio)
        h = Math.round(h * ratio)
      }

      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, w, h)

      const imgData = ctx.getImageData(0, 0, w, h)
      const data = imgData.data

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        if (r >= 235 && g >= 235 && b >= 235) {
          data[i + 3] = 0
        } else if (r >= 200 && g >= 200 && b >= 200) {
          const min = Math.min(r, g, b)
          data[i + 3] = Math.max(0, Math.min(255, (255 - min) * 4))
        }
      }
      ctx.putImageData(imgData, 0, 0)
      callback(canvas.toDataURL('image/png'))
    }
    img.src = e.target.result
  }
  reader.readAsDataURL(file)
}

const onFileChangeNovaMarca = (event) => {
  const file = event.target.files && event.target.files[0]
  if (file) {
    processarImagemLogo(file, (base64) => {
      novaLogoPreview.value = base64
    })
  }
  event.target.value = ''
}

const limparNovaLogo = () => {
  novaLogoPreview.value = null
}

const abrirUploadParaMarca = (marca) => {
  marcaParaAlterarLogo.value = marca
  if (fileInputAlterarMarca.value) {
    fileInputAlterarMarca.value.click()
  }
}

const onFileChangeAlterarMarca = (event) => {
  const file = event.target.files && event.target.files[0]
  const marca = marcaParaAlterarLogo.value
  if (file && marca) {
    processarImagemLogo(file, (base64) => {
      store.definirLogoMarca(marca, base64)
      feedbackMarca.value = {
        tipo: 'sucesso',
        msg: `Logo da marca "${marca}" atualizada com sucesso!`,
      }
      setTimeout(() => {
        feedbackMarca.value = { tipo: '', msg: '' }
      }, 3500)
    })
  }
  event.target.value = ''
  marcaParaAlterarLogo.value = null
}

const temLogoPersonalizada = (marca) => {
  return !!(store.logosMarcas && store.logosMarcas[marca.toUpperCase()])
}

const restaurarLogoMarca = (marca) => {
  store.removerLogoMarca(marca)
  feedbackMarca.value = {
    tipo: 'sucesso',
    msg: `Logo personalizada de "${marca}" removida (restaurada padrão).`,
  }
  setTimeout(() => {
    feedbackMarca.value = { tipo: '', msg: '' }
  }, 3000)
}

// Estado do formulário de Produto
const novoProduto = ref({
  nome: '',
  valor: '',
})
const feedbackProduto = ref({ tipo: '', msg: '' })

// Estado do formulário de Célula de Produção
const novaCelula = ref('')
const feedbackCelula = ref({ tipo: '', msg: '' })

const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0)
}

// Cadastrar Marca
const salvarMarca = () => {
  if (!novaMarca.value.trim()) return

  const nome = novaMarca.value.trim()
  const res = store.adicionarMarca(nome)
  if (res.ok) {
    if (novaLogoPreview.value) {
      store.definirLogoMarca(nome, novaLogoPreview.value)
    }
    feedbackMarca.value = { tipo: 'sucesso', msg: res.msg }
    novaMarca.value = ''
    novaLogoPreview.value = null
  } else {
    feedbackMarca.value = { tipo: 'erro', msg: res.msg }
  }

  setTimeout(() => {
    feedbackMarca.value = { tipo: '', msg: '' }
  }, 3500)
}

const excluirMarca = (marca) => {
  store.abrirConfirmacaoExclusao({
    titulo: 'Excluir Marca',
    descricao: `Tem certeza que deseja excluir a marca "${marca}"? Esta marca deixará de aparecer para novos abastecimentos.`,
    itemNome: `Marca: ${marca}`,
    onConfirm: () => {
      const res = store.removerMarca(marca)
      return {
        titulo: res.ok ? 'Marca Excluída!' : 'Atenção',
        msg: res.msg,
      }
    },
  })
}

// Cadastrar Produto
const salvarProduto = () => {
  if (!novoProduto.value.nome.trim() || novoProduto.value.valor === '') return

  const res = store.adicionarProduto({
    nome: novoProduto.value.nome,
    valor: novoProduto.value.valor,
  })

  if (res.ok) {
    feedbackProduto.value = { tipo: 'sucesso', msg: res.msg }
    novoProduto.value = { nome: '', valor: '' }
  } else {
    feedbackProduto.value = { tipo: 'erro', msg: res.msg }
  }

  setTimeout(() => {
    feedbackProduto.value = { tipo: '', msg: '' }
  }, 3500)
}

const excluirProduto = (id, nome) => {
  store.abrirConfirmacaoExclusao({
    titulo: 'Excluir Produto Químico',
    descricao: `Tem certeza que deseja remover o produto "${nome}"?`,
    itemNome: `Produto: ${nome}`,
    onConfirm: () => {
      const res = store.removerProduto(id)
      return {
        titulo: res.ok ? 'Produto Excluído!' : 'Atenção',
        msg: res.msg,
      }
    },
  })
}

// Cadastrar Célula de Produção
const salvarCelula = () => {
  if (!novaCelula.value.trim()) return

  const res = store.adicionarCelula(novaCelula.value.trim().toUpperCase())
  if (res.ok) {
    feedbackCelula.value = { tipo: 'sucesso', msg: res.msg }
    novaCelula.value = ''
  } else {
    feedbackCelula.value = { tipo: 'erro', msg: res.msg }
  }

  setTimeout(() => {
    feedbackCelula.value = { tipo: '', msg: '' }
  }, 3500)
}

const excluirCelula = (celula) => {
  store.abrirConfirmacaoExclusao({
    titulo: 'Excluir Célula de Produção',
    descricao: `Tem certeza que deseja excluir a célula "${celula}"? Ela deixará de aparecer nas opções de novos abastecimentos.`,
    itemNome: `Célula: ${celula}`,
    onConfirm: () => {
      const res = store.removerCelula(celula)
      return {
        titulo: res.ok ? 'Célula Excluída!' : 'Atenção',
        msg: res.msg,
      }
    },
  })
}

// Conta quantos abastecimentos já usaram a célula
const contarUsosCelula = (celula) => {
  return store.registros.filter((r) => (r.celula || '').toUpperCase() === celula.toUpperCase())
    .length
}

// Conta quantos abastecimentos já usaram a marca
const contarUsosMarca = (marca) => {
  return store.registros.filter((r) => (r.marca || '').toUpperCase() === marca.toUpperCase()).length
}

// Conta quantos abastecimentos já usaram o produto
const contarUsosProduto = (nome) => {
  return store.registros.filter((r) => (r.produto || '').toLowerCase() === nome.toLowerCase())
    .length
}

// ==========================================
// IMPORTAÇÃO E EXPORTAÇÃO EM LOTE
// ==========================================
const modalImportacaoAberto = ref(false)
const tipoImportacao = ref('marcas') // 'marcas' | 'produtos' | 'celulas'
const textoColado = ref('')
const modoSubstituicao = ref(false)
const inputArquivoLote = ref(null)
const nomeArquivoCarregado = ref('')

const abrirModalImportacao = (tipo) => {
  tipoImportacao.value = tipo || cadastroAtivo.value || 'marcas'
  textoColado.value = ''
  modoSubstituicao.value = false
  nomeArquivoCarregado.value = ''
  modalImportacaoAberto.value = true
}

const fecharModalImportacao = () => {
  modalImportacaoAberto.value = false
}

const limparTextoLote = () => {
  textoColado.value = ''
  nomeArquivoCarregado.value = ''
}

const voltarAoMenu = () => {
  modalImportacaoAberto.value = false
  cadastroAtivo.value = null
}

// Backup e Restauração de Dados
const fileInputBackupRef = ref(null)

const abrirSeletorArquivoBackup = () => {
  fileInputBackupRef.value?.click()
}

const onArquivoBackupSelecionado = (event) => {
  const file = event.target.files && event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const json = JSON.parse(e.target.result)
      store.abrirConfirmacaoExclusao({
        titulo: 'Restaurar Backup do Sistema',
        descricao:
          'Atenção: A restauração substituirá os dados atuais pelos registros deste arquivo de backup. Deseja prosseguir?',
        itemNome: `Arquivo: ${file.name}`,
        onConfirm: () => {
          const res = store.importarBackupCompleto(json)
          return {
            titulo: res.ok ? 'Backup Restaurado!' : 'Atenção',
            msg: res.msg,
          }
        },
      })
    } catch {
      alert(
        'Não foi possível ler o arquivo. Certifique-se de selecionar um arquivo .json válido gerado pelo ControlAbast.',
      )
    }
  }
  reader.readAsText(file, 'UTF-8')
  event.target.value = ''
}

const onKeydownModal = (e) => {
  if (e.key === 'Escape' && modalImportacaoAberto.value) {
    fecharModalImportacao()
  }
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', onKeydownModal)
  }
  if (store.registros.length === 0) {
    store.fetchRegistros()
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', onKeydownModal)
  }
})

watch(cadastroAtivo, () => {
  modalImportacaoAberto.value = false
})

const colarDaAreaTransferencia = async () => {
  try {
    const texto = await navigator.clipboard.readText()
    if (texto) {
      textoColado.value = texto
    }
  } catch {
    alert(
      'Não foi possível ler da área de transferência automaticamente. Por favor, cole usando Ctrl + V dentro da caixa de texto.',
    )
  }
}

const onArquivoLoteSelecionado = (event) => {
  const file = event.target.files && event.target.files[0]
  if (!file) return
  nomeArquivoCarregado.value = file.name
  const reader = new FileReader()
  reader.onload = (e) => {
    textoColado.value = e.target.result || ''
  }
  reader.readAsText(file, 'UTF-8')
  event.target.value = ''
}

const parsePreco = (str) => {
  if (!str) return 0
  const limpo = String(str)
    .replace(/[R$\s]/g, '')
    .trim()
  if (limpo.includes(',') && limpo.includes('.')) {
    return parseFloat(limpo.replace(/\./g, '').replace(',', '.')) || 0
  } else if (limpo.includes(',')) {
    return parseFloat(limpo.replace(',', '.')) || 0
  }
  return parseFloat(limpo) || 0
}

const itensDetectados = computed(() => {
  if (!textoColado.value.trim()) return []
  const linhas = textoColado.value.split(/\r?\n/)
  const tipo = tipoImportacao.value
  const resultado = []

  for (let i = 0; i < linhas.length; i++) {
    let linha = linhas[i].trim()
    if (!linha) continue

    // Ignora cabeçalhos comuns na primeira linha
    if (i === 0) {
      const lower = linha.toLowerCase()
      if (
        lower === 'marca' ||
        lower === 'marcas' ||
        lower === 'célula' ||
        lower === 'celula' ||
        lower === 'células' ||
        lower === 'celulas' ||
        lower.startsWith('produto') ||
        lower.startsWith('nome')
      ) {
        continue
      }
    }

    if (tipo === 'produtos') {
      let nome
      let valor

      if (linha.includes('\t')) {
        const partes = linha.split('\t')
        nome = partes[0].trim()
        valor = parsePreco(partes[1])
      } else if (linha.includes(';')) {
        const partes = linha.split(';')
        nome = partes[0].trim()
        valor = parsePreco(partes[1])
      } else if (linha.includes(',')) {
        const partes = linha.split(',')
        if (partes.length === 2 && !isNaN(parseFloat(partes[1].trim()))) {
          nome = partes[0].trim()
          valor = parsePreco(partes[1])
        } else {
          nome = linha.trim()
          valor = 0
        }
      } else {
        nome = linha.trim()
        valor = 0
      }

      if (nome) {
        resultado.push({ nome, valor })
      }
    } else {
      let nome = linha
      if (linha.includes(';') || linha.includes('\t')) {
        nome = linha.split(/[;\t]/)[0]
      }
      nome = nome
        .replace(/^["']|["']$/g, '')
        .trim()
        .toUpperCase()
      if (nome) {
        resultado.push(nome)
      }
    }
  }

  return resultado
})

const estatisticasImportacao = computed(() => {
  const lista = itensDetectados.value
  const tipo = tipoImportacao.value

  if (tipo === 'produtos') {
    const existentesNomes = store.produtos.map((p) => p.nome.toLowerCase())
    const novos = lista.filter((item) => !existentesNomes.includes(item.nome.toLowerCase())).length
    return {
      total: lista.length,
      novos,
      duplicados: lista.length - novos,
    }
  } else if (tipo === 'marcas') {
    const existentes = store.marcas.map((m) => m.toUpperCase())
    const novos = lista.filter((item) => !existentes.includes(item)).length
    return {
      total: lista.length,
      novos,
      duplicados: lista.length - novos,
    }
  } else {
    const existentes = store.celulas.map((c) => c.toUpperCase())
    const novos = lista.filter((item) => !existentes.includes(item)).length
    return {
      total: lista.length,
      novos,
      duplicados: lista.length - novos,
    }
  }
})

const executarImportacao = () => {
  const tipo = tipoImportacao.value
  const lista = itensDetectados.value
  const substituir = modoSubstituicao.value

  if (lista.length === 0) {
    alert('Nenhum item válido foi identificado para importação.')
    return
  }

  if (tipo === 'marcas') {
    const res = store.importarMarcasEmLote(lista, substituir)
    feedbackMarca.value = {
      tipo: 'sucesso',
      msg: `${res.adicionados} marcas importadas com sucesso! (${res.ignorados} duplicadas ignoradas)`,
    }
    setTimeout(() => (feedbackMarca.value = { tipo: '', msg: '' }), 4000)
  } else if (tipo === 'produtos') {
    const res = store.importarProdutosEmLote(lista, substituir)
    feedbackProduto.value = {
      tipo: 'sucesso',
      msg: `${res.adicionados} produtos importados com sucesso! (${res.ignorados} duplicados ignorados)`,
    }
    setTimeout(() => (feedbackProduto.value = { tipo: '', msg: '' }), 4000)
  } else if (tipo === 'celulas') {
    const res = store.importarCelulasEmLote(lista, substituir)
    feedbackCelula.value = {
      tipo: 'sucesso',
      msg: `${res.adicionados} células importadas com sucesso! (${res.ignorados} duplicadas ignoradas)`,
    }
    setTimeout(() => (feedbackCelula.value = { tipo: '', msg: '' }), 4000)
  }

  fecharModalImportacao()
}

const exportarLista = (tipo) => {
  const t = tipo || cadastroAtivo.value || 'marcas'
  let csv = ''
  let nomeArquivo = ''

  if (t === 'marcas') {
    csv = 'Marca\r\n' + store.marcas.join('\r\n')
    nomeArquivo = `marcas_calcados_${new Date().toISOString().slice(0, 10)}.csv`
  } else if (t === 'produtos') {
    csv = 'Produto;Valor_Kg_L\r\n'
    csv += store.produtos
      .map((p) => `"${p.nome}";"${(p.valor || 0).toFixed(2).replace('.', ',')}"`)
      .join('\r\n')
    nomeArquivo = `produtos_quimicos_${new Date().toISOString().slice(0, 10)}.csv`
  } else if (t === 'celulas') {
    csv = 'Celula\r\n' + store.celulas.join('\r\n')
    nomeArquivo = `celulas_producao_${new Date().toISOString().slice(0, 10)}.csv`
  }

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', nomeArquivo)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<template>
  <div class="cadastros-page">
    <!-- Se NÃO for administrador -->
    <div v-if="!store.isAdmin" class="modern-card acesso-restrito-box">
      <div class="restrito-icon-wrap">
        <Lock :size="36" />
      </div>
      <h2>Acesso Restrito</h2>
      <p>A tela de Cadastros Gerais é restrita aos administradores autorizados.</p>
      <div class="restrito-actions">
        <button type="button" @click="authStore.abrirModalLogin()" class="btn-primary">
          <LogIn :size="16" />
          <span>Fazer Login como Administrador</span>
        </button>
        <button type="button" @click="router.push('/')" class="btn-secondary">
          <span>Voltar para o Início</span>
        </button>
      </div>
    </div>

    <!-- Se FOR administrador -->
    <template v-else>
      <!-- Header -->
      <div class="page-header">
        <div class="header-badge">
          <Database :size="15" />
          <span>Setor Químico • Configurações</span>
        </div>
        <h1 class="page-title">Cadastros Gerais</h1>
        <p class="page-subtitle">
          {{
            !cadastroAtivo
              ? 'Selecione abaixo o cadastro que deseja visualizar e gerenciar:'
              : 'Gerenciamento de itens cadastrados no sistema'
          }}
        </p>
      </div>

      <!-- 1. TELA INICIAL: LISTA DE BOTÕES PARA ESCOLHER -->
      <div v-if="!cadastroAtivo" class="cadastros-menu-container">
        <div class="cadastros-buttons-list">
          <!-- Botão 1: Marcas -->
          <button type="button" @click="cadastroAtivo = 'marcas'" class="btn-cadastro-opcao">
            <div class="opcao-icon-wrap tag-glow">
              <Tag :size="24" />
            </div>
            <div class="opcao-text">
              <h3>Marcas</h3>
              <p>Gerencie as marcas disponíveis no formulário de abastecimento</p>
            </div>
            <div class="opcao-meta">
              <span class="opcao-badge">{{ store.marcas.length }} cadastradas</span>
              <ChevronRight :size="20" class="opcao-arrow" />
            </div>
          </button>

          <!-- Botão 2: Produtos Químicos -->
          <button type="button" @click="cadastroAtivo = 'produtos'" class="btn-cadastro-opcao">
            <div class="opcao-icon-wrap flask-glow">
              <FlaskConical :size="24" />
            </div>
            <div class="opcao-text">
              <h3>Produtos</h3>
              <p>Cadastre insumos químicos com nome e valor unitário (R$)</p>
            </div>
            <div class="opcao-meta">
              <span class="opcao-badge">{{ store.produtos.length }} cadastrados</span>
              <ChevronRight :size="20" class="opcao-arrow" />
            </div>
          </button>

          <!-- Botão 3: Células de Produção -->
          <button type="button" @click="cadastroAtivo = 'celulas'" class="btn-cadastro-opcao">
            <div class="opcao-icon-wrap building-glow">
              <Building2 :size="24" />
            </div>
            <div class="opcao-text">
              <h3>Células</h3>
              <p>Gerencie as células e setores disponíveis na lista suspensa</p>
            </div>
            <div class="opcao-meta">
              <span class="opcao-badge">{{ store.celulas.length }} cadastradas</span>
              <ChevronRight :size="20" class="opcao-arrow" />
            </div>
          </button>

          <!-- Botão 4: Backup & Segurança de Dados -->
          <button type="button" @click="cadastroAtivo = 'backup'" class="btn-cadastro-opcao">
            <div class="opcao-icon-wrap backup-glow">
              <HardDrive :size="24" />
            </div>
            <div class="opcao-text">
              <h3>Backup & Dados</h3>
              <p>Exporte cópia de segurança em JSON ou restaure os dados do sistema</p>
            </div>
            <div class="opcao-meta">
              <span class="opcao-badge">Segurança</span>
              <ChevronRight :size="20" class="opcao-arrow" />
            </div>
          </button>
        </div>
      </div>

      <!-- 2. TELA DO CADASTRO ESCOLHIDO -->
      <div v-else class="cadastro-screen-wrapper">
        <!-- Barra Superior de Navegação -->
        <div class="cadastro-nav-bar">
          <button type="button" @click="voltarAoMenu" class="btn-back-menu">
            <ArrowLeft :size="16" /> Voltar aos Cadastros
          </button>

          <!-- Abas para alternar rapidamente -->
          <div class="cadastros-tab-buttons">
            <button
              type="button"
              :class="['btn-tab-pill', { active: cadastroAtivo === 'marcas' }]"
              @click="cadastroAtivo = 'marcas'"
            >
              <Tag :size="14" /> Marcas ({{ store.marcas.length }})
            </button>

            <button
              type="button"
              :class="['btn-tab-pill', { active: cadastroAtivo === 'produtos' }]"
              @click="cadastroAtivo = 'produtos'"
            >
              <FlaskConical :size="14" /> Produtos ({{ store.produtos.length }})
            </button>

            <button
              type="button"
              :class="['btn-tab-pill', { active: cadastroAtivo === 'celulas' }]"
              @click="cadastroAtivo = 'celulas'"
            >
              <Building2 :size="14" /> Células ({{ store.celulas.length }})
            </button>

            <button
              type="button"
              :class="['btn-tab-pill', { active: cadastroAtivo === 'backup' }]"
              @click="cadastroAtivo = 'backup'"
            >
              <HardDrive :size="14" /> Backup & Dados
            </button>
          </div>

          <!-- Botões de Ação em Lote (Importar / Exportar) - Oculto na aba Backup -->
          <div v-if="cadastroAtivo !== 'backup'" class="lote-nav-actions">
            <button
              type="button"
              class="btn-nav-lote btn-nav-import"
              @click="abrirModalImportacao(cadastroAtivo)"
              title="Importar lista do computador ou colar do Excel"
            >
              <ClipboardPaste :size="14" />
              <span>Importar / Colar</span>
            </button>

            <button
              type="button"
              class="btn-nav-lote btn-nav-export"
              @click="exportarLista(cadastroAtivo)"
              title="Exportar esta lista salva para arquivo Excel (.CSV)"
            >
              <Download :size="14" />
              <span>Exportar (.CSV)</span>
            </button>
          </div>
        </div>

        <!-- Tela: Marcas de Calçados -->
        <div v-if="cadastroAtivo === 'marcas'" class="modern-card cadastro-card">
          <div class="card-header">
            <div class="card-icon-title">
              <div class="icon-wrap tag-glow">
                <Tag :size="20" />
              </div>
              <div>
                <h3>Marcas de Calçados</h3>
                <p>Gerencie as marcas disponíveis no formulário de abastecimento</p>
              </div>
            </div>
            <span class="count-badge">{{ store.marcas.length }} marcas</span>
          </div>

          <!-- Alerta Marca -->
          <div
            v-if="feedbackMarca.msg"
            :class="feedbackMarca.tipo === 'sucesso' ? 'alert-success' : 'alert-danger'"
          >
            <CheckCircle2 v-if="feedbackMarca.tipo === 'sucesso'" :size="18" />
            <AlertCircle v-else :size="18" />
            <span>{{ feedbackMarca.msg }}</span>
          </div>

          <!-- Form Adicionar Marca -->
          <form @submit.prevent="salvarMarca" class="inline-add-form brand-form-grid">
            <input
              type="text"
              v-model="novaMarca"
              class="modern-input"
              placeholder="Digite o nome da marca..."
              required
            />

            <!-- Upload de Logo na Nova Marca -->
            <input
              type="file"
              ref="fileInputNovaMarca"
              accept="image/*"
              @change="onFileChangeNovaMarca"
              style="display: none"
            />

            <div class="logo-field-wrapper">
              <button
                type="button"
                class="btn-choose-logo"
                @click="fileInputNovaMarca && fileInputNovaMarca.click()"
                :title="
                  novaLogoPreview
                    ? 'Trocar imagem selecionada'
                    : 'Selecionar imagem da logo (PNG, JPG)'
                "
              >
                <Upload :size="15" />
                <span>{{ novaLogoPreview ? 'Logo anexada' : 'Anexar Logo' }}</span>
              </button>

              <div v-if="novaLogoPreview" class="logo-preview-box">
                <img :src="novaLogoPreview" alt="Prévia da logo" class="logo-preview-img" />
                <button
                  type="button"
                  @click="limparNovaLogo"
                  class="btn-clear-logo-preview"
                  title="Remover imagem"
                >
                  <X :size="12" />
                </button>
              </div>
            </div>

            <button type="submit" class="btn-primary"><Plus :size="16" /> Cadastrar Marca</button>
          </form>

          <!-- Input Oculto para Trocar Logo de Marca Existente -->
          <input
            type="file"
            ref="fileInputAlterarMarca"
            accept="image/*"
            @change="onFileChangeAlterarMarca"
            style="display: none"
          />

          <!-- Lista de Marcas -->
          <div class="items-list-container">
            <table class="items-table">
              <thead>
                <tr>
                  <th style="width: 80px" class="text-center">Logo</th>
                  <th>Marca</th>
                  <th class="text-center">Lançamentos</th>
                  <th v-if="store.isAdmin" class="text-right">Ação</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="store.marcas.length === 0">
                  <td colspan="4" class="text-center text-muted" style="padding: 24px">
                    Nenhuma marca cadastrada. Utilize o campo acima para adicionar.
                  </td>
                </tr>
                <tr v-for="m in store.marcas" :key="m">
                  <td class="text-center">
                    <div
                      class="brand-table-logo-wrap"
                      :class="{ 'clickable-logo': store.isAdmin }"
                      :title="store.isAdmin ? 'Clique para trocar a imagem da logo' : ''"
                      @click="store.isAdmin && abrirUploadParaMarca(m)"
                    >
                      <div class="brand-table-logo">
                        <BrandLogo :marca="m" />
                      </div>
                      <span v-if="store.isAdmin" class="logo-change-badge" title="Trocar imagem">
                        <Camera :size="10" />
                      </span>
                    </div>
                  </td>
                  <td>
                    <div class="brand-name-wrap">
                      <span class="brand-item-badge">{{ m }}</span>
                      <span
                        v-if="temLogoPersonalizada(m)"
                        class="custom-logo-pill"
                        title="Logo personalizada ativa"
                      >
                        Personalizada
                      </span>
                    </div>
                  </td>
                  <td class="text-center text-muted">{{ contarUsosMarca(m) }} reg.</td>
                  <td v-if="store.isAdmin" class="text-right">
                    <div class="brand-actions-group">
                      <button
                        type="button"
                        @click="abrirUploadParaMarca(m)"
                        class="btn-icon-brand-upload"
                        title="Enviar / Trocar Logo"
                      >
                        <ImageIcon :size="16" />
                      </button>
                      <button
                        v-if="temLogoPersonalizada(m)"
                        type="button"
                        @click="restaurarLogoMarca(m)"
                        class="btn-icon-brand-restore"
                        title="Restaurar logo padrão"
                      >
                        <RotateCcw :size="15" />
                      </button>
                      <button
                        type="button"
                        @click="excluirMarca(m)"
                        class="btn-icon-danger"
                        title="Excluir marca"
                      >
                        <Trash2 :size="16" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tela: Produtos Químicos -->
        <div v-else-if="cadastroAtivo === 'produtos'" class="modern-card cadastro-card">
          <div class="card-header">
            <div class="card-icon-title">
              <div class="icon-wrap flask-glow">
                <FlaskConical :size="20" />
              </div>
              <div>
                <h3>Produtos Químicos</h3>
                <p>Cadastre insumos com nome e valor unitário (R$)</p>
              </div>
            </div>
            <span class="count-badge">{{ store.produtos.length }} produtos</span>
          </div>

          <!-- Alerta Produto -->
          <div
            v-if="feedbackProduto.msg"
            :class="feedbackProduto.tipo === 'sucesso' ? 'alert-success' : 'alert-danger'"
          >
            <CheckCircle2 v-if="feedbackProduto.tipo === 'sucesso'" :size="18" />
            <AlertCircle v-else :size="18" />
            <span>{{ feedbackProduto.msg }}</span>
          </div>

          <!-- Form Adicionar Produto -->
          <form @submit.prevent="salvarProduto" class="product-add-form">
            <div class="form-grid-prod">
              <div class="input-group">
                <label>Nome do Produto</label>
                <input
                  type="text"
                  v-model="novoProduto.nome"
                  class="modern-input"
                  placeholder="Nome do produto químico..."
                  required
                />
              </div>

              <div class="input-group">
                <label>Valor do Produto (R$)</label>
                <div class="input-with-prefix">
                  <span class="prefix">R$</span>
                  <input
                    type="number"
                    v-model="novoProduto.valor"
                    class="modern-input pl-currency"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
            </div>

            <button type="submit" class="btn-primary btn-add-full">
              <Plus :size="16" /> Cadastrar Produto Químico
            </button>
          </form>

          <!-- Lista de Produtos -->
          <div class="items-list-container">
            <table class="items-table">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th class="text-right">Valor Unitário</th>
                  <th v-if="store.isAdmin" class="text-right">Ação</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="store.produtos.length === 0">
                  <td colspan="3" class="text-center text-muted" style="padding: 24px">
                    Nenhum produto químico cadastrado. Utilize o formulário acima para adicionar.
                  </td>
                </tr>
                <tr v-for="p in store.produtos" :key="p.id">
                  <td class="font-medium">
                    {{ p.nome }}
                    <span class="sub-uses">{{ contarUsosProduto(p.nome) }} abastecimentos</span>
                  </td>
                  <td class="text-right font-bold text-primary">
                    {{ formatarMoeda(p.valor) }}
                  </td>
                  <td v-if="store.isAdmin" class="text-right">
                    <button
                      type="button"
                      @click="excluirProduto(p.id, p.nome)"
                      class="btn-icon-danger"
                      title="Excluir produto"
                    >
                      <Trash2 :size="16" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tela: Células de Produção -->
        <div v-else-if="cadastroAtivo === 'celulas'" class="modern-card cadastro-card">
          <div class="card-header">
            <div class="card-icon-title">
              <div class="icon-wrap building-glow">
                <Building2 :size="20" />
              </div>
              <div>
                <h3>Células de Produção</h3>
                <p>Gerencie as células e setores disponíveis na lista suspensa</p>
              </div>
            </div>
            <span class="count-badge">{{ store.celulas.length }} células</span>
          </div>

          <!-- Alerta Célula -->
          <div
            v-if="feedbackCelula.msg"
            :class="feedbackCelula.tipo === 'sucesso' ? 'alert-success' : 'alert-danger'"
          >
            <CheckCircle2 v-if="feedbackCelula.tipo === 'sucesso'" :size="18" />
            <AlertCircle v-else :size="18" />
            <span>{{ feedbackCelula.msg }}</span>
          </div>

          <!-- Form Adicionar Célula -->
          <form @submit.prevent="salvarCelula" class="inline-add-form">
            <input
              type="text"
              v-model="novaCelula"
              class="modern-input uppercase-input"
              placeholder="Nome da célula de produção..."
              required
              @input="novaCelula = novaCelula.toUpperCase()"
            />
            <button type="submit" class="btn-primary btn-emerald">
              <Plus :size="16" /> Cadastrar Célula
            </button>
          </form>

          <!-- Lista de Células -->
          <div class="items-list-container">
            <table class="items-table">
              <thead>
                <tr>
                  <th>Célula de Produção</th>
                  <th class="text-center">Lançamentos</th>
                  <th v-if="store.isAdmin" class="text-right">Ação</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="store.celulas.length === 0">
                  <td colspan="3" class="text-center text-muted" style="padding: 24px">
                    Nenhuma célula de produção cadastrada. Utilize o campo acima para adicionar.
                  </td>
                </tr>
                <tr v-for="c in store.celulas" :key="c">
                  <td>
                    <span class="brand-item-badge cell-item-badge">{{ c }}</span>
                  </td>
                  <td class="text-center text-muted">{{ contarUsosCelula(c) }} reg.</td>
                  <td v-if="store.isAdmin" class="text-right">
                    <button
                      type="button"
                      @click="excluirCelula(c)"
                      class="btn-icon-danger"
                      title="Excluir célula"
                    >
                      <Trash2 :size="16" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tela: Backup e Restauração de Dados -->
        <div v-else-if="cadastroAtivo === 'backup'" class="modern-card cadastro-card">
          <div class="card-header">
            <div class="card-icon-title">
              <div class="icon-wrap backup-glow">
                <HardDrive :size="20" />
              </div>
              <div>
                <h3>Backup & Segurança de Dados</h3>
                <p>
                  Exporte uma cópia completa de segurança ou restaure seus dados a partir de um
                  arquivo JSON
                </p>
              </div>
            </div>
          </div>

          <div class="backup-section-content">
            <div class="backup-stats-grid">
              <div class="backup-stat-item">
                <span class="stat-num">{{ store.marcas.length }}</span>
                <span class="stat-desc">Marcas</span>
              </div>
              <div class="backup-stat-item">
                <span class="stat-num">{{ store.produtos.length }}</span>
                <span class="stat-desc">Produtos Químicos</span>
              </div>
              <div class="backup-stat-item">
                <span class="stat-num">{{ store.celulas.length }}</span>
                <span class="stat-desc">Células de Produção</span>
              </div>
              <div class="backup-stat-item">
                <span class="stat-num">{{ store.registros.length }}</span>
                <span class="stat-desc">Lançamentos Históricos</span>
              </div>
            </div>

            <div class="backup-actions-grid">
              <!-- Card Exportar -->
              <div class="backup-action-card">
                <div class="action-card-header">
                  <div class="icon-circle circle-export">
                    <Download :size="20" />
                  </div>
                  <div>
                    <h4>Exportar Backup Completo</h4>
                    <span class="action-card-sub">Download imediato de todos os dados</span>
                  </div>
                </div>
                <p class="action-card-desc">
                  Gere um arquivo <strong>.json</strong> estruturado contendo todos os cadastros
                  (marcas, produtos, células, administradores) e todo o histórico de lançamentos
                  para manter uma cópia de segurança segura.
                </p>
                <button
                  type="button"
                  @click="store.exportarBackupCompleto"
                  class="btn-primary btn-backup-action"
                >
                  <Download :size="16" /> Baixar Backup (.JSON)
                </button>
              </div>

              <!-- Card Restaurar -->
              <div class="backup-action-card">
                <div class="action-card-header">
                  <div class="icon-circle circle-restore">
                    <Upload :size="20" />
                  </div>
                  <div>
                    <h4>Restaurar Backup</h4>
                    <span class="action-card-sub">Carregar dados a partir de arquivo JSON</span>
                  </div>
                </div>
                <p class="action-card-desc">
                  Selecione um arquivo <strong>.json</strong> exportado anteriormente pelo sistema
                  para recuperar e atualizar os dados no navegador deste dispositivo com confirmação
                  prévia.
                </p>
                <input
                  ref="fileInputBackupRef"
                  type="file"
                  accept=".json,application/json"
                  style="display: none"
                  @change="onArquivoBackupSelecionado"
                />
                <button
                  type="button"
                  @click="abrirSeletorArquivoBackup"
                  class="btn-secondary btn-backup-action"
                >
                  <Upload :size="16" /> Carregar Arquivo de Backup
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- MODAL DE IMPORTAÇÃO EM LOTE / COPIAR E COLAR -->
      <Teleport to="body">
        <Transition name="fade">
          <div
            v-if="modalImportacaoAberto"
            class="lote-modal-backdrop"
            @click.self="fecharModalImportacao"
          >
            <div class="modal-content modal-lote-dialog">
              <!-- Cabeçalho do Modal -->
              <div class="modal-lote-header">
                <div class="modal-lote-title-wrap">
                  <div class="lote-modal-icon">
                    <ClipboardPaste :size="22" />
                  </div>
                  <div>
                    <h3>
                      Importar Lista •
                      {{
                        tipoImportacao === 'marcas'
                          ? 'Marcas de Calçados'
                          : tipoImportacao === 'produtos'
                            ? 'Produtos Químicos'
                            : 'Células de Produção'
                      }}
                    </h3>
                    <p>
                      Cole uma lista do Excel / Bloco de Notas ou selecione um arquivo do computador
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  class="btn-close-modal"
                  @click="fecharModalImportacao"
                  title="Fechar"
                >
                  <X :size="18" />
                </button>
              </div>

              <!-- Seletor de Tipo -->
              <div class="modal-lote-type-selector">
                <button
                  type="button"
                  :class="['btn-lote-type', { active: tipoImportacao === 'marcas' }]"
                  @click="tipoImportacao = 'marcas'"
                >
                  <Tag :size="14" /> Marcas
                </button>
                <button
                  type="button"
                  :class="['btn-lote-type', { active: tipoImportacao === 'produtos' }]"
                  @click="tipoImportacao = 'produtos'"
                >
                  <FlaskConical :size="14" /> Produtos
                </button>
                <button
                  type="button"
                  :class="['btn-lote-type', { active: tipoImportacao === 'celulas' }]"
                  @click="tipoImportacao = 'celulas'"
                >
                  <Building2 :size="14" /> Células
                </button>
              </div>

              <!-- Barra de Ações Rápidas de Entrada -->
              <div class="lote-input-toolbar">
                <button type="button" class="btn-toolbar-action" @click="colarDaAreaTransferencia">
                  <ClipboardPaste :size="15" /> Colar do Teclado / Clipboard
                </button>

                <label class="btn-toolbar-action btn-upload-file-label">
                  <FileUp :size="15" /> Escolher Arquivo (.csv, .txt)
                  <input
                    type="file"
                    ref="inputArquivoLote"
                    accept=".csv, .txt"
                    @change="onArquivoLoteSelecionado"
                    style="display: none"
                  />
                </label>

                <button
                  v-if="textoColado"
                  type="button"
                  class="btn-toolbar-clear"
                  @click="limparTextoLote"
                >
                  <X :size="14" /> Limpar
                </button>
              </div>

              <div v-if="nomeArquivoCarregado" class="loaded-file-badge">
                <FileSpreadsheet :size="14" />
                <span
                  >Arquivo carregado: <strong>{{ nomeArquivoCarregado }}</strong></span
                >
              </div>

              <!-- Área de Texto para Digitar / Colar -->
              <div class="lote-textarea-wrapper">
                <textarea
                  v-model="textoColado"
                  class="lote-textarea"
                  rows="6"
                  :placeholder="
                    tipoImportacao === 'produtos'
                      ? 'Cole as linhas aqui...\nExemplo:\nADESIVO POLIURETANO \t 45,90\nPRIMER UV \t 32,00\nLIMPADOR \t 18,50'
                      : 'Cole as linhas aqui (uma por linha)...\nExemplo:\n' +
                        (tipoImportacao === 'marcas'
                          ? 'NIKE\nFILA\nUMBRO\nADIDAS'
                          : 'CÉLULA 01\nCÉLULA 02\nCÉLULA 03')
                  "
                ></textarea>
              </div>

              <!-- Painel de Pré-visualização e Estatísticas -->
              <div v-if="itensDetectados.length > 0" class="lote-preview-panel">
                <div class="lote-stats-summary">
                  <span class="stat-pill total">
                    <strong>{{ estatisticasImportacao.total }}</strong> itens detectados
                  </span>
                  <span class="stat-pill novos">
                    <strong>{{ estatisticasImportacao.novos }}</strong> novos para cadastrar
                  </span>
                  <span v-if="estatisticasImportacao.duplicados > 0" class="stat-pill duplicados">
                    <strong>{{ estatisticasImportacao.duplicados }}</strong> já cadastrados
                    (ignorados)
                  </span>
                </div>

                <!-- Prévia dos primeiros itens -->
                <div class="lote-preview-list">
                  <span class="preview-title">Prévia dos itens encontrados:</span>
                  <div class="preview-tags">
                    <span
                      v-for="(item, idx) in itensDetectados.slice(0, 12)"
                      :key="idx"
                      class="preview-tag-item"
                    >
                      {{
                        tipoImportacao === 'produtos'
                          ? `${item.nome} (${formatarMoeda(item.valor)})`
                          : item
                      }}
                    </span>
                    <span v-if="itensDetectados.length > 12" class="preview-more-count">
                      +{{ itensDetectados.length - 12 }} itens...
                    </span>
                  </div>
                </div>

                <!-- Opção de Substituição -->
                <div class="lote-mode-option">
                  <label class="checkbox-label">
                    <input type="checkbox" v-model="modoSubstituicao" />
                    <span
                      >Substituir lista existente inteira (se desmarcado, apenas adiciona os novos
                      mantendo os atuais)</span
                    >
                  </label>
                </div>
              </div>

              <!-- Rodapé do Modal -->
              <div class="modal-lote-footer">
                <button type="button" class="btn-cancel" @click="fecharModalImportacao">
                  Cancelar
                </button>

                <button
                  type="button"
                  class="btn-primary btn-confirm-import"
                  :disabled="itensDetectados.length === 0"
                  @click="executarImportacao"
                >
                  <Check :size="16" />
                  <span>Confirmar e Importar ({{ estatisticasImportacao.novos }} novos)</span>
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </template>
  </div>
</template>

<style scoped>
.acesso-restrito-box {
  max-width: 520px;
  margin: 60px auto;
  text-align: center;
  padding: 48px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border);
}

.acesso-restrito-box h2 {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
}

.acesso-restrito-box p {
  font-size: 0.95rem;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.5;
}

.restrito-icon-wrap {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #fee2e2;
  color: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.restrito-actions {
  display: flex;
  gap: 12px;
  margin-top: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.cadastros-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #ede9fe;
  color: #6d28d9;
  padding: 5px 12px;
  border-radius: 9999px;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.3px;
  margin-bottom: 8px;
  border: 1px solid #ddd6fe;
}

/* 1. Menu de Escolha com Botões Grandes */
.cadastros-menu-container {
  max-width: 640px;
}

.cadastros-buttons-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.btn-cadastro-opcao {
  display: flex;
  align-items: center;
  gap: 18px;
  background: white;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 18px 22px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: var(--shadow-sm);
  width: 100%;
}

.btn-cadastro-opcao:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: #cbd5e1;
}

.opcao-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.opcao-text {
  flex: 1;
}

.opcao-text h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 2px;
}

.opcao-text p {
  font-size: 0.84rem;
  color: var(--text-muted);
}

.opcao-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.opcao-badge {
  font-size: 0.78rem;
  font-weight: 700;
  color: #475569;
  background: #f1f5f9;
  padding: 4px 10px;
  border-radius: 9999px;
  border: 1px solid #e2e8f0;
}

.opcao-arrow {
  color: #94a3b8;
  transition: transform 0.2s;
}

.btn-cadastro-opcao:hover .opcao-arrow {
  transform: translateX(4px);
  color: var(--primary);
}

/* 2. Barra de Navegação e Telas Específicas */
.cadastro-screen-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 720px;
}

.cadastro-nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-back-menu {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: white;
  border: 1px solid var(--border);
  color: #475569;
  font-size: 0.84rem;
  font-weight: 600;
  padding: 8px 14px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-back-menu:hover {
  background: #f8fafc;
  color: var(--text-main);
  border-color: #cbd5e1;
}

.cadastros-tab-buttons {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f1f5f9;
  padding: 4px;
  border-radius: var(--radius-md);
}

.btn-tab-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-tab-pill:hover {
  color: var(--text-main);
}

.btn-tab-pill.active {
  background: white;
  color: var(--text-main);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  font-weight: 700;
}

/* Card Específico */
.cadastro-card {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.card-icon-title {
  display: flex;
  align-items: center;
  gap: 14px;
}

.card-icon-title h3 {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-main);
  letter-spacing: -0.3px;
}

.card-icon-title p {
  font-size: 0.82rem;
  color: var(--text-muted);
  margin-top: 2px;
}

.icon-wrap {
  width: 42px;
  height: 42px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tag-glow {
  background: #f1f5f9;
  color: #0f172a;
}

.flask-glow {
  background: #eef2ff;
  color: #4f46e5;
}

.building-glow {
  background: #ecfdf5;
  color: #059669;
}

.count-badge {
  background: #f1f5f9;
  color: #475569;
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 0.78rem;
  font-weight: 700;
}

/* Formulário de Marca */
.inline-add-form {
  display: flex;
  gap: 10px;
}

.inline-add-form input {
  flex: 1;
}

/* Formulário de Produto */
.product-add-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-grid-prod {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 12px;
}

@media (max-width: 500px) {
  .form-grid-prod {
    grid-template-columns: 1fr;
  }
}

.btn-add-full {
  width: 100%;
}

.input-with-prefix {
  position: relative;
  display: flex;
  align-items: center;
}

.input-with-prefix .prefix {
  position: absolute;
  left: 14px;
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.pl-currency {
  padding-left: 42px !important;
  width: 100%;
}

/* Tabela de Itens */
.items-list-container {
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
  max-height: 380px;
  overflow-y: auto;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
}

.items-table th {
  background: #f8fafc;
  padding: 10px 16px;
  font-weight: 700;
  font-size: 0.75rem;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 1;
}

.items-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
}

.items-table tbody tr:hover {
  background-color: #f8fafc;
}

.brand-cell-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-name-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.uppercase-input {
  text-transform: uppercase;
}

.brand-table-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 24px;
  background: transparent;
  border: none;
}

.brand-item-badge {
  display: inline-block;
  background: #0f172a;
  color: white;
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: 800;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
}

.cell-item-badge {
  background: #047857;
  color: #ffffff;
}

.btn-emerald {
  background: #059669 !important;
}

.sub-uses {
  display: block;
  font-size: 0.72rem;
  color: var(--text-light);
  font-weight: 400;
  margin-top: 2px;
}

.text-primary {
  color: var(--primary);
}

.text-muted {
  color: var(--text-muted);
}

.font-medium {
  font-weight: 600;
}

.font-bold {
  font-weight: 700;
}

.text-right {
  text-align: right;
}

.text-center {
  text-align: center;
}

.btn-icon-danger {
  background: transparent;
  border: none;
  color: #ef4444;
  padding: 6px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-icon-danger:hover {
  background: #fee2e2;
  transform: scale(1.1);
}

.alert-danger {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.88rem;
  font-weight: 500;
  animation: slideDown 0.3s ease;
}

/* Upload e Gestão de Logos */
.brand-form-grid {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.brand-form-grid input.modern-input {
  min-width: 220px;
  flex: 2;
}

.logo-field-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-choose-logo {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  color: #475569;
  padding: 9px 12px;
  border-radius: var(--radius-sm);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-choose-logo:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
  color: #1e293b;
}

.logo-preview-box {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 6px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  height: 36px;
}

.logo-preview-img {
  max-height: 26px;
  max-width: 60px;
  object-fit: contain;
}

.btn-clear-logo-preview {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-clear-logo-preview:hover {
  color: #ef4444;
  background: #fee2e2;
}

.brand-table-logo-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.brand-table-logo-wrap.clickable-logo {
  cursor: pointer;
}

.brand-table-logo-wrap.clickable-logo:hover .brand-table-logo {
  transform: scale(1.08);
}

.logo-change-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #3b82f6;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
}

.brand-table-logo-wrap:hover .logo-change-badge {
  opacity: 1;
}

.custom-logo-pill {
  font-size: 0.68rem;
  font-weight: 700;
  color: #2563eb;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  padding: 2px 6px;
  border-radius: 9999px;
  letter-spacing: 0.3px;
}

.brand-actions-group {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.btn-icon-brand-upload {
  background: transparent;
  border: none;
  color: #3b82f6;
  padding: 6px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-icon-brand-upload:hover {
  background: #eff6ff;
  color: #1d4ed8;
  transform: scale(1.1);
}

.btn-icon-brand-restore {
  background: transparent;
  border: none;
  color: #f59e0b;
  padding: 6px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-icon-brand-restore:hover {
  background: #fef3c7;
  color: #b45309;
  transform: scale(1.1);
}

/* Painel Rápido de Lote na Tela Inicial */
.lote-quick-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 24px;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: var(--radius-lg);
}

.lote-panel-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.lote-panel-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: #eef2ff;
  color: #4f46e5;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.lote-panel-header h4 {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 2px;
}

.lote-panel-header p {
  font-size: 0.82rem;
  color: var(--text-muted);
}

.lote-panel-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.btn-lote-card {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #334155;
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.btn-lote-card:hover {
  border-color: #6366f1;
  color: #4f46e5;
  background: #f5f3ff;
  transform: translateY(-1px);
}

/* Ações em Lote na Barra de Navegação */
.cadastro-nav-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.lote-nav-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.btn-nav-lote {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-nav-import {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
}

.btn-nav-import:hover {
  background: #dcfce7;
  border-color: #86efac;
}

.btn-nav-export {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1e40af;
}

.btn-nav-export:hover {
  background: #dbeafe;
  border-color: #93c5fd;
}

/* Modal de Importação em Lote */
.lote-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 999999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(4px);
  padding: 16px;
  overflow-y: auto;
}

.modal-lote-dialog {
  max-width: 650px;
  width: 100%;
  background: white;
  border-radius: 14px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  margin: auto;
  animation: modalScaleUp 0.2s ease-out;
}

@keyframes modalScaleUp {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.modal-lote-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.modal-lote-title-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.lote-modal-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: #e0e7ff;
  color: #4338ca;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.modal-lote-title-wrap h3 {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 2px;
}

.modal-lote-title-wrap p {
  font-size: 0.82rem;
  color: var(--text-muted);
}

.modal-lote-type-selector {
  display: flex;
  gap: 6px;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 8px;
}

.btn-lote-type {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 0.84rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-lote-type.active {
  background: white;
  color: #0f172a;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  font-weight: 700;
}

.lote-input-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.btn-toolbar-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-toolbar-action:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
  color: #0f172a;
}

.btn-toolbar-clear {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 8px;
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 0.78rem;
  cursor: pointer;
}

.btn-toolbar-clear:hover {
  color: #ef4444;
}

.loaded-file-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  color: #065f46;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
}

.lote-textarea {
  width: 100%;
  font-family: monospace;
  font-size: 0.85rem;
  line-height: 1.5;
  padding: 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  resize: vertical;
  color: #1e293b;
  background: #fcfcfd;
  box-sizing: border-box;
}

.lote-textarea:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.lote-preview-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.lote-stats-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.stat-pill {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 500;
}

.stat-pill.total {
  background: #f1f5f9;
  color: #334155;
}

.stat-pill.novos {
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
}

.stat-pill.duplicados {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fde68a;
}

.lote-preview-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.preview-title {
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
}

.preview-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.preview-tag-item {
  background: white;
  border: 1px solid #cbd5e1;
  color: #1e293b;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.76rem;
  font-weight: 600;
}

.preview-more-count {
  font-size: 0.76rem;
  color: var(--text-light);
  align-self: center;
}

.lote-mode-option {
  margin-top: 4px;
}

.checkbox-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  color: #475569;
  cursor: pointer;
}

.modal-lote-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 10px;
  border-top: 1px solid #f1f5f9;
}

.btn-confirm-import {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

/* ====================================================
   ESTILOS DE BACKUP & SEGURANÇA DE DADOS
   ==================================================== */
.backup-glow {
  background: #ede9fe;
  color: #7c3aed;
}

.backup-section-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.backup-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  background: #f8fafc;
  padding: 18px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.backup-stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 4px;
}

.backup-stat-item .stat-num {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--primary);
  line-height: 1.2;
}

.backup-stat-item .stat-desc {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.backup-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.backup-action-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  gap: 16px;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.backup-action-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.action-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-card-header h4 {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
}

.action-card-sub {
  font-size: 0.78rem;
  color: var(--text-muted);
}

.icon-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 10px;
  flex-shrink: 0;
}

.circle-export {
  background: #eef2ff;
  color: var(--primary);
}

.circle-restore {
  background: #fef3c7;
  color: #d97706;
}

.action-card-desc {
  font-size: 0.88rem;
  color: #475569;
  line-height: 1.5;
  margin: 0;
  flex-grow: 1;
}

.btn-backup-action {
  width: 100%;
  justify-content: center;
  padding: 12px 18px;
  font-size: 0.92rem;
  font-weight: 600;
  border-radius: 8px;
}
</style>
