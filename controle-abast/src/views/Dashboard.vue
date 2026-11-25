<script setup>
import { useRouter } from 'vue-router'
import {
  Construction,
  Clock,
  Sparkles,
  BarChart3,
  TrendingUp,
  Trash2,
  DollarSign,
  ArrowLeft,
  ListFilter,
  PlusCircle,
} from 'lucide-vue-next'

const router = useRouter()
</script>

<template>
  <div class="dashboard-page">
    <!-- Header -->
    <div class="page-header header-with-actions">
      <div>
        <div class="header-badge badge-dev">
          <Clock :size="15" />
          <span>Status: Em Desenvolvimento</span>
        </div>
        <h1 class="page-title">Painel de Indicadores (Dashboard)</h1>
        <p class="page-subtitle">
          Módulo analítico e indicadores de inteligência operacional em fase de desenvolvimento
        </p>
      </div>
      <div class="header-actions">
        <button @click="router.push('/')" class="btn-secondary">
          <ArrowLeft :size="18" /> Voltar ao Início
        </button>
      </div>
    </div>

    <!-- Card Principal de Status Em Desenvolvimento -->
    <div class="modern-card dev-hero-card">
      <div class="dev-hero-top">
        <div class="dev-icon-container">
          <div class="dev-icon-glow"></div>
          <div class="dev-icon-box">
            <Construction :size="46" class="dev-icon" />
          </div>
        </div>

        <div class="dev-content-header">
          <div class="status-chip-row">
            <span class="status-pill-dev">
              <span class="status-pulse-dot"></span>
              Em Desenvolvimento
            </span>
            <span class="version-pill">
              <Clock :size="13" />
              Versão Beta em Breve
            </span>
          </div>

          <h2 class="dev-title">Indicadores e Gráficos em Construção</h2>
          <p class="dev-description">
            Os dados estatísticos, métricas de consumo e relatórios visuais estão temporariamente desabilitados 
            nesta seção. Nossa equipe está estruturando novos modelos analíticos de balanceamento de insumos químicos, 
            indicadores por linha de montagem e consolidação de estoque para a indústria calçadista.
          </p>
        </div>
      </div>

      <!-- Divisor elegante -->
      <div class="dev-divider"></div>

      <!-- Preview de Módulos e Funcionalidades Planejadas -->
      <div class="upcoming-wrapper">
        <div class="upcoming-header">
          <div class="upcoming-title-box">
            <Sparkles :size="20" class="text-amber" />
            <h3>O que estará disponível neste Dashboard</h3>
          </div>
          <span class="upcoming-subtitle">Recursos analíticos em fase de implementação</span>
        </div>

        <div class="upcoming-grid">
          <!-- Card 1 -->
          <div class="upcoming-card">
            <div class="upcoming-card-icon icon-indigo">
              <BarChart3 :size="22" />
            </div>
            <div class="upcoming-card-body">
              <h4>Consumo em Tempo Real</h4>
              <p>Métricas de volume consumido por turno, data, operador e produto químico aplicado.</p>
            </div>
          </div>

          <!-- Card 2 -->
          <div class="upcoming-card">
            <div class="upcoming-card-icon icon-emerald">
              <TrendingUp :size="22" />
            </div>
            <div class="upcoming-card-body">
              <h4>Distribuição por Marca & Célula</h4>
              <p>Relatórios consolidados de insumos por marcas parceiras e linhas de montagem ativas.</p>
            </div>
          </div>

          <!-- Card 3 -->
          <div class="upcoming-card">
            <div class="upcoming-card-icon icon-amber">
              <Trash2 :size="22" />
            </div>
            <div class="upcoming-card-body">
              <h4>Gestão & Balanço de Resíduos</h4>
              <p>Monitoramento de taxas de descarte químico e aderência aos padrões de sustentabilidade ambiental.</p>
            </div>
          </div>

          <!-- Card 4 -->
          <div class="upcoming-card">
            <div class="upcoming-card-icon icon-violet">
              <DollarSign :size="22" />
            </div>
            <div class="upcoming-card-body">
              <h4>Custos & Estimativa Financeira</h4>
              <p>Visão financeira detalhada do investimento em adesivos, solventes e catalisadores.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Ações de Navegação Recomendadas -->
      <div class="dev-footer-actions">
        <button @click="router.push('/')" class="btn-primary">
          <ArrowLeft :size="18" /> Voltar ao Painel Principal
        </button>
        <button @click="router.push('/registros')" class="btn-secondary">
          <ListFilter :size="18" /> Consultar Histórico de Registros
        </button>
        <button @click="router.push('/abastecimento')" class="btn-secondary">
          <PlusCircle :size="18" /> Novo Abastecimento
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 28px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.header-with-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.header-badge.badge-dev {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #fef3c7;
  color: #b45309;
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.3px;
  margin-bottom: 8px;
  border: 1px solid #fde68a;
}

