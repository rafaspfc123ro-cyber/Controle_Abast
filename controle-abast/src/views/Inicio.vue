<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Home,
  FlaskConical, 
  Trash2, 
  Activity, 
  ArrowUpRight, 
  PlusCircle, 
  Calendar, 
  ArrowRight,
  IdCard,
  Tag,
  DollarSign,
  Clock,
  LayoutDashboard, 
  X,
  Save,
  CheckCircle2,
  Building2,
  Scale,
  Lock,
  AlertCircle
} from 'lucide-vue-next'
import { useRegistrosStore } from '../stores/registros'
import BrandLogo from '../components/BrandLogo.vue'

const router = useRouter()
const store = useRegistrosStore()

// Obter a data de hoje no formato DD/MM/YYYY
const obterDataHojeFormatada = () => {
  const d = new Date()
  const dia = String(d.getDate()).padStart(2, '0')
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const ano = d.getFullYear()
  return `${dia}/${mes}/${ano}`
}

// Obter a data de hoje no formato YYYY-MM-DD para os inputs de data
const obterDataHojeIso = () => {
  const d = new Date()
  const ano = d.getFullYear()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

const dataHoje = obterDataHojeFormatada()

// Estado do Painel Embutido na Tela Inicial ('abastecimento' | 'residuo' | null)
const painelAberto = ref(null)
const sucessoAbastecimento = ref(false)
const sucessoResiduo = ref(false)

const togglePainel = (tipo) => {
  if (painelAberto.value === tipo) {
    painelAberto.value = null
  } else {
    painelAberto.value = tipo
    sucessoAbastecimento.value = false
    sucessoResiduo.value = false
  }
}

const fecharPainel = () => {
  painelAberto.value = null
  sucessoAbastecimento.value = false
  sucessoResiduo.value = false
}

// Fechar modal flutuante com tecla Esc e travar scroll do fundo enquanto modal estiver aberto
const handleKeyDown = (e) => {
  if (e.key === 'Escape') {
    if (modalCrachaAberto.value) {
      fecharModalCracha()
    } else if (painelAberto.value) {
      fecharPainel()
    }
  }
}

watch(painelAberto, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  document.body.style.overflow = ''
})

// Helper para verificar se o campo tem valor preenchido (para aplicar cor de preenchido)
const isCampoPreenchido = (valor) => {
  if (valor === null || valor === undefined) return false
  if (typeof valor === 'string') return valor.trim().length > 0
  return String(valor).length > 0
}

// Abrir lista suspensa do datalist no clique do usuário
const abrirLista = (e) => {
  try {
    e?.target?.showPicker?.()
  } catch {}
}

// ----------------------------------------------------
// Modal de Confirmação do Crachá do Operador (Solicitado ao clicar em Salvar)
// ----------------------------------------------------
const modalCrachaAberto = ref(false)
const crachaTemp = ref('')
const erroCracha = ref('')
const operacaoPendente = ref(null) // 'abastecimento' | 'residuo'
const inputCrachaRef = ref(null)

const fecharModalCracha = () => {
  modalCrachaAberto.value = false
  crachaTemp.value = ''
  erroCracha.value = ''
}

const solicitarCrachaAbastecimento = () => {
  if (
    !formAbast.value.data || 
    !formAbast.value.marca || 
    !formAbast.value.celula || 
    !formAbast.value.produto || 
    !formAbast.value.quantidade
  ) {
    return
  }
  operacaoPendente.value = 'abastecimento'
  crachaTemp.value = ''
  erroCracha.value = ''
  modalCrachaAberto.value = true
  nextTick(() => {
    inputCrachaRef.value?.focus()
  })
}

const solicitarCrachaResiduo = () => {
  if (
    !formResiduo.value.data || 
    !formResiduo.value.marca || 
    !formResiduo.value.celula || 
    !formResiduo.value.produto || 
    !formResiduo.value.quantidade
  ) {
    return
  }
  operacaoPendente.value = 'residuo'
  crachaTemp.value = ''
  erroCracha.value = ''
  modalCrachaAberto.value = true
  nextTick(() => {
    inputCrachaRef.value?.focus()
  })
}

const confirmarCrachaESalvar = () => {
  const crachaLimpo = (crachaTemp.value || '').trim()
  if (!crachaLimpo) {
    erroCracha.value = 'Por favor, digite ou aproxime o crachá do operador para salvar.'
    nextTick(() => inputCrachaRef.value?.focus())
    return
  }

  if (operacaoPendente.value === 'abastecimento') {
    const [ano, mes, dia] = formAbast.value.data.split('-')
    const dataFormatada = `${dia}/${mes}/${ano}`
    const horaAtual = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    const qtdNum = Number(formAbast.value.quantidade)

    store.adicionarRegistro({
      tipo: 'Abastecimento',
      dataHora: `${dataFormatada} ${horaAtual}`,
      cracha: crachaLimpo,
      marca: formAbast.value.marca,
      celula: formAbast.value.celula.trim().toUpperCase(),
      produto: formAbast.value.produto.trim(),
      qtd: qtdNum,
      valorUnitario: valorUnitarioAbast.value,
      valorTotal: custoTotalAbastCalculado.value,
      nome: `Crachá ${crachaLimpo}`
    })

    sucessoAbastecimento.value = true

    // Ao salvar: limpa Produto Químico e Quantidade Abastecida, preservando Data, Marca e Célula
    const marcaAtual = formAbast.value.marca
    const celulaAtual = formAbast.value.celula
    formAbast.value = {
      data: formAbast.value.data || obterDataHojeIso(),
      cracha: '',
      marca: marcaAtual,
      celula: celulaAtual,
      produto: '',
      quantidade: ''
    }

    setTimeout(() => {
      sucessoAbastecimento.value = false
    }, 4000)
  } else if (operacaoPendente.value === 'residuo') {
    const [ano, mes, dia] = formResiduo.value.data.split('-')
    const dataFormatada = `${dia}/${mes}/${ano}`
    const horaAtual = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    const qtdNum = Number(formResiduo.value.quantidade)

    store.adicionarRegistro({
      tipo: 'Resíduo',
      dataHora: `${dataFormatada} ${horaAtual}`,
      cracha: crachaLimpo,
      marca: formResiduo.value.marca,
      celula: formResiduo.value.celula.trim().toUpperCase(),
      produto: formResiduo.value.produto.trim(),
      qtd: qtdNum,
      valorUnitario: valorUnitarioResiduo.value,
      valorTotal: custoTotalResiduoCalculado.value,
      nome: `Crachá ${crachaLimpo}`
    })

    sucessoResiduo.value = true

    // Ao salvar: limpa Produto Químico e Quantidade, preservando Data, Marca e Célula
    const marcaAtual = formResiduo.value.marca
    const celulaAtual = formResiduo.value.celula
    formResiduo.value = {
      data: formResiduo.value.data || obterDataHojeIso(),
      cracha: '',
      marca: marcaAtual,
      celula: celulaAtual,
      produto: '',
      quantidade: ''
    }

    setTimeout(() => {
      sucessoResiduo.value = false
    }, 4000)
  }

  fecharModalCracha()
}

