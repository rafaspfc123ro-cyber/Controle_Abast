<script setup>
import { ref, nextTick } from 'vue'
import { 
  LayoutDashboard, 
  BarChart2, 
  FlaskConical, 
  ListFilter, 
  ShieldCheck, 
  Database,
  UserCheck,
  Lock,
  LogOut,
  Crown,
  KeyRound,
  X,
  AlertCircle,
  IdCard
} from 'lucide-vue-next'
import ModalConfirmarExclusao from './components/ModalConfirmarExclusao.vue'
import { useRegistrosStore } from './stores/registros'

const store = useRegistrosStore()

const modalLoginAberto = ref(false)
const crachaLogin = ref('')
const erroLogin = ref('')
const inputLoginRef = ref(null)

const abrirModalLoginAdmin = () => {
  crachaLogin.value = ''
  erroLogin.value = ''
  modalLoginAberto.value = true
  nextTick(() => {
    inputLoginRef.value?.focus()
  })
}

const fecharModalLogin = () => {
  modalLoginAberto.value = false
  crachaLogin.value = ''
  erroLogin.value = ''
}

const executarLoginAdmin = () => {
  if (!crachaLogin.value.trim()) {
    erroLogin.value = 'Informe o número do crachá do administrador.'
    return
  }

  const res = store.loginAdmin(crachaLogin.value)
  if (res.ok) {
    fecharModalLogin()
    store.mostrarNotificacaoCentro({
      tipo: 'sucesso',
      titulo: 'Modo Administrador Ativo!',
      mensagem: `Bem-vindo, ${res.usuario.nome}! Permissões de edição e exclusão liberadas.`
    })
  } else {
    erroLogin.value = res.msg || 'Crachá não autorizado como administrador.'
  }
}

const fazerLogout = () => {
  store.logoutAdmin()
  store.mostrarNotificacaoCentro({
    tipo: 'sucesso',
    titulo: 'Sessão Encerrada',
    mensagem: 'Você saiu do modo administrador com sucesso.'
  })
}
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
        <router-link v-if="store.isAdmin" to="/cadastros">
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

        <!-- Opção que aparece debaixo do dashboard quando entra com admin -->
        <router-link v-if="store.isAdmin" to="/usuarios" class="link-admin">
          <div class="link-content">
            <UserCheck :size="19" />
            <span>Gestão de Acessos</span>
            <span class="badge-admin-pill">Admin</span>
          </div>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <!-- Modo Padrão (Sem Admin) -->
        <div v-if="!store.isAdmin" class="system-status">
          <div class="status-indicator">
            <span class="status-dot"></span>
            <span class="status-text">Setor Químico Ativo</span>
          </div>
          <p class="status-sub"><ShieldCheck :size="14" /> Marcas & Insumos Integrados</p>
          <button type="button" @click="abrirModalLoginAdmin" class="btn-sidebar-admin">
            <Lock :size="13" /> Login
          </button>
        </div>

        <!-- Modo Administrador Ativo (Simples e Direto) -->
        <div v-else class="system-status system-status-admin">
          <div class="admin-status-head">
            <span class="admin-role-badge">
              <ShieldCheck :size="13" />
              {{ store.usuarioAdminLogado?.isMaster ? 'Master' : 'Admin' }}
            </span>
            <span class="admin-cracha-tag">Crachá: {{ store.usuarioAdminLogado?.cracha }}</span>
          </div>
          <p class="admin-user-name">{{ store.usuarioAdminLogado?.nome }}</p>
          <button type="button" @click="fazerLogout" class="btn-sidebar-logout">
            <LogOut :size="13" /> Sair do Modo Admin
          </button>
        </div>
      </div>
    </aside>

    <main class="content">
      <div class="page-container">
        <router-view></router-view>
      </div>
    </main>

    <!-- Modal Central de Exclusão Direta e Notificação Central -->
    <ModalConfirmarExclusao />

    <!-- Modal de Login -->
    <Teleport to="body">
      <Transition name="fade">
        <div 
          v-if="modalLoginAberto" 
          class="admin-modal-backdrop"
          @click.self="fecharModalLogin"
        >
          <div class="admin-modal-card">
            <div class="admin-modal-header">
              <div class="admin-modal-icon">
                <Lock :size="20" />
              </div>
              <div class="admin-modal-titles">
                <h3>Login</h3>
                <p>Identifique-se com o crachá de administrador para liberar edição e exclusão</p>
              </div>
              <button type="button" @click="fecharModalLogin" class="btn-close-modal" title="Fechar">
                <X :size="20" />
              </button>
            </div>

            <form @submit.prevent="executarLoginAdmin" class="admin-login-form">
              <div class="input-group">
                <label><IdCard :size="15" /> Crachá de Acesso</label>
                <input
                  ref="inputLoginRef"
                  type="text"
                  v-model="crachaLogin"
                  class="modern-input input-admin-cracha"
                  placeholder="Digite o crachá..."
                  required
                  autofocus
                />
              </div>

              <div v-if="erroLogin" class="alert-danger alert-login">
                <AlertCircle :size="16" />
                <span>{{ erroLogin }}</span>
              </div>

              <div class="admin-modal-actions">
                <button type="button" @click="fecharModalLogin" class="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" class="btn-primary btn-admin-enter">
                  <KeyRound :size="17" /> Login
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>
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

  /* Layout Global & Container das Páginas (Expandido para maior largura) */
  --page-max-width: 1680px;
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

