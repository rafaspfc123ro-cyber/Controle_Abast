<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  FlaskConical, 
  Trash2, 
  Activity, 
  ArrowUpRight, 
  PlusCircle, 
  Calendar, 
  ArrowRight, 
  IdCard, 
  Tag, 
  DollarSign
} from 'lucide-vue-next'
import { useRegistrosStore } from '../stores/registros'

const router = useRouter()
const store = useRegistrosStore()

const totalOperacoes = computed(() => store.registros.length)

// Últimos 6 registros
const ultimosRegistros = computed(() => {
  return store.registros.slice(0, 6)
})

const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0)
}
</script>

<template>
  <div class="dashboard-page">
    <!-- Header -->
    <div class="page-header header-with-actions">
      <div>
        <div class="header-badge">
          <FlaskConical :size="15" />
          <span>Setor Químico • Calçados</span>
        </div>
        <h1 class="page-title">Painel de Controle</h1>
        <p class="page-subtitle">Acompanhamento do abastecimento de insumos químicos por marca, célula e operador</p>
      </div>
      <div class="header-actions">
        <button @click="router.push('/abastecimento')" class="btn-primary">
          <PlusCircle :size="18" /> Novo Abastecimento
        </button>
      </div>
    </div>

    <!-- Cards Principais de Métricas -->
    <div class="stats-grid">
      <!-- Total Abastecido -->
      <div class="modern-card stat-card card-indigo">
        <div class="stat-top">
          <div class="stat-icon-wrapper indigo-glow">
            <FlaskConical :size="22" />
          </div>
          <span class="stat-trend trend-positive">
            <ArrowUpRight :size="14" /> Químicos
          </span>
        </div>
        <div class="stat-body">
          <span class="stat-label">Total Abastecido</span>
          <div class="stat-value">
            {{ store.totalAbastecido.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 3 }) }}
            <span class="stat-unit">Kg / L</span>
          </div>
        </div>
      </div>

      <!-- Resíduos Coletados -->
      <div class="modern-card stat-card card-amber">
        <div class="stat-top">
          <div class="stat-icon-wrapper amber-glow">
            <Trash2 :size="22" />
          </div>
          <span class="stat-trend trend-amber">
            Ambiental
          </span>
        </div>
        <div class="stat-body">
          <span class="stat-label">Resíduos Químicos Destinados</span>
          <div class="stat-value">
            {{ store.totalResiduos.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) }}
            <span class="stat-unit">Kg</span>
          </div>
        </div>
      </div>

      <!-- Custos Totais em Insumos -->
      <div class="modern-card stat-card card-emerald">
        <div class="stat-top">
          <div class="stat-icon-wrapper emerald-glow">
            <DollarSign :size="22" />
          </div>
          <span class="stat-trend trend-emerald">
            Valor Estimado
          </span>
        </div>
        <div class="stat-body">
          <span class="stat-label">Custo Total de Insumos</span>
          <div class="stat-value">
            {{ formatarMoeda(store.custosTotais) }}
          </div>
        </div>
      </div>

      <!-- Operações Registradas -->
      <div class="modern-card stat-card card-violet">
        <div class="stat-top">
          <div class="stat-icon-wrapper violet-glow">
            <Activity :size="22" />
          </div>
          <span class="stat-trend trend-violet">
            Geral
          </span>
        </div>
        <div class="stat-body">
          <span class="stat-label">Lançamentos Realizados</span>
          <div class="stat-value">
            {{ totalOperacoes }}
            <span class="stat-unit">reg.</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Abastecimento por Marca (Dinâmico a partir dos Cadastros) -->
    <div class="brands-section">
      <div class="section-title-wrap mb-3">
        <h3>Volume Abastecido por Marca</h3>
        <span class="section-subtitle">Distribuição do consumo químico nas linhas de produção de calçados</span>
      </div>

      <div class="brands-grid">
        <div 
          v-for="m in store.marcas" 
          :key="m" 
          class="modern-card brand-stat-card"
          :class="`brand-card-${m.toLowerCase()}`"
        >
          <div class="brand-stat-header">
            <span class="brand-pill-name">{{ m }}</span>
            <Tag :size="16" class="brand-icon-tag" />
          </div>
          <div class="brand-stat-val">
            {{ (store.totaisPorMarca[m] || 0).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 3 }) }}
            <span class="brand-stat-unit">Kg/L</span>
          </div>
          <span class="brand-stat-footer">Insumos químicos aplicados</span>
        </div>
      </div>
    </div>

    <!-- Tabela de Movimentações Recentes -->
    <div class="dashboard-section">
      <div class="section-header">
        <div class="section-title-wrap">
          <h2>Últimas Movimentações Químicas</h2>
          <span class="section-subtitle">Abastecimentos e descartes mais recentes</span>
        </div>
        <button @click="router.push('/registros')" class="btn-text-link">
          Ver histórico completo <ArrowRight :size="16" />
        </button>
      </div>

      <div class="modern-card table-card">
        <div v-if="ultimosRegistros.length === 0" class="empty-state">
          <p>Nenhuma movimentação registrada no sistema.</p>
        </div>

        <table v-else class="modern-table">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Data & Hora</th>
              <th>Marca</th>
              <th>Célula</th>
              <th>Produto Químico</th>
              <th>Crachá</th>
              <th class="text-right">Quantidade</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in ultimosRegistros" :key="item.id">
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
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-page {
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

/* Grid de Estatísticas Principais */
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

.brand-stat-card:hover {
  transform: translateY(-2px);
}

.brand-stat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  padding: 40px;
  text-align: center;
  color: var(--text-muted);
}
</style>