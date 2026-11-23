<script setup>
import { ref, computed } from 'vue'
import { 
  RotateCcw, 
  Trash2, 
  Pencil,
  Calendar, 
  Download, 
  FlaskConical, 
  Recycle, 
  Filter, 
  IdCard, 
  Building2,
  X,
  Save,
  CheckCircle2,
  AlertCircle,
  Tag,
  Scale
} from 'lucide-vue-next'
import { useRegistrosStore } from '../stores/registros'

const store = useRegistrosStore()

// ----------------------------------------------------
// Estado do Modal de Edição de Lançamento (Apenas Admin)
// ----------------------------------------------------
const modalEdicaoAberto = ref(false)
const itemEditando = ref(null)
const formEdicao = ref({
  id: null,
  tipo: '',
  data: '',
  hora: '',
  marca: '',
  celula: '',
  produto: '',
  qtd: 0,
  cracha: ''
})
const erroEdicao = ref('')

const abrirModalEdicao = (item) => {
  itemEditando.value = item
  const [dataPart, horaPart] = (item.dataHora || '').split(' ')
  let dataIso = ''
  if (dataPart && dataPart.includes('/')) {
    const [d, m, y] = dataPart.split('/')
    dataIso = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }

  formEdicao.value = {
    id: item.id,
    tipo: item.tipo,
    data: dataIso,
    hora: horaPart || '08:00',
    marca: item.marca || store.marcas[0] || '',
    celula: item.celula || store.celulas[0] || '',
    produto: item.produto || store.produtos[0]?.nome || '',
    qtd: item.qtd || 0,
    cracha: item.cracha || (item.nome && item.nome.replace('Crachá', '').trim()) || ''
  }
  erroEdicao.value = ''
  modalEdicaoAberto.value = true
}

const fecharModalEdicao = () => {
  modalEdicaoAberto.value = false
  itemEditando.value = null
  erroEdicao.value = ''
}

const salvarEdicao = () => {
  if (
    !formEdicao.value.data || 
    !formEdicao.value.marca || 
    !formEdicao.value.celula || 
    !formEdicao.value.produto || 
    !formEdicao.value.qtd || 
    !formEdicao.value.cracha
  ) {
    erroEdicao.value = 'Por favor, preencha todos os campos para salvar a alteração.'
    return
  }

  const [y, m, d] = formEdicao.value.data.split('-')
  const dataFormatada = `${d}/${m}/${y}`
  const dataHoraFinal = `${dataFormatada} ${formEdicao.value.hora}`

  // Localiza preço unitário do produto para recalcular o custo se for abastecimento
  const prodObj = store.produtos.find(p => p.nome.toLowerCase() === formEdicao.value.produto.toLowerCase())
  const vlrUnit = prodObj ? Number(prodObj.valor) : 0
  const qtdNum = Number(formEdicao.value.qtd)
  const vlrTot = formEdicao.value.tipo === 'Abastecimento' ? qtdNum * vlrUnit : 0

  const res = store.atualizarRegistro(formEdicao.value.id, {
    tipo: formEdicao.value.tipo,
    dataHora: dataHoraFinal,
    marca: formEdicao.value.marca,
    celula: formEdicao.value.celula.trim().toUpperCase(),
    produto: formEdicao.value.produto.trim(),
    qtd: qtdNum,
    valorUnitario: vlrUnit,
    valorTotal: vlrTot,
    cracha: formEdicao.value.cracha.trim(),
    nome: `Crachá ${formEdicao.value.cracha.trim()}`
  })

  if (res.ok) {
    fecharModalEdicao()
    store.mostrarNotificacaoCentro({
      tipo: 'sucesso',
      titulo: 'Registro Atualizado!',
      mensagem: 'As alterações do lançamento foram salvas com sucesso.'
    })
  } else {
    erroEdicao.value = res.msg || 'Erro ao atualizar registro.'
  }
}

const listaMarcasFiltro = computed(() => ['TODAS', ...store.marcas])

const filtros = ref({
  tipo: 'TODOS', // 'TODOS', 'Abastecimento', 'Resíduo'
  marca: 'TODAS', // 'TODAS' ou marca cadastrada
  dataInicio: '',
  dataFim: '',
  cracha: '',
  produto: '',
  celula: ''
})