// ----------------------------------------------------
// Form Abastecimento
// ----------------------------------------------------
// Ao iniciar: apenas o campo de data vem preenchido; demais campos vazios
const formAbast = ref({
  data: obterDataHojeIso(),
  cracha: '',
  marca: '',
  celula: '',
  produto: '',
  quantidade: ''
})

const produtoAbastSelecionado = computed(() => {
  if (!formAbast.value.produto) return null
  return store.produtos.find(p => p.nome.toLowerCase() === formAbast.value.produto.toLowerCase()) || null
})

const valorUnitarioAbast = computed(() => {
  return produtoAbastSelecionado.value ? Number(produtoAbastSelecionado.value.valor) : 0
})

const custoTotalAbastCalculado = computed(() => {
  const qtd = Number(formAbast.value.quantidade || 0)
  return qtd * valorUnitarioAbast.value
})

// ----------------------------------------------------
// Form Resíduos
// ----------------------------------------------------
// Ao iniciar: apenas o campo de data vem preenchido; demais campos vazios
const formResiduo = ref({
  data: obterDataHojeIso(),
  cracha: '',
  marca: '',
  celula: '',
  produto: '',
  quantidade: ''
})

const produtoResiduoSelecionado = computed(() => {
  if (!formResiduo.value.produto) return null
  return store.produtos.find(p => p.nome.toLowerCase() === formResiduo.value.produto.toLowerCase()) || null
})

const valorUnitarioResiduo = computed(() => {
  return produtoResiduoSelecionado.value ? Number(produtoResiduoSelecionado.value.valor) : 0
})

const custoTotalResiduoCalculado = computed(() => {
  const qtd = Number(formResiduo.value.quantidade || 0)
  return qtd * valorUnitarioResiduo.value
})

// ----------------------------------------------------
// Métricas do Dia
// ----------------------------------------------------
// Registros estritamente DO DIA ATUAL
const registrosDoDia = computed(() => {
  return store.registros.filter(r => r.dataHora && r.dataHora.startsWith(dataHoje))
})

const totalAbastecidoHoje = computed(() => {
  return registrosDoDia.value
    .filter(r => r.tipo === 'Abastecimento')
    .reduce((acc, curr) => acc + Number(curr.qtd || 0), 0)
})

const totalResiduosHoje = computed(() => {
  return registrosDoDia.value
    .filter(r => r.tipo === 'Resíduo')
    .reduce((acc, curr) => acc + Number(curr.qtd || 0), 0)
})

const custosTotaisHoje = computed(() => {
  return registrosDoDia.value.reduce((acc, curr) => acc + Number(curr.valorTotal || 0), 0)
})

const totalOperacoesHoje = computed(() => registrosDoDia.value.length)

// Abastecimento por marca apenas no dia atual
const totaisPorMarcaHoje = computed(() => {
  const mapa = {}
  store.marcas.forEach(m => {
    mapa[m] = 0
  })
  registrosDoDia.value
    .filter(r => r.tipo === 'Abastecimento')
    .forEach(r => {
      const m = (r.marca || '').toUpperCase()
      if (mapa[m] !== undefined) {
        mapa[m] += Number(r.qtd || 0)
      } else {
        mapa[m] = Number(r.qtd || 0)
      }
    })
  return mapa
})

const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0)
}

const removerRegistroInicio = (id) => {
  const item = store.registros.find(r => r.id === id)
  const itemDesc = item 
    ? `${item.tipo}: ${item.produto} • ${Number(item.qtd).toLocaleString('pt-BR')} Kg/L (${item.marca || item.celula})` 
    : `Lançamento #${id}`

  store.abrirConfirmacaoExclusao({
    titulo: 'Excluir Movimentação de Hoje',
    descricao: 'Tem certeza que deseja excluir esta movimentação? Os totais do dia e relatórios serão recalculados automaticamente.',
    itemNome: itemDesc,
    onConfirm: () => {
      store.removerRegistro(id)
      return {
        titulo: 'Lançamento Removido!',
        msg: 'A movimentação foi excluída com sucesso e o painel de hoje foi atualizado.'
      }
    }
  })
}
</script>

