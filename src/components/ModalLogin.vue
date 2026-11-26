<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { Lock, X, IdCard, KeyRound, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'
import { useRegistrosStore } from '../stores/registros'

const authStore = useAuthStore()
const registrosStore = useRegistrosStore()

const cracha = ref('')
const senha = ref('')
const mostrarSenha = ref(false)
const erroLocal = ref('')
const inputCrachaRef = ref(null)

const fechar = () => {
  if (authStore.loading) return
  authStore.fecharModalLogin()
}

watch(
  () => authStore.modalLoginAberto,
  (aberto) => {
    if (aberto) {
      cracha.value = ''
      senha.value = ''
      mostrarSenha.value = false
      erroLocal.value = ''
      nextTick(() => {
        inputCrachaRef.value?.focus()
      })
    }
  },
)

const submeterLogin = async () => {
  erroLocal.value = ''
  if (!cracha.value.trim() || !senha.value) {
    erroLocal.value = 'Informe o crachá e a senha para entrar.'
    return
  }

  const res = await authStore.login({
    cracha: cracha.value.trim(),
    senha: senha.value,
  })

  if (res.ok) {
    authStore.fecharModalLogin()
    registrosStore.mostrarNotificacaoCentro({
      tipo: 'sucesso',
      titulo: 'Login Realizado!',
      mensagem: `Bem-vindo, ${res.usuario?.nome || 'usuário'}! Sessão iniciada com sucesso.`,
    })
  } else {
    erroLocal.value = res.msg || 'Credenciais inválidas.'
  }
}

const onKeydown = (e) => {
  if (e.key === 'Escape' && authStore.modalLoginAberto) {
    fechar()
  }
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', onKeydown)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', onKeydown)
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="fade-modal">
      <div
        v-if="authStore.modalLoginAberto"
        class="central-modal-backdrop"
        @click.self="fechar"
      >
        <div
          class="central-modal-box"
          :class="{ 'box-shake': Boolean(erroLocal || authStore.error) }"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-login-title"
        >
          <button
            type="button"
            @click="fechar"
            class="modal-close-btn"
            title="Fechar"
            :disabled="authStore.loading"
          >
            <X :size="18" />
          </button>

          <div class="modal-icon-auth-wrap">
            <Lock :size="28" />
          </div>

          <h2 id="modal-login-title" class="modal-title">Login</h2>
          <p class="modal-desc">
            Entre com suas credenciais para acessar os cadastros e gerenciar lançamentos.
          </p>

          <form @submit.prevent="submeterLogin" class="auth-form-section">
            <div class="auth-field-group">
              <label class="auth-label" for="login-cracha">
                <IdCard :size="14" />
                <span>Crachá / Usuário</span>
              </label>
              <input
                id="login-cracha"
                ref="inputCrachaRef"
                v-model="cracha"
                type="text"
                class="auth-field"
                placeholder="Digite seu crachá..."
                autocomplete="username"
                :disabled="authStore.loading"
                required
              />
            </div>

            <div class="auth-field-group">
              <label class="auth-label" for="login-senha">
                <KeyRound :size="14" />
                <span>Senha</span>
              </label>
              <div
                class="password-input-wrapper"
                :class="{ 'input-has-error': Boolean(erroLocal || authStore.error) }"
              >
                <input
                  id="login-senha"
                  v-model="senha"
                  :type="mostrarSenha ? 'text' : 'password'"
                  class="password-field"
                  placeholder="Digite sua senha..."
                  autocomplete="current-password"
                  :disabled="authStore.loading"
                  required
                />
                <button
                  type="button"
                  class="btn-toggle-eye"
                  @click="mostrarSenha = !mostrarSenha"
                  :title="mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'"
                  tabindex="-1"
                >
                  <EyeOff v-if="mostrarSenha" :size="17" />
                  <Eye v-else :size="17" />
                </button>
              </div>
            </div>

            <Transition name="fade-error">
              <div v-if="erroLocal || authStore.error" class="auth-error-alert">
                <AlertCircle :size="15" />
                <span>{{ erroLocal || authStore.error }}</span>
              </div>
            </Transition>

            <div class="modal-actions-row">
              <button
                type="button"
                @click="fechar"
                class="btn-modal-cancel"
                :disabled="authStore.loading"
              >
                Cancelar
              </button>

              <button type="submit" class="btn-modal-login" :disabled="authStore.loading">
                <Loader2 v-if="authStore.loading" :size="16" class="spin-icon" />
                <KeyRound v-else :size="16" />
                <span>{{ authStore.loading ? 'Entrando...' : 'Entrar' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ====================================================
   MODAL CENTRAL DE LOGIN (Padrão ModalConfirmarExclusao)
   ==================================================== */
.central-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.central-modal-box {
  background: #ffffff;
  border-radius: 20px;
  max-width: 460px;
  width: 100%;
  box-shadow:
    0 25px 50px -12px rgba(15, 23, 42, 0.35),
    0 0 0 1px rgba(226, 232, 240, 0.9);
  padding: 30px 28px 26px 28px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  animation: scale-up 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.modal-close-btn:hover:not(:disabled) {
  background: #f1f5f9;
  color: #0f172a;
}

.modal-icon-auth-wrap {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #eef2ff;
  color: #4f46e5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  box-shadow: 0 0 0 8px #f5f7ff;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 6px;
  letter-spacing: -0.02em;
}

.modal-desc {
  font-size: 0.88rem;
  color: #64748b;
  margin-bottom: 18px;
  line-height: 1.45;
}

/* Formulário de Login */
.auth-form-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
  text-align: left;
}

.auth-field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.auth-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #334155;
}

.auth-field {
  width: 100%;
  padding: 11px 14px;
  border-radius: 10px;
  border: 1.5px solid #cbd5e1;
  background: #ffffff;
  font-size: 0.95rem;
  color: #0f172a;
  outline: none;
  transition: all 0.2s ease;
}

.auth-field:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.18);
}