const resetarFiltros = () => {
  filtros.value = {
    tipo: 'TODOS',
    marca: 'TODAS',
    dataInicio: '',
    dataFim: '',
    cracha: '',
    produto: '',
    celula: ''
  }
}

// Converte 'DD/MM/YYYY HH:mm' para 'YYYY-MM-DD'
const extrairIsoData = (dataHoraStr) => {
  if (!dataHoraStr) return ''
  const partes = dataHoraStr.split(' ')[0].split('/')
  if (partes.length !== 3) return ''
  const [dia, mes, ano] = partes
  return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`
}

// Filtra a lista da Store baseada nos filtros selecionados
const registrosFiltrados = computed(() => {
  return store.registros.filter((reg) => {
    // Tipo
    const bateTipo = filtros.value.tipo === 'TODOS' || reg.tipo === filtros.value.tipo

    // Marca
    const regMarca = (reg.marca || '').toUpperCase()
    const bateMarca = filtros.value.marca === 'TODAS' || regMarca === filtros.value.marca

    // Crachá
    const crachaStr = String(reg.cracha || reg.nome || '').toLowerCase()
    const bateCracha = !filtros.value.cracha || crachaStr.includes(filtros.value.cracha.toLowerCase())

    // Produto
    const bateProduto = !filtros.value.produto || 
      (reg.produto && reg.produto.toLowerCase().includes(filtros.value.produto.toLowerCase()))

    // Célula
    const bateCelula = !filtros.value.celula || 
      (reg.celula && reg.celula.toLowerCase().includes(filtros.value.celula.toLowerCase()))

    // Data Início e Fim
    const dataIso = extrairIsoData(reg.dataHora)
    const bateDataInicio = !filtros.value.dataInicio || (dataIso && dataIso >= filtros.value.dataInicio)
    const bateDataFim = !filtros.value.dataFim || (dataIso && dataIso <= filtros.value.dataFim)

    return bateTipo && bateMarca && bateCracha && bateProduto && bateCelula && bateDataInicio && bateDataFim
  })
})

const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0)
}

// Totais calculados dinamicamente sobre a listagem filtrada
const totais = computed(() => {
  const qtd = registrosFiltrados.value.reduce((acc, r) => acc + Number(r.qtd || 0), 0)
  const custo = registrosFiltrados.value.reduce((acc, r) => acc + Number(r.valorTotal || 0), 0)

  return {
    contagem: registrosFiltrados.value.length,
    quantidade: qtd.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 3 }),
    custoTotal: formatarMoeda(custo)
  }
})

const removerRegistro = (id) => {
  const item = store.registros.find(r => r.id === id)
  const itemDesc = item 
    ? `${item.tipo}: ${item.produto} • ${Number(item.qtd).toLocaleString('pt-BR')} Kg/L (${item.marca || item.celula})` 
    : `Lançamento #${id}`

  store.abrirConfirmacaoExclusao({
    titulo: 'Excluir Lançamento',
    descricao: 'Tem certeza que deseja excluir este lançamento? Esta ação removerá o registro e atualizará todos os relatórios.',
    itemNome: itemDesc,
    onConfirm: () => {
      store.removerRegistro(id)
      return {
        titulo: 'Lançamento Removido!',
        msg: 'O registro foi excluído e os totais foram recalculados com sucesso.'
      }
    }
  })
}