<template>
  <div class="inicio-page">
    <!-- Header -->
    <div class="page-header header-with-actions">
      <div>
        <div class="header-badge-row">
          <div class="header-badge">
            <Home :size="15" />
            <span>Setor Químico • Calçados</span>
          </div>
          <div class="today-indicator">
            <Clock :size="14" />
            <span>Hoje: <strong>{{ dataHoje }}</strong></span>
          </div>
        </div>
        <h1 class="page-title">Painel</h1>
        <p class="page-subtitle">Acompanhamento diário em tempo real das movimentações químicas do dia {{ dataHoje }}</p>
      </div>

      <!-- Botões de Ação na Tela Inicial -->
      <div class="header-actions">
        <button 
          type="button"
          @click="togglePainel('abastecimento')" 
          class="btn-panel-trigger btn-trigger-abast"
          :class="{ 'btn-panel-active': painelAberto === 'abastecimento' }"
        >
          <PlusCircle :size="15" :stroke-width="2.2" class="trigger-icon" />
          <span>Novo Abastecimento</span>
          <span v-if="painelAberto === 'abastecimento'" class="trigger-status-badge">
            <span class="badge-dot"></span>
            Aberto
          </span>
        </button>

        <button 
          type="button"
          @click="togglePainel('residuo')" 
          class="btn-panel-trigger btn-trigger-residuo"
          :class="{ 'btn-panel-active': painelAberto === 'residuo' }"
        >
          <Trash2 :size="15" :stroke-width="2.2" class="trigger-icon" />
          <span>Resíduos</span>
          <span v-if="painelAberto === 'residuo'" class="trigger-status-badge">
            <span class="badge-dot"></span>
            Aberto
          </span>
        </button>
      </div>
    </div>

    <!-- MODAL FLUTUANTE NA TELA INICIAL (NÃO EMPURRA OS ELEMENTOS DE TRÁS) -->
    <Teleport to="body">
      <Transition name="floating-modal-anim">
        <div 
          v-if="painelAberto" 
          class="floating-modal-backdrop" 
          @click.self="fecharPainel"
          aria-modal="true" 
          role="dialog"
        >
          <div 
            class="floating-modal-card" 
            :class="painelAberto === 'abastecimento' ? 'modal-theme-abast' : 'modal-theme-residuo'"
          >
          <!-- Barra Superior do Painel -->
          <div class="panel-header-bar">
            <div class="panel-title-side">
              <div class="panel-icon-circle" :class="painelAberto === 'abastecimento' ? 'icon-circle-abast' : 'icon-circle-residuo'">
                <FlaskConical v-if="painelAberto === 'abastecimento'" :size="20" />
                <Trash2 v-else :size="20" />
              </div>
              <div>
                <div class="panel-pill-badge" :class="painelAberto === 'abastecimento' ? 'pill-abast' : 'pill-residuo'">
                  {{ painelAberto === 'abastecimento' ? 'Setor Químico • Abastecimento' : 'Gestão Ambiental • Resíduos' }}
                </div>
                <h2 class="panel-headline">
                  {{ painelAberto === 'abastecimento' ? 'Painel de Novo Abastecimento' : 'Painel de Destinação de Resíduos' }}
                </h2>
                <p class="panel-desc">
                  {{ painelAberto === 'abastecimento' 
                    ? 'Lançamento rápido de insumos químicos para células de produção de calçados' 
                    : 'Registro imediato de descarte, destinação e reciclagem de resíduos químicos' }}
                </p>
              </div>
            </div>

            <!-- Controles do Painel: Alternador e Botão Fechar -->
            <div class="panel-actions-side">
              <div class="panel-switch-group">
                <button 
                  type="button"
                  @click="painelAberto = 'abastecimento'" 
                  class="switch-btn"
                  :class="{ active: painelAberto === 'abastecimento' }"
                >
                  <FlaskConical :size="15" />
                  <span>Abastecimento</span>
                </button>
                <button 
                  type="button"
                  @click="painelAberto = 'residuo'" 
                  class="switch-btn"
                  :class="{ active: painelAberto === 'residuo' }"
                >
                  <Trash2 :size="15" />
                  <span>Resíduos</span>
                </button>
              </div>

              <button type="button" @click="fecharPainel" class="btn-close-panel" title="Fechar painel">
                <X :size="18" />
                <span>Fechar</span>
              </button>
            </div>
          </div>

          <!-- Mensagem de Sucesso Abastecimento -->
          <div v-if="sucessoAbastecimento && painelAberto === 'abastecimento'" class="alert-success panel-alert">
            <CheckCircle2 :size="20" />
            <div>
              <strong>Abastecimento lançado com sucesso!</strong>
              <span> O registro foi salvo e os totais de hoje foram recalculados em tempo real.</span>
            </div>
          </div>

          <!-- Mensagem de Sucesso Resíduo -->
          <div v-if="sucessoResiduo && painelAberto === 'residuo'" class="alert-success panel-alert">
            <CheckCircle2 :size="20" />
            <div>
              <strong>Resíduo químico registrado com sucesso!</strong>
              <span> O registro foi salvo e já consta no histórico ambiental de hoje.</span>
            </div>
          </div>

          <!-- Formulário: NOVO ABASTECIMENTO -->
          <div v-if="painelAberto === 'abastecimento'" class="panel-form-content">
            <!-- Caixinha de Custo Total Calculado -->
            <div v-if="produtoAbastSelecionado" class="panel-cost-wrapper">
              <div class="panel-cost-box">
                <div class="mini-box-header">
                  <div class="mini-box-icon">
                    <DollarSign :size="15" />
                  </div>
                  <span class="mini-box-title">Custo Total Estimado</span>
                </div>
                <div class="mini-box-value">
                  {{ formatarMoeda(custoTotalAbastCalculado) }}
                </div>
                <div class="mini-box-footer">
                  <span class="mini-box-calc">
                    {{ formAbast.quantidade || '0' }} Kg/L × {{ formatarMoeda(valorUnitarioAbast) }}
                  </span>
                  <span class="mini-box-sep">•</span>
                  <span class="mini-box-unit">
                    Unitário: <strong>{{ formatarMoeda(valorUnitarioAbast) }}</strong>
                  </span>
                </div>
              </div>
            </div>

            <form @submit.prevent="solicitarCrachaAbastecimento" class="modern-form">
              <!-- Linha 1: Data e Crachá -->
              <div class="form-grid">
                <div class="input-group">
                  <label><Calendar :size="15" /> Data do Abastecimento</label>
                  <input
                    type="date"
                    v-model="formAbast.data"
                    :class="['modern-input', { 'input-filled': isCampoPreenchido(formAbast.data) }]"
                    required
                  />
                </div>

                <div class="input-group">
                  <label><IdCard :size="15" /> Crachá do Operador</label>
                  <div class="cracha-lock-badge">
                    <Lock :size="14" />
                    <span>Solicitado ao clicar em Salvar</span>
                  </div>
                </div>
              </div>

              <!-- Linha 2: Marca e Célula -->
              <div class="form-grid">
                <div class="input-group">
                  <label><Tag :size="15" /> Marca</label>
                  <input
                    type="text"
                    list="lista-marcas-inicio-abast"
                    v-model="formAbast.marca"
                    :class="['modern-input', { 'input-filled': isCampoPreenchido(formAbast.marca) }]"
                    placeholder="Selecione ou digite a marca..."
                    @click="abrirLista($event)"
                    required
                  />
                  <datalist id="lista-marcas-inicio-abast">
                    <option v-for="m in store.marcas" :key="m" :value="m">{{ m }}</option>
                  </datalist>
                </div>

                <div class="input-group">
                  <label><Building2 :size="15" /> Célula de Produção</label>
                  <input
                    type="text"
                    list="lista-celulas-inicio-abast"
                    v-model="formAbast.celula"
                    :class="['modern-input', { 'input-filled': isCampoPreenchido(formAbast.celula) }]"
                    placeholder="Selecione ou digite a célula..."
                    @click="abrirLista($event)"
                    required
                  />
                  <datalist id="lista-celulas-inicio-abast">
                    <option v-for="c in store.celulas" :key="c" :value="c">{{ c }}</option>
                  </datalist>
                </div>
              </div>

              <!-- Linha 3: Produto e Quantidade -->
              <div class="form-grid">
                <div class="input-group">
                  <label><FlaskConical :size="15" /> Produto Químico</label>
                  <input
                    type="text"
                    list="lista-produtos-inicio-abast"
                    v-model="formAbast.produto"
                    :class="['modern-input', { 'input-filled': isCampoPreenchido(formAbast.produto) }]"
                    placeholder="Selecione ou digite o produto químico..."
                    @click="abrirLista($event)"
                    required
                  />
                  <datalist id="lista-produtos-inicio-abast">
                    <option v-for="p in store.produtos" :key="p.id" :value="p.nome">{{ p.nome }}</option>
                  </datalist>
                </div>

                <div class="input-group">
                  <label><Scale :size="15" /> Quantidade Abastecida</label>
                  <div class="input-with-suffix">
                    <input
                      type="number"
                      v-model="formAbast.quantidade"
                      :class="['modern-input', { 'input-filled': isCampoPreenchido(formAbast.quantidade) }]"
                      step="0.001"
                      placeholder="0.000"
                      min="0.001"
                      required
                    />
                    <span class="suffix" :class="{ 'suffix-filled': isCampoPreenchido(formAbast.quantidade) }">Kg / L</span>
                  </div>
                </div>
              </div>

              <!-- Rodapé de Ações do Abastecimento -->
              <div class="panel-form-footer">
                <button type="button" @click="fecharPainel" class="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" class="btn-primary">
                  <Save :size="18" /> Salvar Abastecimento
                </button>
              </div>
            </form>
          </div>

          <!-- Formulário: DESTINAÇÃO DE RESÍDUOS -->
          <div v-if="painelAberto === 'residuo'" class="panel-form-content">
            <!-- Caixinha de Custo Total Estimado de Resíduo -->
            <div v-if="produtoResiduoSelecionado" class="panel-cost-wrapper">
              <div class="panel-cost-box panel-cost-box-amber">
                <div class="mini-box-header">
                  <div class="mini-box-icon mini-box-icon-amber">
                    <DollarSign :size="15" />
                  </div>
                  <span class="mini-box-title mini-box-title-amber">Custo Estimado do Resíduo</span>
                </div>
                <div class="mini-box-value mini-box-value-amber">
                  {{ formatarMoeda(custoTotalResiduoCalculado) }}
                </div>
                <div class="mini-box-footer">
                  <span class="mini-box-calc">
                    {{ formResiduo.quantidade || '0' }} Kg/L × {{ formatarMoeda(valorUnitarioResiduo) }}
                  </span>
                  <span class="mini-box-sep">•</span>
                  <span class="mini-box-unit">
                    Unitário: <strong>{{ formatarMoeda(valorUnitarioResiduo) }}</strong>
                  </span>
                </div>
              </div>
            </div>

            <form @submit.prevent="solicitarCrachaResiduo" class="modern-form">
              <!-- Linha 1: Data e Crachá -->
              <div class="form-grid">
                <div class="input-group">
                  <label><Calendar :size="15" /> Data do Resíduo</label>
                  <input
                    type="date"
                    v-model="formResiduo.data"
                    :class="['modern-input', { 'input-filled': isCampoPreenchido(formResiduo.data) }]"
                    required
                  />
                </div>

                <div class="input-group">
                  <label><IdCard :size="15" /> Crachá</label>
                  <div class="cracha-lock-badge cracha-lock-amber">
                    <Lock :size="14" />
                    <span>Solicitado ao clicar em Salvar</span>
                  </div>
                </div>
              </div>

              <!-- Linha 2: Marca e Célula -->
              <div class="form-grid">
                <div class="input-group">
                  <label><Tag :size="15" /> Marca</label>
                  <input
                    type="text"
                    list="lista-marcas-inicio-residuo"
                    v-model="formResiduo.marca"
                    :class="['modern-input', { 'input-filled': isCampoPreenchido(formResiduo.marca) }]"
                    placeholder="Selecione ou digite a marca..."
                    @click="abrirLista($event)"
                    required
                  />
                  <datalist id="lista-marcas-inicio-residuo">
                    <option v-for="m in store.marcas" :key="m" :value="m">{{ m }}</option>
                  </datalist>
                </div>

                <div class="input-group">
                  <label><Building2 :size="15" /> Célula</label>
                  <input
                    type="text"
                    list="lista-celulas-inicio-residuo"
                    v-model="formResiduo.celula"
                    :class="['modern-input', { 'input-filled': isCampoPreenchido(formResiduo.celula) }]"
                    placeholder="Selecione ou digite a célula..."
                    @click="abrirLista($event)"
                    required
                  />
                  <datalist id="lista-celulas-inicio-residuo">
                    <option v-for="c in store.celulas" :key="c" :value="c">{{ c }}</option>
                  </datalist>
                </div>
              </div>

              <!-- Linha 3: Produto e Quantidade -->
              <div class="form-grid">
                <div class="input-group">
                  <label><FlaskConical :size="15" /> Produto</label>
                  <input
                    type="text"
                    list="lista-produtos-inicio-residuo"
                    v-model="formResiduo.produto"
                    :class="['modern-input', { 'input-filled': isCampoPreenchido(formResiduo.produto) }]"
                    placeholder="Selecione ou digite o produto..."
                    @click="abrirLista($event)"
                    required
                  />
                  <datalist id="lista-produtos-inicio-residuo">
                    <option v-for="p in store.produtos" :key="p.id" :value="p.nome">{{ p.nome }}</option>
                  </datalist>
                </div>

                <div class="input-group">
                  <label><Scale :size="15" /> Quantidade</label>
                  <div class="input-with-suffix">
                    <input
                      type="number"
                      v-model="formResiduo.quantidade"
                      :class="['modern-input', { 'input-filled': isCampoPreenchido(formResiduo.quantidade) }]"
                      step="0.001"
                      placeholder="0.000"
                      min="0.001"
                      required
                    />
                    <span class="suffix" :class="{ 'suffix-filled': isCampoPreenchido(formResiduo.quantidade) }">Kg / L</span>
                  </div>
                </div>
              </div>

              <!-- Rodapé de Ações de Resíduo -->
              <div class="panel-form-footer">
                <button type="button" @click="fecharPainel" class="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" class="btn-primary btn-amber">
                  <Save :size="18" /> Salvar Resíduo
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      </Transition>
    </Teleport>

    <!-- Modal Flutuante de Confirmação do Crachá do Operador (Solicitado ao Salvar) -->
    <Teleport to="body">
      <Transition name="fade">
        <div 
          v-if="modalCrachaAberto" 
          class="floating-modal-backdrop cracha-modal-backdrop"
          @click.self="fecharModalCracha"
          aria-modal="true"
          role="dialog"
        >
          <div class="cracha-modal-card">
            <div class="cracha-modal-header">
              <div class="cracha-modal-icon" :class="operacaoPendente === 'abastecimento' ? 'icon-circle-abast' : 'icon-circle-residuo'">
                <IdCard :size="24" />
              </div>
              <div class="cracha-modal-titles">
                <h3>Identificação do Operador</h3>
                <p>Aproxime ou digite o crachá para confirmar e salvar o {{ operacaoPendente === 'abastecimento' ? 'abastecimento' : 'resíduo' }}</p>
              </div>
              <button type="button" @click="fecharModalCracha" class="btn-close-modal" title="Cancelar">
                <X :size="20" />
              </button>
            </div>

            <!-- Resumo da Operação -->
            <div class="cracha-resumo-box" :class="operacaoPendente === 'abastecimento' ? 'resumo-abast' : 'resumo-residuo'">
              <div class="resumo-linha">
                <span class="resumo-label">Operação:</span>
                <span class="resumo-val font-bold">
                  {{ operacaoPendente === 'abastecimento' ? 'Abastecimento Químico' : 'Destinação de Resíduo' }}
                </span>
              </div>
              <div class="resumo-linha">
                <span class="resumo-label">Produto:</span>
                <span class="resumo-val font-bold">
                  {{ operacaoPendente === 'abastecimento' ? formAbast.produto : formResiduo.produto }}
                </span>
              </div>
              <div class="resumo-linha">
                <span class="resumo-label">Quantidade:</span>
                <span class="resumo-val font-bold text-primary">
                  {{ operacaoPendente === 'abastecimento' ? formAbast.quantidade : formResiduo.quantidade }} Kg / L
                </span>
              </div>
              <div class="resumo-linha">
                <span class="resumo-label">Célula / Marca:</span>
                <span class="resumo-val text-muted">
                  {{ operacaoPendente === 'abastecimento' ? formAbast.celula : formResiduo.celula }} • 
                  {{ operacaoPendente === 'abastecimento' ? formAbast.marca : formResiduo.marca }}
                </span>
              </div>
            </div>

            <!-- Formulário de Leitura / Digitação do Crachá -->
            <form @submit.prevent="confirmarCrachaESalvar" class="cracha-form">
              <div class="input-group">
                <label class="label-cracha"><IdCard :size="16" /> Crachá do Operador *</label>
                <input
                  ref="inputCrachaRef"
                  type="text"
                  v-model="crachaTemp"
                  class="modern-input input-cracha-destaque"
                  :class="{ 'input-filled': isCampoPreenchido(crachaTemp) }"
                  placeholder="Digite ou aproxime o crachá..."
                  required
                  autofocus
                />
                <span class="field-hint-cracha">Pressione <strong>Enter</strong> ou clique em Confirmar para salvar</span>
              </div>

              <div v-if="erroCracha" class="alert-danger alert-cracha">
                <AlertCircle :size="16" />
                <span>{{ erroCracha }}</span>
              </div>

              <div class="cracha-modal-actions">
                <button type="button" @click="fecharModalCracha" class="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" class="btn-primary" :class="{ 'btn-amber': operacaoPendente === 'residuo' }">
                  <CheckCircle2 :size="18" /> Confirmar e Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Cards de Métricas DO DIA -->
    <div class="stats-grid">
      <!-- Total Abastecido Hoje -->
      <div class="modern-card stat-card card-indigo">
        <div class="stat-top">
          <div class="stat-icon-wrapper indigo-glow">
            <FlaskConical :size="22" />
          </div>
          <span class="stat-trend trend-positive">
            <ArrowUpRight :size="14" /> Hoje
          </span>
        </div>
        <div class="stat-body">
          <span class="stat-label">Total Abastecido do Dia</span>
          <div class="stat-value">
            {{ totalAbastecidoHoje.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 3 }) }}
            <span class="stat-unit">Kg / L</span>
          </div>
        </div>
      </div>

      <!-- Resíduos Destinados Hoje -->
      <div class="modern-card stat-card card-amber">
        <div class="stat-top">
          <div class="stat-icon-wrapper amber-glow">
            <Trash2 :size="22" />
          </div>
          <span class="stat-trend trend-amber">
            Hoje
          </span>
        </div>
        <div class="stat-body">
          <span class="stat-label">Resíduos Destinados Hoje</span>
          <div class="stat-value">
            {{ totalResiduosHoje.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) }}
            <span class="stat-unit">Kg</span>
          </div>
        </div>
      </div>

      <!-- Custo Total do Dia -->
      <div class="modern-card stat-card card-emerald">
        <div class="stat-top">
          <div class="stat-icon-wrapper emerald-glow">
            <DollarSign :size="22" />
          </div>
          <span class="stat-trend trend-emerald">
            Custo do Dia
          </span>
        </div>
        <div class="stat-body">
          <span class="stat-label">Custo Total de Insumos Hoje</span>
          <div class="stat-value">
            {{ formatarMoeda(custosTotaisHoje) }}
          </div>
        </div>
      </div>

      <!-- Lançamentos Realizados Hoje -->
      <div class="modern-card stat-card card-violet">
        <div class="stat-top">
          <div class="stat-icon-wrapper violet-glow">
            <Activity :size="22" />
          </div>
          <span class="stat-trend trend-violet">
            {{ dataHoje }}
          </span>
        </div>
        <div class="stat-body">
          <span class="stat-label">Lançamentos do Dia</span>
          <div class="stat-value">
            {{ totalOperacoesHoje }}
            <span class="stat-unit">reg.</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Abastecimento por Marca DO DIA -->
    <div class="brands-section">
      <div class="section-title-wrap mb-3">
        <h3>Consumo Químico por Marca (Hoje)</h3>
        <span class="section-subtitle">Distribuição do volume abastecido nas linhas no dia de hoje ({{ dataHoje }})</span>
      </div>

      <div v-if="store.marcas && store.marcas.length > 0" class="brands-grid">
        <div 
          v-for="m in store.marcas" 
          :key="m" 
          class="modern-card brand-stat-card"
          :class="`brand-card-${m.toLowerCase()}`"
        >
          <div class="brand-stat-header">
            <span class="brand-pill-name">{{ m }}</span>
            <div class="brand-corner-logo" :title="`Logo ${m}`">
              <BrandLogo :marca="m" />
            </div>
          </div>
          <div class="brand-stat-val">
            {{ (totaisPorMarcaHoje[m] || 0).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 3 }) }}
            <span class="brand-stat-unit">Kg/L</span>
          </div>
          <span class="brand-stat-footer">Consumido hoje</span>
        </div>
      </div>
      <div v-else class="brands-empty-alert">
        <span>Nenhuma marca cadastrada. Acesse <strong>Cadastros</strong> para adicionar marcas.</span>
      </div>
    </div>

    <!-- Tabela de Movimentações DO DIA -->
    <div class="dashboard-section">
      <div class="section-header">
        <div class="section-title-wrap">
          <h2>Movimentações de Hoje ({{ dataHoje }})</h2>
          <span class="section-subtitle">Exibindo exclusivamente as operações registradas nesta data</span>
        </div>
        <button @click="router.push('/registros')" class="btn-text-link">
          Ver histórico geral completo <ArrowRight :size="16" />
        </button>
      </div>

      <div class="modern-card table-card">
        <div v-if="registrosDoDia.length === 0" class="empty-state">
          <Calendar :size="36" class="empty-icon" />
          <h3>Nenhuma movimentação registrada hoje</h3>
          <p>Ainda não há lançamentos de abastecimento ou resíduo para a data de hoje ({{ dataHoje }}).</p>
          <button @click="togglePainel('abastecimento')" class="btn-primary mt-3">
            <PlusCircle :size="16" /> Fazer Primeiro Lançamento do Dia
          </button>
        </div>

        <table v-else class="modern-table">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Horário</th>
              <th>Marca</th>
              <th>Célula</th>
              <th>Produto Químico</th>
              <th>Crachá</th>
              <th class="text-right">Quantidade</th>
              <th class="text-right">Valor Estimado</th>
              <th class="text-center" style="width: 60px;">Ação</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in registrosDoDia" :key="item.id">
              <td>
                <span :class="['badge', item.tipo === 'Abastecimento' ? 'badge-abastecimento' : 'badge-residuo']">
                  {{ item.tipo }}
                </span>
              </td>
              <td class="cell-date">
                <Clock :size="14" />
                {{ item.dataHora.split(' ')[1] || item.dataHora }}
              </td>
              <td>
                <span 
                  v-if="item.marca" 
                  class="badge-marca"
                  :class="`marca-${item.marca.toLowerCase()}`"
                >
                  {{ item.marca }}
                </span>
                <span v-else class="text-muted">—</span>
              </td>
              <td class="font-medium">{{ item.celula }}</td>
              <td>{{ item.produto }}</td>
              <td>
                <span class="cracha-tag">
                  <IdCard :size="13" />
                  {{ item.cracha || item.nome || '—' }}
                </span>
              </td>
              <td class="text-right font-semibold">
                {{ Number(item.qtd).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 3 }) }}
                <span class="unit-label">Kg/L</span>
              </td>
              <td class="text-right font-bold" :class="item.valorTotal > 0 ? 'text-primary' : 'text-muted'">
                {{ item.valorTotal > 0 ? formatarMoeda(item.valorTotal) : '—' }}
              </td>
              <td class="text-center">
                <button 
                  type="button"
                  @click="removerRegistroInicio(item.id)" 
                  class="btn-icon-danger" 
                  title="Excluir este lançamento"
                >
                  <Trash2 :size="15" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.inicio-page {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.header-with-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.header-badge-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 8px;
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
  border: 1px solid #ddd6fe;
}

