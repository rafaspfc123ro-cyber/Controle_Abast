<script setup>
import { LayoutDashboard, BarChart2, FlaskConical, ListFilter, ShieldCheck, Database } from 'lucide-vue-next'
</script>

<template>
  <div class="app-container">
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo-container">
          <div class="logo-icon">
            <FlaskConical color="white" :size="22" />
          </div>
          <div class="logo-text">
            <h2>Control<span>Abast</span></h2>
            <span class="badge-version">SETOR QUÍMICO</span>
          </div>
        </div>
        <p class="company-tag">Indústria de Calçados</p>
      </div>
      
      <nav class="menu">
        <span class="menu-label">MENU PRINCIPAL</span>
        <router-link to="/">
          <div class="link-content">
            <LayoutDashboard :size="19" />
            <span>Painel</span>
          </div>
        </router-link>
        <router-link to="/registros">
          <div class="link-content">
            <ListFilter :size="19" />
            <span>Registros</span>
          </div>
        </router-link>
        <router-link to="/cadastros">
          <div class="link-content">
            <Database :size="19" />
            <span>Cadastro</span>
          </div>
        </router-link>
        <router-link to="/dashboard">
          <div class="link-content">
            <BarChart2 :size="19" />
            <span>Dashboard</span>
            <span class="badge-dev-pill">Em breve</span>
          </div>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <div class="system-status">
          <div class="status-indicator">
            <span class="pulse-dot"></span>
            <span class="status-text">Setor Químico Ativo</span>
          </div>
          <p class="status-sub"><ShieldCheck :size="14" /> Marcas & Insumos Integrados</p>
        </div>
      </div>
    </aside>

    <main class="content">
      <div class="page-container">
        <router-view></router-view>
      </div>
    </main>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

:root {
  --primary: #4f46e5;
  --primary-hover: #4338ca;
  --primary-gradient: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  --primary-light: #eef2ff;
  --primary-glow: rgba(99, 102, 241, 0.25);
  
  --accent-cyan: #06b6d4;
  --accent-emerald: #10b981;
  --accent-amber: #f59e0b;
  --accent-rose: #f43f5e;
  
  --bg-color: #f8fafc;
  --sidebar-bg: #0b0f19;
  --sidebar-surface: #131b2e;
  --sidebar-border: rgba(255, 255, 255, 0.07);
  
  --text-main: #0f172a;
  --text-muted: #64748b;
  --text-light: #94a3b8;
  
  --border: #e2e8f0;
  --border-focus: #818cf8;
  --card-bg: #ffffff;
  
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.04);
  --shadow-lg: 0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04);

  /* Layout Global & Container das Páginas */
  --page-max-width: 1360px;
  --page-padding-y: 2.25rem;
  --page-padding-x: 2rem;
}

html {
  font-size: 91%;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
}

body {
  background-color: var(--bg-color);
  color: var(--text-main);
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}

.app-container {
  display: flex;
  min-height: 100vh;
}

/* Sidebar */
.sidebar {
  width: 270px;
  background-color: var(--sidebar-bg);
  border-right: 1px solid var(--sidebar-border);
  padding: 24px 16px;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  height: 100vh;
}

.sidebar-header {
  padding: 0 8px 20px 8px;
  border-bottom: 1px solid var(--sidebar-border);
}

.company-tag {
  font-size: 0.72rem;
  color: #94a3b8;
  margin-top: 6px;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  background: var(--primary-gradient);
  width: 42px;
  height: 42px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px -4px rgba(99, 102, 241, 0.5);
}

.logo-text h2 {
  font-size: 1.2rem;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 2px;
}