// Exportar dados atuais filtrados para arquivo CSV
const exportarCSV = () => {
  if (registrosFiltrados.value.length === 0) {
    alert('Nenhum registro para exportar.')
    return
  }

  const cabecalho = ['ID', 'Tipo', 'Data e Hora', 'Marca', 'Célula', 'Produto Químico', 'Crachá', 'Quantidade (Kg/L)', 'Valor Total (R$)']
  const linhas = registrosFiltrados.value.map(r => [
    r.id,
    `"${r.tipo}"`,
    `"${r.dataHora}"`,
    `"${r.marca || '—'}"`,
    `"${r.celula}"`,
    `"${r.produto}"`,
    `"${r.cracha || r.nome || '—'}"`,
    r.qtd,
    (r.valorTotal || 0).toFixed(2)
  ])

  const csvContent = '\uFEFF' + [cabecalho.join(';'), ...linhas.map(e => e.join(';'))].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `abastecimentos_quimico_${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<template>
  <div class="registros-page">
    <!-- Header -->
    <div class="page-header header-flex">
      <div>
        <h1 class="page-title">Registros</h1>
        <p class="page-subtitle">Consulte e filtre todos os lançamentos do setor químico por marca, célula e crachá</p>
      </div>

      <div class="header-buttons">
        <button @click="exportarCSV" class="btn-secondary" title="Exportar tabela atual para CSV / Excel">
          <Download :size="17" /> Exportar CSV
        </button>
      </div>
    </div>

    <!-- Barra de Filtros Centralizada e Ajustada -->
    <div class="modern-card filters-card">
      <div class="filters-top">
        <div class="filter-group-top">
          <!-- Tipo -->
          <div class="type-pills">
            <button 
              type="button" 
              class="pill-btn" 
              :class="{ active: filtros.tipo === 'TODOS' }" 
              @click="filtros.tipo = 'TODOS'"
            >
              Todos
            </button>
            <button 
              type="button" 
              class="pill-btn" 
              :class="{ active: filtros.tipo === 'Abastecimento' }" 
              @click="filtros.tipo = 'Abastecimento'"
            >
              <FlaskConical :size="14" /> Abastecimentos
            </button>
            <button 
              type="button" 
              class="pill-btn" 
              :class="{ active: filtros.tipo === 'Resíduo' }" 
              @click="filtros.tipo = 'Resíduo'"
            >
              <Recycle :size="14" /> Resíduos
            </button>
          </div>

          <!-- Filtro de Marcas Dinâmicas -->
          <div class="brand-filter-pills">
            <button
              type="button"
              v-for="m in listaMarcasFiltro"
              :key="m"
              class="brand-pill-btn"
              :class="{ active: filtros.marca === m }"
              @click="filtros.marca = m"
            >
              {{ m }}
            </button>
          </div>
        </div>

        <button @click="resetarFiltros" class="btn-reset" title="Limpar todos os filtros">
          <RotateCcw :size="14" /> Redefinir Filtros
        </button>
      </div>

      <!-- Grid de Filtros Uniforme e Alinhado -->
      <div class="filters-grid">
        <div class="filter-item">
          <label class="filter-field-label">Crachá</label>
          <div class="search-input-wrap">
            <IdCard :size="16" class="search-icon" />
            <input 
              type="text" 
              v-model="filtros.cracha" 
              placeholder="Buscar crachá..." 
              class="modern-input filter-input"
            />
          </div>
        </div>

        <div class="filter-item">
          <label class="filter-field-label">Produto Químico</label>
          <div class="search-input-wrap">
            <FlaskConical :size="16" class="search-icon" />
            <input 
              type="text" 
              v-model="filtros.produto" 
              placeholder="Buscar produto..." 
              class="modern-input filter-input"
            />
          </div>
        </div>

        <div class="filter-item">
          <label class="filter-field-label">Célula</label>
          <div class="search-input-wrap">
            <Building2 :size="16" class="search-icon" />
            <input 
              type="text" 
              v-model="filtros.celula" 
              placeholder="Buscar célula..." 
              class="modern-input filter-input"
            />
          </div>
        </div>

        <div class="filter-item">
          <label class="filter-field-label">Período de Data</label>
          <div class="date-filter-wrap">
            <input 
              type="date" 
              v-model="filtros.dataInicio" 
              class="modern-input date-input" 
              title="Data Inicial"
            />
            <span class="date-sep">até</span>
            <input 
              type="date" 
              v-model="filtros.dataFim" 
              class="modern-input date-input" 
              title="Data Final"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Indicadores Rápidos do Filtro -->
    <div class="summary-pills">
      <div class="summary-pill">
        <span class="label">Lançamentos Filtrados:</span>
        <span class="value">{{ totais.contagem }}</span>
      </div>
      <div class="summary-pill">
        <span class="label">Volume Total:</span>
        <span class="value highlight">{{ totais.quantidade }} Kg/L</span>
      </div>
      <div class="summary-pill">
        <span class="label">Custo Estimado:</span>
        <span class="value text-primary font-bold">{{ totais.custoTotal }}</span>
      </div>
      <div v-if="filtros.marca !== 'TODAS'" class="summary-pill">
        <span class="label">Marca:</span>
        <span class="value font-bold">{{ filtros.marca }}</span>
      </div>
    </div>

    <!-- Tabela de Registros -->
    <div class="modern-card table-card">
      <div v-if="registrosFiltrados.length === 0" class="empty-state">
        <Filter :size="40" class="empty-icon" />
        <h3>Nenhum registro encontrado</h3>
        <p>Tente alterar ou limpar os filtros de busca acima.</p>
        <button @click="resetarFiltros" class="btn-secondary mt-3">
          Limpar Filtros
        </button>
      </div>

      <div v-else class="table-responsive">
        <table class="modern-table">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Data & Hora</th>
              <th>Marca</th>
              <th>Célula</th>
              <th>Produto Químico</th>
              <th>Crachá</th>
              <th class="text-right">Quantidade</th>
              <th class="text-right">Valor Estimado</th>
              <th v-if="store.isAdmin" class="text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in registrosFiltrados" :key="item.id">
              <td>
                <span :class="['badge', item.tipo === 'Abastecimento' ? 'badge-abastecimento' : 'badge-residuo']">
                  {{ item.tipo }}
                </span>
              </td>
              <td class="cell-date">
                <Calendar :size="14" />
                {{ item.dataHora }}
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
              <td class="cell-cracha">
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
              <td v-if="store.isAdmin" class="text-center">
                <div class="actions-buttons">
                  <button 
                    @click="abrirModalEdicao(item)" 
                    class="btn-icon-edit" 
                    title="Editar este lançamento"
                  >
                    <Pencil :size="16" />
                  </button>
                  <button 
                    @click="removerRegistro(item.id)" 
                    class="btn-icon-danger" 
                    title="Excluir este lançamento"
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

    <!-- Modal de Edição de Lançamento (Apenas Admin) -->
    <Teleport to="body">
      <Transition name="fade">
        <div 
          v-if="modalEdicaoAberto" 
          class="edit-modal-backdrop"
          @click.self="fecharModalEdicao"
        >
          <div class="edit-modal-card">
            <div class="edit-modal-header">
              <div class="edit-modal-icon" :class="formEdicao.tipo === 'Abastecimento' ? 'icon-circle-abast' : 'icon-circle-residuo'">
                <Pencil :size="22" />
              </div>
              <div class="edit-modal-titles">
                <h3>Editar Lançamento #{{ formEdicao.id }}</h3>
                <p>Alteração autorizada pelo Administrador ({{ store.usuarioAdminLogado?.nome }})</p>
              </div>
              <button type="button" @click="fecharModalEdicao" class="btn-close-modal">
                <X :size="20" />
              </button>
            </div>

            <form @submit.prevent="salvarEdicao" class="edit-form">
              <div class="form-grid-edit">
                <div class="input-group">
                  <label><Calendar :size="15" /> Data</label>
                  <input type="date" v-model="formEdicao.data" class="modern-input" required />
                </div>

                <div class="input-group">
                  <label><IdCard :size="15" /> Crachá</label>
                  <input type="text" v-model="formEdicao.cracha" class="modern-input" required />
                </div>
              </div>

              <div class="form-grid-edit">
                <div class="input-group">
                  <label><Tag :size="15" /> Marca</label>
                  <select v-model="formEdicao.marca" class="modern-input" required>
                    <option v-for="m in store.marcas" :key="m" :value="m">{{ m }}</option>
                  </select>
                </div>

                <div class="input-group">
                  <label><Building2 :size="15" /> Célula de Produção</label>
                  <select v-model="formEdicao.celula" class="modern-input" required>
                    <option v-for="c in store.celulas" :key="c" :value="c">{{ c }}</option>
                  </select>
                </div>
              </div>

              <div class="form-grid-edit">
                <div class="input-group">
                  <label><FlaskConical :size="15" /> Produto Químico</label>
                  <select v-model="formEdicao.produto" class="modern-input" required>
                    <option v-for="p in store.produtos" :key="p.id" :value="p.nome">{{ p.nome }}</option>
                  </select>
                </div>

                <div class="input-group">
                  <label><Scale :size="15" /> Quantidade (Kg / L)</label>
                  <input type="number" step="0.001" min="0.001" v-model="formEdicao.qtd" class="modern-input" required />
                </div>
              </div>

              <div v-if="erroEdicao" class="alert-danger alert-login">
                <AlertCircle :size="16" />
                <span>{{ erroEdicao }}</span>
              </div>

              <div class="edit-modal-actions">
                <button type="button" @click="fecharModalEdicao" class="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" class="btn-primary">
                  <Save :size="17" /> Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.registros-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.header-buttons {
  display: flex;
  gap: 10px;
}

/* Filtros */
.filters-card {
  padding: 22px 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.filters-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.filter-group-top {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.type-pills {
  display: flex;
  background: #f1f5f9;
  padding: 4px;
  border-radius: var(--radius-md);
  gap: 4px;
}

.pill-btn {
  background: transparent;
  border: none;
  padding: 7px 14px;
  border-radius: var(--radius-sm);
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.pill-btn.active {
  background: #ffffff;
  color: var(--primary);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

/* Marca Filter Pills */
.brand-filter-pills {
  display: flex;
  background: #f1f5f9;
  padding: 4px;
  border-radius: var(--radius-md);
  gap: 4px;
  flex-wrap: wrap;
}

.brand-pill-btn {
  background: transparent;
  border: none;
  padding: 7px 12px;
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.brand-pill-btn:hover {
  color: var(--text-main);
}

.brand-pill-btn.active {
  background: #0f172a;
  color: #ffffff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.btn-reset {
  background: transparent;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 7px 14px;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.btn-reset:hover {
  background: #f8fafc;
  color: var(--text-main);
}

/* Grid de Filtros Uniforme e Alinhado */
.filters-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  align-items: flex-end;
}

@media (max-width: 1024px) {
  .filters-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .filters-grid {
    grid-template-columns: 1fr;
  }
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-field-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--text-muted);
  letter-spacing: 0.3px;
}

.search-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 14px;
  color: var(--text-light);
  pointer-events: none;
}

.filter-input {
  height: 44px;
  padding-left: 42px !important;
  width: 100%;
}

.date-filter-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 44px;
}

.date-input {
  height: 44px;
  padding: 8px 10px !important;
  font-size: 0.85rem !important;
  flex: 1;
  min-width: 0;
}

.date-sep {
  font-size: 0.78rem;
  color: var(--text-muted);
  font-weight: 600;
  flex-shrink: 0;
}

/* Indicadores de Resumo */
.summary-pills {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.summary-pill {
  background: #ffffff;
  border: 1px solid var(--border);
  padding: 8px 16px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  box-shadow: var(--shadow-sm);
}

.summary-pill .label {
  color: var(--text-muted);
  font-weight: 500;
}

.summary-pill .value {
  color: var(--text-main);
  font-weight: 700;
}

.summary-pill .highlight {
  color: var(--primary);
}

/* Tabela */
.table-card {
  padding: 0;
  overflow: hidden;
}

.table-responsive {
  overflow-x: auto;
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
  padding: 14px 20px;
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

/* Badges de Marca */
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

.cell-cracha {
  color: var(--text-main);
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

.empty-state {
  padding: 50px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.empty-icon {
  color: #94a3b8;
  margin-bottom: 8px;
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
  margin-top: 12px;
}

/* Botões de Ação na Tabela */
.actions-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-icon-edit {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #475569;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon-edit:hover {
  background: #e0e7ff;
  border-color: #a5b4fc;
  color: #4338ca;
  transform: scale(1.05);
}

/* Modal de Edição */
.edit-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(5px);
}

.edit-modal-card {
  background: white;
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 540px;
  padding: 28px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
  border: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: zoomInModal 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.edit-modal-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.edit-modal-icon {
  width: 46px;
  height: 46px;
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

.edit-modal-titles h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-main);
  letter-spacing: -0.3px;
}

.edit-modal-titles p {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-top: 2px;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-grid-edit {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

@media (max-width: 500px) {
  .form-grid-edit {
    grid-template-columns: 1fr;
  }
}

.edit-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 10px;
}
</style>