.today-indicator {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #e0f2fe;
  color: #0369a1;
  padding: 5px 12px;
  border-radius: 9999px;
  font-size: 0.78rem;
  font-weight: 600;
  border: 1px solid #bae6fd;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

/* Botões Gatilho para os Painéis */
.btn-panel-trigger {
  padding: 8.5px 16px;
  border-radius: 10px;
  font-size: 0.84rem;
  font-weight: 550;
  letter-spacing: -0.01em;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 7.5px;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  border: 1px solid rgba(255, 255, 255, 0.18);
  outline: none;
  user-select: none;
  line-height: 1.35;
}

.btn-trigger-abast {
  background: linear-gradient(180deg, #6366f1 0%, #4f46e5 100%);
  color: #ffffff;
  box-shadow: 
    inset 0 1px 0 rgba(255, 255, 255, 0.25),
    0 1px 2px rgba(15, 23, 42, 0.08),
    0 4px 12px -2px rgba(79, 70, 229, 0.25);
}

.btn-trigger-abast:hover {
  transform: translateY(-1px);
  box-shadow: 
    inset 0 1px 0 rgba(255, 255, 255, 0.35),
    0 3px 6px rgba(15, 23, 42, 0.08),
    0 8px 18px -2px rgba(79, 70, 229, 0.38);
  filter: brightness(1.03);
}

.btn-trigger-abast:active {
  transform: translateY(0px) scale(0.985);
  box-shadow: 
    inset 0 1px 2px rgba(0, 0, 0, 0.18),
    0 1px 3px rgba(79, 70, 229, 0.2);
}

.btn-trigger-residuo {
  background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%);
  color: #ffffff;
  box-shadow: 
    inset 0 1px 0 rgba(255, 255, 255, 0.28),
    0 1px 2px rgba(15, 23, 42, 0.08),
    0 4px 12px -2px rgba(217, 119, 6, 0.25);
}

.btn-trigger-residuo:hover {
  transform: translateY(-1px);
  box-shadow: 
    inset 0 1px 0 rgba(255, 255, 255, 0.38),
    0 3px 6px rgba(15, 23, 42, 0.08),
    0 8px 18px -2px rgba(217, 119, 6, 0.38);
  filter: brightness(1.03);
}

.btn-trigger-residuo:active {
  transform: translateY(0px) scale(0.985);
  box-shadow: 
    inset 0 1px 2px rgba(0, 0, 0, 0.18),
    0 1px 3px rgba(217, 119, 6, 0.2);
}

.btn-trigger-abast.btn-panel-active {
  box-shadow: 
    inset 0 1px 0 rgba(255, 255, 255, 0.25),
    0 0 0 2px var(--bg-color),
    0 0 0 4px #4f46e5,
    0 6px 16px rgba(79, 70, 229, 0.35) !important;
  transform: translateY(-1px);
}

.btn-trigger-residuo.btn-panel-active {
  box-shadow: 
    inset 0 1px 0 rgba(255, 255, 255, 0.25),
    0 0 0 2px var(--bg-color),
    0 0 0 4px #d97706,
    0 6px 16px rgba(217, 119, 6, 0.35) !important;
  transform: translateY(-1px);
}

.trigger-icon {
  flex-shrink: 0;
  opacity: 0.95;
}

.trigger-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4.5px;
  font-size: 0.65rem;
  font-weight: 600;
  padding: 1.5px 7px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.22);
  border: 1px solid rgba(255, 255, 255, 0.32);
  backdrop-filter: blur(4px);
  text-transform: uppercase;
  letter-spacing: 0.03em;
  line-height: 1.2;
  margin-left: 2px;
}