.status-dot {
  width: 8px;
  height: 8px;
  background-color: var(--accent-emerald);
  border-radius: 50%;
  flex-shrink: 0;
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

/* Campo preenchido com cor e destaque visual */
.modern-input.input-filled {
  background-color: #ecfdf5;
  border-color: #10b981;
  color: #064e3b;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(16, 185, 129, 0.1);
}

.modern-input.input-filled:focus {
  border-color: #059669;
  background-color: #ffffff;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.25);
}

.suffix.suffix-filled {
  color: #059669 !important;
  font-weight: 700;
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

/* ---------------------------------------------------- */
/* Estilos do Modo Administrador e Gestão de Acessos    */
/* ---------------------------------------------------- */
.badge-admin-pill {
  margin-left: auto;
  font-size: 0.7rem;
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.35);
  padding: 2px 7px;
  border-radius: 9999px;
  font-weight: 700;
  letter-spacing: 0.4px;
}

.btn-sidebar-admin {
  background: rgba(99, 102, 241, 0.18);
  border: 1px solid rgba(129, 140, 248, 0.35);
  color: #c7d2fe;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 0.76rem;
  font-weight: 700;
  width: 100%;
  margin-top: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;
}

.btn-sidebar-admin:hover {
  background: rgba(99, 102, 241, 0.3);
  color: #ffffff;
  border-color: rgba(129, 140, 248, 0.6);
}

.system-status-admin {
  background: var(--sidebar-surface);
  border: 1px solid var(--sidebar-border);
}

.admin-status-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}

.admin-role-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.72rem;
  font-weight: 600;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.1);
  border: 1px solid rgba(56, 189, 248, 0.25);
  padding: 2px 7px;
  border-radius: 4px;
}

.admin-cracha-tag {
  font-size: 0.72rem;
  color: #94a3b8;
}

.admin-user-name {
  color: #f1f5f9;
  font-weight: 600;
  font-size: 0.85rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0 0 10px 0;
}

.btn-sidebar-logout {
  background: #1e293b;
  border: 1px solid #475569;
  color: #cbd5e1;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 0.75rem;
  font-weight: 500;
  width: 100%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;
}

.btn-sidebar-logout:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.4);
  color: #fca5a5;
}

/* Modal de Login Admin */
.admin-modal-backdrop {
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

.admin-modal-card {
  background: white;
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 480px;
  padding: 28px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
  border: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: zoomInModal 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.admin-modal-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.admin-modal-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: #f1f5f9;
  color: var(--primary);
  border: 1px solid var(--border);
}

.admin-modal-titles h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-main);
  letter-spacing: -0.3px;
}

.admin-modal-titles p {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-top: 2px;
  line-height: 1.4;
}

.master-hint-box {
  background: #f8faff;
  border: 1px solid #c7d2fe;
  border-left: 4px solid #4f46e5;
  border-radius: var(--radius-md);
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.85rem;
}

.master-hint-box .hint-title {
  color: #4f46e5;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
}

.master-hint-box .hint-val {
  color: #334155;
}

.admin-login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-admin-cracha {
  font-size: 1.15rem !important;
  font-weight: 700 !important;
  text-align: center;
  letter-spacing: 1px;
}

.alert-login {
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

.admin-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}

.btn-admin-enter {
  background: var(--primary) !important;
  box-shadow: none !important;
}
</style>