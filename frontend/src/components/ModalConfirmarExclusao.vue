<script setup>
import { Trash2, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-vue-next'
import { useRegistrosStore } from '../stores/registros'

const store = useRegistrosStore()

const cancelar = () => {
  if (store.loading) return
  store.fecharModalExclusao()
}

const confirmar = async () => {
  await store.validarEExecutarExclusao()
}

// Fechar com tecla ESC
const onKeydown = (e) => {
  if (e.key === 'Escape' && store.modalExclusao.aberto) {
    cancelar()
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', onKeydown)
}
</script>

<template>
  <Teleport to="body">
    <!-- 1. MODAL CENTRAL DE CONFIRMAÇÃO DIRETA (SEM SENHA) -->
    <Transition name="fade-modal">
      <div v-if="store.modalExclusao.aberto" class="central-modal-backdrop" @click.self="cancelar">
        <div class="central-modal-box" role="dialog" aria-modal="true">
          <!-- Botão Fechar no Canto -->
          <button type="button" @click="cancelar" class="modal-close-btn" title="Fechar">
            <X :size="18" />
          </button>

          <!-- Ícone de Alerta Central -->
          <div class="modal-icon-danger-wrap">
            <Trash2 :size="28" />
          </div>

          <!-- Título e Descrição -->
          <h2 class="modal-title">{{ store.modalExclusao.titulo }}</h2>
          <p class="modal-desc">{{ store.modalExclusao.descricao }}</p>

          <!-- Tag do Item sendo excluído (se houver) -->
          <div v-if="store.modalExclusao.itemNome" class="item-highlight-card">
            <span class="item-highlight-label">Item a ser excluído:</span>
            <div class="item-highlight-name">
              <Trash2 :size="15" />
              <span>{{ store.modalExclusao.itemNome }}</span>
            </div>
          </div>

          <!-- Alerta de Ação Irreversível -->
          <div class="irreversible-warning">
            <AlertCircle :size="15" />
            <span>Esta ação é definitiva e não poderá ser desfeita.</span>
          </div>

          <!-- Botões de Ação Diretos (Sem Senha) -->
          <div class="modal-actions-row">
            <button
              type="button"
              @click="cancelar"
              class="btn-modal-cancel"
              :disabled="store.loading"
            >
              Cancelar
            </button>

            <button
              type="button"
              @click="confirmar"
              class="btn-modal-delete"
              :disabled="store.loading"
              autofocus
            >
              <Loader2 v-if="store.loading" :size="16" class="spin-icon" />
              <Trash2 v-else :size="16" />
              <span>{{ store.loading ? 'Excluindo...' : 'Confirmar Exclusão' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 2. NOTIFICAÇÃO NO MEIO DA TELA (FEEDBACK CENTRAL) -->
    <Transition name="bounce-notification">
      <div
        v-if="store.notificacaoCentro.aberto"
        class="center-notification-backdrop"
        @click="store.fecharNotificacaoCentro"
      >
        <div
          class="center-notification-card"
          :class="`notif-${store.notificacaoCentro.tipo}`"
          @click.stop
        >
          <div class="notif-icon-circle">
            <CheckCircle2 v-if="store.notificacaoCentro.tipo === 'sucesso'" :size="36" />
            <AlertCircle v-else :size="36" />
          </div>

          <h3 class="notif-title">{{ store.notificacaoCentro.titulo }}</h3>
          <p class="notif-message">{{ store.notificacaoCentro.mensagem }}</p>

          <button type="button" @click="store.fecharNotificacaoCentro" class="notif-btn-dismiss">
            OK
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ====================================================
   1. MODAL CENTRAL DE EXCLUSÃO COM SENHA
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

.modal-close-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.modal-icon-danger-wrap {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #fee2e2;
  color: #dc2626;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  box-shadow: 0 0 0 8px #fef2f2;
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
  margin-bottom: 16px;
  line-height: 1.45;
}

/* Item a ser excluído */
.item-highlight-card {
  width: 100%;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 10px 14px;
  margin-bottom: 14px;
  text-align: left;
}

.item-highlight-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  display: block;
  margin-bottom: 3px;
}

.item-highlight-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.88rem;
  font-weight: 600;
  color: #1e293b;
  word-break: break-word;
}

.item-highlight-name svg {
  color: #dc2626;
  flex-shrink: 0;
}

.irreversible-warning {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fff1f2;
  border: 1px solid #fecdd3;
  color: #e11d48;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 600;
  width: 100%;
  margin-bottom: 18px;
  text-align: left;
}

/* Formulário de Senha */
.password-form-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: left;
}

.password-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #334155;
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
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.18);
}

.input-has-error .password-field {
  border-color: #dc2626 !important;
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

.password-error-alert {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #dc2626;
  font-size: 0.78rem;
  font-weight: 600;
  margin-top: 2px;
}

.password-tip {
  font-size: 0.74rem;
  color: #94a3b8;
  margin-top: 2px;
  margin-bottom: 12px;
}

.password-tip strong {
  color: #475569;
}

/* Botões do Modal */
.modal-actions-row {
  display: grid;
  grid-template-columns: 1fr 1.3fr;
  gap: 12px;
  width: 100%;
  margin-top: 4px;
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

.btn-modal-cancel:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.btn-modal-delete {
  padding: 10px 16px;
  border-radius: 10px;
  background: linear-gradient(180deg, #ef4444 0%, #dc2626 100%);
  color: #ffffff;
  font-size: 0.85rem;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.25),
    0 4px 12px rgba(220, 38, 38, 0.3);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.btn-modal-delete:hover {
  transform: translateY(-1px);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.35),
    0 6px 16px rgba(220, 38, 38, 0.4);
  filter: brightness(1.03);
}

.btn-modal-delete:active {
  transform: translateY(0) scale(0.98);
}

.btn-modal-delete:disabled,
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

/* Animação de Shake para erro de senha */
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

/* ====================================================
   2. NOTIFICAÇÃO NO MEIO DA TELA
   ==================================================== */
.center-notification-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100005;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.center-notification-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 30px 32px 24px 32px;
  max-width: 380px;
  width: 100%;
  box-shadow:
    0 25px 50px -10px rgba(15, 23, 42, 0.35),
    0 0 0 1px rgba(226, 232, 240, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.notif-sucesso .notif-icon-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #ecfdf5;
  color: #10b981;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  box-shadow: 0 0 0 8px #f0fdf4;
}

.notif-erro .notif-icon-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #fef2f2;
  color: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  box-shadow: 0 0 0 8px #fff1f2;
}

.notif-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 6px;
  letter-spacing: -0.01em;
}

.notif-message {
  font-size: 0.88rem;
  color: #64748b;
  margin-bottom: 20px;
  line-height: 1.45;
}

.notif-btn-dismiss {
  width: 100%;
  padding: 9.5px 16px;
  border-radius: 10px;
  background: #0f172a;
  color: #ffffff;
  font-size: 0.85rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.notif-btn-dismiss:hover {
  background: #1e293b;
  transform: translateY(-1px);
}

/* Transições */
.fade-modal-enter-active,
.fade-modal-leave-active {
  transition: opacity 0.2s ease;
}

.fade-modal-enter-from,
.fade-modal-leave-to {
  opacity: 0;
}

.bounce-notification-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.bounce-notification-leave-active {
  transition: all 0.2s ease;
}
.bounce-notification-enter-from {
  opacity: 0;
  transform: scale(0.85);
}
.bounce-notification-leave-to {
  opacity: 0;
  transform: scale(0.95);
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