.dev-hero-card {
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  border-radius: var(--radius-lg);
  border: 1px solid #e2e8f0;
  background: #ffffff;
  position: relative;
  box-shadow: 0 10px 30px -5px rgba(15, 23, 42, 0.05);
}

.dev-hero-top {
  display: flex;
  gap: 32px;
  align-items: flex-start;
}

@media (max-width: 768px) {
  .dev-hero-top {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}

.dev-icon-container {
  position: relative;
  flex-shrink: 0;
}

.dev-icon-glow {
  position: absolute;
  inset: -8px;
  background: radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, rgba(245, 158, 11, 0) 70%);
  border-radius: 50%;
  filter: blur(10px);
}

.dev-icon-box {
  position: relative;
  width: 88px;
  height: 88px;
  border-radius: 24px;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border: 2px solid #fde68a;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d97706;
  box-shadow: 0 8px 20px -4px rgba(217, 119, 6, 0.2);
}

.dev-icon {
  animation: gentle-bounce 3s ease-in-out infinite;
}

@keyframes gentle-bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

.dev-content-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.status-chip-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.status-pill-dev {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #fef3c7;
  color: #b45309;
  border: 1px solid #fde68a;
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 700;
}

.status-pulse-dot {
  width: 8px;
  height: 8px;
  background-color: #d97706;
  border-radius: 50%;
  animation: pulse-dot 1.8s infinite;
}

@keyframes pulse-dot {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(217, 119, 6, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 6px rgba(217, 119, 6, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(217, 119, 6, 0);
  }
}

.version-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 600;
}

.dev-title {
  font-size: 1.65rem;
  font-weight: 800;
  color: var(--text-main);
  letter-spacing: -0.5px;
  margin: 0;
}

.dev-description {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--text-muted);
  max-width: 900px;
  margin: 0;
}

.dev-divider {
  height: 1px;
  background: #f1f5f9;
  width: 100%;
}

/* Seção de Funcionalidades Futuras */
.upcoming-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.upcoming-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.upcoming-title-box {
  display: flex;
  align-items: center;
  gap: 8px;
}

.upcoming-title-box h3 {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
}

.text-amber {
  color: #d97706;
}

.upcoming-subtitle {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.upcoming-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

@media (max-width: 860px) {
  .upcoming-grid {
    grid-template-columns: 1fr;
  }
}

.upcoming-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  border-radius: var(--radius-md);
  background: #f8fafc;
  border: 1px solid #edf2f7;
  transition: all 0.2s ease;
}

.upcoming-card:hover {
  background: #ffffff;
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
  transform: translateY(-2px);
}

.upcoming-card-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-indigo {
  background: #eef2ff;
  color: #4f46e5;
}

.icon-emerald {
  background: #ecfdf5;
  color: #059669;
}

.icon-amber {
  background: #fef3c7;
  color: #d97706;
}

.icon-violet {
  background: #f3e8ff;
  color: #7c3aed;
}

.upcoming-card-body h4 {
  font-size: 0.96rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 4px;
}

.upcoming-card-body p {
  font-size: 0.85rem;
  color: var(--text-muted);
  line-height: 1.45;
  margin: 0;
}

/* Rodapé com Ações */
.dev-footer-actions {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  padding-top: 8px;
}

@media (max-width: 600px) {
  .dev-hero-card {
    padding: 24px;
  }
  .dev-footer-actions {
    flex-direction: column;
    width: 100%;
  }
  .dev-footer-actions button {
    width: 100%;
    justify-content: center;
  }
}
</style>