.password-input-wrapper {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
}

.password-field {
  width: 100%;
  padding: 11px 40px 11px 14px;
  border-radius: 10px;
  border: 1.5px solid #cbd5e1;
  background: #ffffff;
  font-size: 0.95rem;
  color: #0f172a;
  outline: none;
  transition: all 0.2s ease;
}

.password-field:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.18);
}

.input-has-error .password-field {
  border-color: #dc2626;
  background: #fffafb;
}

.btn-toggle-eye {
  position: absolute;
  right: 10px;
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: color 0.15s ease;
}

.btn-toggle-eye:hover {
  color: #334155;
}

.auth-error-alert {
  display: flex;
  align-items: center;
  gap: 7px;
  background: #fff1f2;
  border: 1px solid #fecdd3;
  color: #dc2626;
  padding: 9px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
}

/* Botões do Modal */
.modal-actions-row {
  display: grid;
  grid-template-columns: 1fr 1.3fr;
  gap: 12px;
  width: 100%;
  margin-top: 6px;
}

.btn-modal-cancel {
  padding: 10px 16px;
  border-radius: 10px;
  background: #f1f5f9;
  color: #475569;
  font-size: 0.85rem;
  font-weight: 600;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-modal-cancel:hover:not(:disabled) {
  background: #e2e8f0;
  color: #1e293b;
}

.btn-modal-login {
  padding: 10px 16px;
  border-radius: 10px;
  background: linear-gradient(180deg, #6366f1 0%, #4f46e5 100%);
  color: #ffffff;
  font-size: 0.85rem;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.25),
    0 4px 12px rgba(79, 70, 229, 0.3);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.btn-modal-login:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.35),
    0 6px 16px rgba(79, 70, 229, 0.4);
  filter: brightness(1.03);
}

.btn-modal-login:disabled,
.btn-modal-cancel:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spin-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.box-shake {
  animation: shake 0.45s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes shake {
  10%,
  90% {
    transform: translate3d(-2px, 0, 0);
  }
  20%,
  80% {
    transform: translate3d(3px, 0, 0);
  }
  30%,
  50%,
  70% {
    transform: translate3d(-4px, 0, 0);
  }
  40%,
  60% {
    transform: translate3d(4px, 0, 0);
  }
}

@keyframes scale-up {
  from {
    opacity: 0;
    transform: scale(0.92) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.fade-modal-enter-active,
.fade-modal-leave-active {
  transition: opacity 0.2s ease;
}

.fade-modal-enter-from,
.fade-modal-leave-to {
  opacity: 0;
}

.fade-error-enter-active,
.fade-error-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.fade-error-enter-from,
.fade-error-leave-to {
  opacity: 0;
  transform: translateY(-3px);
}
</style>
