<script setup>
import { Construction, Clock } from 'lucide-vue-next'
</script>

<template>
  <div class="dashboard-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-badge badge-dev">
        <Clock :size="15" />
        <span>Status: Em Desenvolvimento</span>
      </div>
      <h1 class="page-title">Painel de Indicadores (Dashboard)</h1>
      <p class="page-subtitle">
        Módulo analítico e indicadores de inteligência operacional em fase de desenvolvimento
      </p>
    </div>

    <!-- Card Principal de Status Em Desenvolvimento -->
    <div class="modern-card dev-hero-card">
      <div class="dev-hero-top">
        <div class="dev-icon-container">
          <div class="dev-icon-glow"></div>
          <div class="dev-icon-box">
            <Construction :size="48" class="dev-icon" />
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

.page-header {
  margin-bottom: 0;
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
  padding: 44px;
  display: flex;
  flex-direction: column;
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
  .dev-hero-card {
    padding: 28px 20px;
  }
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
  width: 92px;
  height: 92px;
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

@media (max-width: 768px) {
  .status-chip-row {
    justify-content: center;
  }
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
</style>