.badge-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 0 6px rgba(255, 255, 255, 0.9);
  animation: pulse-badge-dot 1.8s infinite ease-in-out;
}

@keyframes pulse-badge-dot {
  0%, 100% {
    opacity: 0.7;
    transform: scale(0.9);
  }
  50% {
    opacity: 1;
    transform: scale(1.15);
  }
}

/* ====================================================
   ESTRUTURA DO MODAL FLUTUANTE NA TELA INICIAL
   (NÃO EMPURRA OS ELEMENTOS DE TRÁS)
   ==================================================== */
.floating-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: rgba(15, 23, 42, 0.58);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  overflow-y: auto;
}

.floating-modal-card {
  width: 100%;
  max-width: 880px;
  max-height: calc(100vh - 48px);
  overflow-y: auto;
  background: #ffffff;
  border-radius: var(--radius-xl);
  padding: 28px 32px;
  box-shadow: 0 25px 60px -12px rgba(15, 23, 42, 0.4), 0 0 0 1px rgba(15, 23, 42, 0.08);
  border-left: 6px solid var(--primary);
  position: relative;
  margin: auto;
}

.modal-theme-abast {
  border-left-color: #4f46e5;
}

.modal-theme-residuo {
  border-left-color: #d97706;
}

.floating-modal-card::-webkit-scrollbar {
  width: 6px;
}

