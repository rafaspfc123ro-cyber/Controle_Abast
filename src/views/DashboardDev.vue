<script setup>
import { useRouter } from 'vue-router'
import { 
  LayoutDashboard, 
  Sparkles, 
  Clock, 
  ArrowLeft, 
  PlusCircle,
  TrendingUp,
  BarChart2,
  FileSpreadsheet
} from 'lucide-vue-next'

const router = useRouter()
</script>

<template>
  <div class="dev-page">
    <div class="page-header">
      <div class="header-badge">
        <LayoutDashboard :size="15" />
        <span>Módulo Avançado • Business Intelligence</span>
      </div>
      <h1 class="page-title">Dashboard Analítico</h1>
      <p class="page-subtitle">Indicadores consolidados, gráficos de tendências e previsibilidade para o setor químico</p>
    </div>

    <!-- Card Principal de Em Desenvolvimento -->
    <div class="modern-card dev-hero-card">
      <div class="dev-banner-badge">
        <Clock :size="15" />
        <span>Módulo em Desenvolvimento</span>
      </div>

      <div class="dev-hero-content">
        <div class="dev-icon-circle">
          <LayoutDashboard :size="42" />
        </div>
        
        <h2>Painel Analítico e Gráficos em Construção</h2>
        <p class="dev-hero-desc">
          Estamos desenvolvendo recursos analíticos avançados para transformar os registros do setor químico em tomadas de decisão rápidas, incluindo projeções de consumo, comparativos por turno e previsão de reabastecimento.
        </p>
      </div>

      <!-- Recursos Previstos -->
      <div class="features-preview-grid">
        <div class="feature-item">
          <div class="feat-icon feat-indigo">
            <TrendingUp :size="20" />
          </div>
          <div class="feat-text">
            <h4>Tendência de Consumo por Linha</h4>
            <p>Gráficos interativos de litros/quilos consumidos por célula e por marca ao longo do tempo.</p>
          </div>
        </div>

        <div class="feature-item">
          <div class="feat-icon feat-emerald">
            <BarChart2 :size="20" />
          </div>
          <div class="feat-text">
            <h4>Eficiência de Insumos</h4>
            <p>Métricas de consumo por par produzido e detecção de variações anormais no uso de primers e adesivos.</p>
          </div>
        </div>

        <div class="feature-item">
          <div class="feat-icon feat-amber">
            <Sparkles :size="20" />
          </div>
          <div class="feat-text">
            <h4>Previsão de Ponto de Pedido</h4>
            <p>Alertas preditivos automáticos para quando o estoque de químicos nas linhas atingir o limite mínimo.</p>
          </div>
        </div>

        <div class="feature-item">
          <div class="feat-icon feat-cyan">
            <FileSpreadsheet :size="20" />
          </div>
          <div class="feat-text">
            <h4>Relatórios BI & Exportação</h4>
            <p>Consolidação mensal e fechamento contábil dos custos químicos por marca (Nike, Fila, Umbro, Osklen).</p>
          </div>
        </div>
      </div>

      <!-- Ações -->
      <div class="dev-actions">
        <button @click="router.push('/')" class="btn-secondary">
          <ArrowLeft :size="18" /> Voltar para o Início
        </button>
        <button @click="router.push('/abastecimento')" class="btn-primary">
          <PlusCircle :size="18" /> Fazer Abastecimento
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dev-page {
  display: flex;
  flex-direction: column;
  gap: 28px;
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

.dev-hero-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 44px 32px;
  gap: 32px;
}

.dev-banner-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: #fef3c7;
  color: #b45309;
  border: 1px solid #fde68a;
  padding: 6px 16px;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.dev-hero-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 680px;
  gap: 12px;
}

.dev-icon-circle {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-xl);
  background: var(--primary-gradient);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  box-shadow: 0 10px 25px -4px rgba(79, 70, 229, 0.4);
}

.dev-hero-content h2 {
  font-size: 1.65rem;
  font-weight: 800;
  color: var(--text-main);
  letter-spacing: -0.5px;
}

.dev-hero-desc {
  font-size: 0.95rem;
  color: var(--text-muted);
  line-height: 1.6;
}

/* Grid de Recursos Futuros */
.features-preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 18px;
  width: 100%;
  text-align: left;
  margin-top: 10px;
}

.feature-item {
  background: #f8fafc;
  border: 1px solid var(--border);
  padding: 18px;
  border-radius: var(--radius-md);
  display: flex;
  gap: 14px;
  align-items: flex-start;
  transition: all 0.2s ease;
}

.feature-item:hover {
  background: #ffffff;
  border-color: #cbd5e1;
  box-shadow: var(--shadow-sm);
  transform: translateY(-2px);
}

.feat-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.feat-indigo {
  background: #eef2ff;
  color: #4f46e5;
}

.feat-emerald {
  background: #ecfdf5;
  color: #059669;
}

.feat-amber {
  background: #fef3c7;
  color: #d97706;
}

.feat-cyan {
  background: #ecfeff;
  color: #0891b2;
}

.feat-text h4 {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 4px;
}

.feat-text p {
  font-size: 0.8rem;
  color: var(--text-muted);
  line-height: 1.45;
}

.dev-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  padding-top: 16px;
  border-top: 1px solid var(--border);
  width: 100%;
}
</style>