.logo-text h2 span {
  background: linear-gradient(135deg, #818cf8 0%, #06b6d4 100%);
  -webkit-background-clip: text;
-webkit-text-fill-color: transparent;
}

.badge-version {
  font-size: 0.68rem;
  background: rgba(99, 102, 241, 0.15);
  color: #a5b4fc;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

/* Menu */
.menu {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 20px 0;
  flex: 1;
}

.menu-label {
  font-size: 0.68rem;
  font-weight: 700;
  color: #475569;
  letter-spacing: 1px;
  padding: 0 12px 8px;
}

.menu a {
  display: flex;
  align-items: center;
  color: var(--text-light);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.92rem;
  padding: 11px 14px;
  border-radius: var(--radius-md);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.link-content {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.menu a:hover {
  background-color: var(--sidebar-surface);
  color: #ffffff;
  transform: translateX(3px);
}

.menu a.router-link-active {
  background: var(--primary-gradient);
  color: #ffffff;
  font-weight: 600;
  box-shadow: 0 8px 16px -4px rgba(79, 70, 229, 0.4);
}

.badge-dev-pill {
  margin-left: auto;
  font-size: 0.7rem;
  background: rgba(245, 158, 11, 0.18);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.3);
  padding: 2px 7px;
  border-radius: 9999px;
  font-weight: 700;
  letter-spacing: 0.4px;
}

/* Footer Status */
.sidebar-footer {
  border-top: 1px solid var(--sidebar-border);
  padding-top: 16px;
}

.system-status {
  background: var(--sidebar-surface);
  padding: 12px 14px;
  border-radius: var(--radius-md);
  border: 1px solid var(--sidebar-border);
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #e2e8f0;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background-color: var(--accent-emerald);
  border-radius: 50%;
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.status-sub {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.72rem;
  color: #64748b;
  margin-top: 4px;
}

/* Main Content & Page Container Centralizado */
.content {
  flex: 1;
  overflow-y: auto;
  max-height: 100vh;
  background-color: var(--bg-color);
  width: 100%;
}

.page-container {
  width: 100%;
  max-width: var(--page-max-width);
  margin: 0 auto;
  padding: var(--page-padding-y) var(--page-padding-x);
  box-sizing: border-box;
}

/* Tipografia e Títulos Globais */
.page-header {
  margin-bottom: 28px;
}

.page-title {
  font-size: 1.75rem;
  color: var(--text-main);
  font-weight: 800;
  letter-spacing: -0.6px;
}

.page-subtitle {
  color: var(--text-muted);
  font-size: 0.95rem;
  margin-top: 4px;
}

/* Cartão Moderno Global */
.modern-card {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-md);
  padding: 28px;
  transition: all 0.25s ease;
}

.modern-card:hover {
  box-shadow: var(--shadow-lg);
}

/* Formulários Modernos Globais */
.modern-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 18px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.input-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 6px;
}

.modern-input {
  padding: 12px 16px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--border);
  font-size: 0.95rem;
  color: var(--text-main);
  background-color: #f8fafc;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
  font-family: inherit;
}

.modern-input:focus {
  border-color: var(--border-focus);
  background: #ffffff;
  box-shadow: 0 0 0 4px var(--primary-glow);
}

/* Botões Modernos Globais */
.btn-primary {
  background: var(--primary-gradient);
  color: white;
  border: none;
  padding: 14px 22px;
  border-radius: var(--radius-md);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 4px 14px -2px rgba(79, 70, 229, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px -2px rgba(79, 70, 229, 0.5);
  filter: brightness(1.05);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-secondary {
  background: #f1f5f9;
  color: #334155;
  border: 1px solid var(--border);
  padding: 12px 20px;
  border-radius: var(--radius-md);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-secondary:hover {
  background: #e2e8f0;
  color: #0f172a;
}

/* Badges Globais */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.2px;
}

.badge-abastecimento {
  background-color: #eef2ff;
  color: #4f46e5;
  border: 1px solid #c7d2fe;
}

.badge-residuo {
  background-color: #fef3c7;
  color: #d97706;
  border: 1px solid #fde68a;
}

/* Toast / Feedback Alert */
.alert-success {
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  color: #065f46;
  padding: 14px 18px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.92rem;
  font-weight: 500;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>