.floating-modal-card::-webkit-scrollbar-track {
  background: transparent;
}

.floating-modal-card::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 9999px;
}

.panel-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  flex-wrap: wrap;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 22px;
}

.panel-title-side {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.panel-icon-circle {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-circle-abast {
  background: #eef2ff;
  color: #4f46e5;
}

.icon-circle-residuo {
  background: #fef3c7;
  color: #d97706;
}

.panel-pill-badge {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 3px 10px;
  border-radius: 9999px;
  margin-bottom: 5px;
}

.pill-abast {
  background: #ede9fe;
  color: #6d28d9;
}

.pill-residuo {
  background: #fef3c7;
  color: #b45309;
}

.panel-headline {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--text-main);
  letter-spacing: -0.4px;
}

.panel-desc {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-top: 3px;
}

.panel-actions-side {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.panel-switch-group {
  display: inline-flex;
  background: #f1f5f9;
  padding: 4px;
  border-radius: var(--radius-md);
  gap: 4px;
}

.switch-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: var(--radius-sm);
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.switch-btn.active {
  background: #ffffff;
  color: var(--text-main);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.btn-close-panel {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: #f8fafc;
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-close-panel:hover {
  background: #fee2e2;
  color: #dc2626;
  border-color: #fca5a5;
}

.panel-alert {
  margin-bottom: 22px;
}

.panel-cost-wrapper {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 20px;
}

.panel-cost-box {
  width: fit-content;
  min-width: 250px;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-left: 4px solid var(--primary);
  border-radius: var(--radius-md);
  padding: 10px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.panel-cost-box-amber {
  background: #fffbeb;
  border-color: #fde68a;
  border-left: 4px solid #d97706;
}

.mini-box-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mini-box-icon {
  width: 22px;
  height: 22px;
  border-radius: 4px;
  background: var(--primary-light);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.mini-box-icon-amber {
  background: #fef3c7;
  color: #d97706;
}

.mini-box-title {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.mini-box-title-amber {
  color: #92400e;
}

.mini-box-value {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--primary);
  letter-spacing: -0.4px;
  line-height: 1.2;
}

.mini-box-value-amber {
  color: #b45309;
}

.mini-box-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  color: var(--text-muted);
  border-top: 1px solid #edf2f7;
  padding-top: 5px;
  margin-top: 2px;
}

.mini-box-calc {
  color: var(--text-light);
}

.mini-box-sep {
  color: #cbd5e1;
}

.mini-box-unit strong {
  color: var(--text-main);
}

.input-with-suffix {
  position: relative;
  display: flex;
  align-items: center;
}

.input-with-suffix input {
  width: 100%;
  padding-right: 65px;
}

.input-with-suffix .suffix {
  position: absolute;
  right: 14px;
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.panel-form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 10px;
  padding-top: 18px;
  border-top: 1px solid var(--border);
}

.btn-amber {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 14px -2px rgba(217, 119, 6, 0.4);
}

.btn-amber:hover {
  box-shadow: 0 8px 20px -2px rgba(217, 119, 6, 0.5);
}

/* Transições Flutuantes do Modal (Backdrop e Card) */
.floating-modal-anim-enter-active,
.floating-modal-anim-leave-active {
  transition: opacity 0.24s ease;
}

.floating-modal-anim-enter-active .floating-modal-card,
.floating-modal-anim-leave-active .floating-modal-card {
  transition: transform 0.26s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.24s ease;
}

.floating-modal-anim-enter-from,
.floating-modal-anim-leave-to {
  opacity: 0;
}

.floating-modal-anim-enter-from .floating-modal-card,
.floating-modal-anim-leave-to .floating-modal-card {
  opacity: 0;
  transform: translateY(-24px) scale(0.96);
}

.floating-modal-anim-enter-to .floating-modal-card,
.floating-modal-anim-leave-from .floating-modal-card {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* Grid de Estatísticas Principais (Cards mais largos) */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 22px;
}

@media (max-width: 1300px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 680px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

.stat-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 22px;
  padding: 24px 28px;
  min-height: 165px;
  border-radius: var(--radius-lg);
  position: relative;
  overflow: hidden;
}

.stat-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.indigo-glow {
  background: #eef2ff;
  color: #4f46e5;
}

.amber-glow {
  background: #fef3c7;
  color: #d97706;
}

.emerald-glow {
  background: #ecfdf5;
  color: #059669;
}

.violet-glow {
  background: #f3e8ff;
  color: #7c3aed;
}

.stat-trend {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.trend-positive {
  background: #eef2ff;
  color: #4f46e5;
}

.trend-amber {
  background: #fef3c7;
  color: #b45309;
}

.trend-emerald {
  background: #ecfdf5;
  color: #047857;
}

.trend-violet {
  background: #f3e8ff;
  color: #6d28d9;
}

.stat-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted);
  letter-spacing: -0.2px;
}

.stat-value {
  font-size: 1.85rem;
  font-weight: 800;
  color: var(--text-main);
  letter-spacing: -0.8px;
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.stat-unit {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-muted);
}

/* Brands Section */
.brands-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mb-3 {
  margin-bottom: 4px;
}

.brands-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 18px;
}

.brand-stat-card {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-radius: var(--radius-md);
  border-top: 4px solid var(--primary);
  transition: all 0.2s ease;
}

.btn-icon-danger {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-icon-danger:hover {
  background: #fee2e2;
  color: #dc2626;
}

.brand-stat-card:hover {
  transform: translateY(-2px);
}

.brand-stat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.brand-corner-logo {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 40px;
  height: 28px;
  background: transparent;
  border: none;
  box-shadow: none;
}

.brands-empty-alert {
  padding: 24px;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  text-align: center;
  color: #64748b;
  font-size: 0.9rem;
}

.brand-pill-name {
  font-size: 0.95rem;
  font-weight: 800;
  letter-spacing: 1px;
}

.brand-stat-val {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-main);
  letter-spacing: -0.5px;
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.brand-stat-unit {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-muted);
}

.brand-stat-footer {
  font-size: 0.72rem;
  color: var(--text-light);
  font-weight: 500;
}

/* Card Themes */
.brand-card-nike {
  border-top-color: #0f172a;
}
.brand-card-nike .brand-pill-name {
  color: #0f172a;
}

.brand-card-fila {
  border-top-color: #00205b;
}
.brand-card-fila .brand-pill-name {
  color: #00205b;
}

.brand-card-umbro {
  border-top-color: #0284c7;
}
.brand-card-umbro .brand-pill-name {
  color: #0284c7;
}

.brand-card-osklen {
  border-top-color: #ca8a04;
}
.brand-card-osklen .brand-pill-name {
  color: #854d0e;
}

/* Seção de Tabela */
.dashboard-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.section-title-wrap h2,
.section-title-wrap h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-main);
  letter-spacing: -0.4px;
}

.section-subtitle {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.btn-text-link {
  background: transparent;
  border: none;
  color: var(--primary);
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.btn-text-link:hover {
  color: var(--primary-hover);
  transform: translateX(3px);
}

.table-card {
  padding: 0;
  overflow: hidden;
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.9rem;
}

.modern-table th {
  background: #f8fafc;
  padding: 14px 20px;
  font-weight: 700;
  color: #475569;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid var(--border);
}

.modern-table td {
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  color: var(--text-main);
}

.modern-table tbody tr {
  transition: background-color 0.15s ease;
}

.modern-table tbody tr:hover {
  background-color: #f8fafc;
}

.cell-date {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.badge-marca {
  display: inline-block;
  padding: 3px 9px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  background: #0f172a;
  color: #ffffff;
}

.marca-nike {
  background: #0f172a;
  color: #ffffff;
}

.marca-fila {
  background: #00205b;
  color: #ffffff;
  border-left: 3px solid #ef4444;
}

.marca-umbro {
  background: #0284c7;
  color: #ffffff;
}

.marca-osklen {
  background: #27272a;
  color: #fde047;
}

.cracha-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #f1f5f9;
  color: #334155;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
}

.unit-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 500;
  margin-left: 2px;
}

.font-medium {
  font-weight: 600;
}

.font-semibold {
  font-weight: 600;
}

.font-bold {
  font-weight: 700;
}

.text-muted {
  color: var(--text-muted);
}

.text-right {
  text-align: right;
}

.empty-state {
  padding: 50px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.empty-icon {
  color: #94a3b8;
  margin-bottom: 6px;
}

.empty-state h3 {
  font-size: 1.1rem;
  color: var(--text-main);
  font-weight: 700;
}

.empty-state p {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.mt-3 {
  margin-top: 14px;
}

/* Crachá Placeholder Bloqueado no Formulário */
.cracha-lock-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background-color: #f8fafc;
  border: 1.5px dashed #cbd5e1;
  border-radius: var(--radius-md);
  color: #64748b;
  font-size: 0.86rem;
  font-weight: 600;
  cursor: default;
  user-select: none;
}

.cracha-lock-badge.cracha-lock-amber {
  background-color: #fffbeb;
  border-color: #fde68a;
  color: #b45309;
}

/* Modal de Confirmação do Crachá */
.cracha-modal-backdrop {
  z-index: 100000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(4px);
}

.cracha-modal-card {
  background: white;
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 490px;
  padding: 28px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
  border: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: zoomInModal 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes zoomInModal {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.cracha-modal-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  position: relative;
}

.cracha-modal-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.cracha-modal-titles h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-main);
  letter-spacing: -0.3px;
}

.cracha-modal-titles p {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-top: 2px;
  line-height: 1.4;
}

.btn-close-modal {
  margin-left: auto;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.2s;
}

.btn-close-modal:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.cracha-resumo-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: var(--radius-md);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cracha-resumo-box.resumo-abast {
  border-left: 4px solid #4f46e5;
  background: #f8faff;
}

.cracha-resumo-box.resumo-residuo {
  border-left: 4px solid #d97706;
  background: #fffdfa;
}

.resumo-linha {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.88rem;
}

.resumo-label {
  color: var(--text-muted);
  font-weight: 500;
}

.resumo-val {
  color: var(--text-main);
}

.cracha-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.label-cracha {
  font-weight: 700 !important;
  color: var(--text-main) !important;
}

.input-cracha-destaque {
  font-size: 1.15rem !important;
  font-weight: 700 !important;
  letter-spacing: 0.8px;
  padding: 14px 18px !important;
  text-align: center;
  border-width: 2px !important;
}

.field-hint-cracha {
  display: block;
  font-size: 0.78rem;
  color: var(--text-muted);
  text-align: center;
  margin-top: 4px;
}

.alert-cracha {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
}

.cracha-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}
</style>
