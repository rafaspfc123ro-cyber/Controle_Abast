<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { ShieldCheck, UserPlus, Trash2, AlertCircle, X } from 'lucide-vue-next'
import { useRegistrosStore } from '../stores/registros'

const store = useRegistrosStore()

const modalAddAberto = ref(false)
const inputCrachaModalRef = ref(null)

const novoAdmin = ref({
  cracha: '',
  nome: '',
})

const feedback = ref({ tipo: '', msg: '' })
const masterAdmin = computed(() => store.admins.find((a) => a.isMaster) || null)

const abrirModalAdd = () => {
  novoAdmin.value = { cracha: '', nome: '' }
  feedback.value = { tipo: '', msg: '' }
  modalAddAberto.value = true
  nextTick(() => {
    inputCrachaModalRef.value?.focus()
  })
}

const fecharModalAdd = () => {
  modalAddAberto.value = false
  novoAdmin.value = { cracha: '', nome: '' }
  feedback.value = { tipo: '', msg: '' }
}

const salvarAdmin = async () => {
  if (!novoAdmin.value.cracha.trim()) return

  const nomeDigitado = novoAdmin.value.nome.trim()
  const res = await store.adicionarAdmin({
    matricula: novoAdmin.value.cracha,
    nome: nomeDigitado,
  })

  if (res.ok) {
    fecharModalAdd()
    store.mostrarNotificacaoCentro({
      tipo: 'sucesso',
      titulo: 'Colaborador Autorizado!',
      mensagem: res.msg || 'Colaborador agora possui permissão de edição e exclusão.',
    })
  } else {
    feedback.value = { tipo: 'erro', msg: res.msg }
  }
}

const removerAcesso = (admin) => {
  if (admin.isMaster) {
    store.mostrarNotificacaoCentro({
      tipo: 'erro',
      titulo: 'Ação Não Permitida',
      mensagem: 'O usuário Master principal não pode ter sua permissão revogada.',
    })
    return
  }

  store.abrirConfirmacaoExclusao({
    titulo: 'Revogar Permissão',
    descricao: `Deseja remover as permissões de edição e exclusão de "${admin.nome}"?`,
    itemNome: `Acesso: ${admin.nome}`,
    onConfirm: async () => {
      const res = await store.removerAdmin(admin.matricula || admin.cracha)
      return {
        ok: res.ok,
        titulo: res.ok ? 'Permissão Revogada!' : 'Atenção',
        msg: res.msg,
      }
    },
  })
}

// Fechar com tecla ESC
const onKeydown = (e) => {
  if (e.key === 'Escape' && modalAddAberto.value) {
    fecharModalAdd()
  }
}

onMounted(() => {
  store.fetchAdmins()
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
  <div class="usuarios-page">
    <!-- Header Simples -->
    <div class="page-header">
      <h1 class="page-title">Gestão de Acessos</h1>
      <p class="page-subtitle">
        Controle de colaboradores autorizados a editar e excluir lançamentos no sistema.
      </p>
    </div>

    <!-- Informação do Master Simples -->
    <div v-if="masterAdmin" class="master-info-card">
      <div class="master-info-content">
        <ShieldCheck :size="18" class="master-info-icon" />
        <div>
          <span class="master-info-label">Administrador Master:</span>
          <strong class="master-info-name">{{ masterAdmin.nome }}</strong>
        </div>
      </div>
      <span class="master-info-badge">Acesso Permanente</span>
    </div>

    <!-- Card: Lista de Pessoas Autorizadas com Botão Interno -->
    <div class="autorizados-container">
      <div class="modern-card card-pessoas-autorizadas">
        <div class="card-header">
          <div>
            <div class="card-title-row">
              <h3>Pessoas Autorizadas</h3>
              <span class="count-badge">{{ store.admins.length }}</span>
            </div>
            <p>Colaboradores com permissão de edição e exclusão</p>
          </div>
          <button type="button" @click="abrirModalAdd" class="btn-primary btn-add-card">
            <UserPlus :size="15" /> Adicionar Nova Pessoa
          </button>
        </div>

        <div class="items-list-container">
          <table class="items-table">
            <thead>
              <tr>
                <th class="th-colaborador">Colaborador</th>
                <th class="th-nivel">Nível</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="adm in store.admins" :key="adm.matricula || adm.cracha">
                <td class="font-medium">
                  {{ adm.nome }}
                </td>
                <td>
                  <div class="nivel-cell-wrap">
                    <span :class="adm.isMaster ? 'badge-master' : 'badge-admin'">
                      {{ adm.isMaster ? 'Master' : 'Admin' }}
                    </span>
                    <button
                      v-if="!adm.isMaster"
                      type="button"
                      @click="removerAcesso(adm)"
                      class="btn-icon-danger"
                      title="Remover permissão deste colaborador"
                    >
                      <Trash2 :size="15" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Adicionar Nova Pessoa -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="modalAddAberto" class="user-modal-backdrop" @click.self="fecharModalAdd">
          <div class="user-modal-card">
            <div class="user-modal-header">
              <div class="user-modal-icon">
                <UserPlus :size="20" />
              </div>
              <div class="user-modal-titles">
                <h3>Adicionar Nova Pessoa</h3>
                <p>Conceder permissão para editar e excluir registros</p>
              </div>
              <button type="button" @click="fecharModalAdd" class="btn-close-modal" title="Fechar">
                <X :size="18" />
              </button>
            </div>

            <!-- Feedback de Erro -->
            <div v-if="feedback.msg && feedback.tipo === 'erro'" class="alert-danger alert-modal">
              <AlertCircle :size="16" />
              <span>{{ feedback.msg }}</span>
            </div>

            <form @submit.prevent="salvarAdmin" class="user-modal-form">
              <div class="input-group">
                <label>Número do Crachá</label>
                <input
                  ref="inputCrachaModalRef"
                  type="text"
                  v-model="novoAdmin.cracha"
                  class="modern-input"
                  placeholder="Digite o número do crachá..."
                  required
                />
              </div>

              <div class="input-group">
                <label>Nome do Colaborador (opcional se cadastrado no DASS)</label>
                <input
                  type="text"
                  v-model="novoAdmin.nome"
                  class="modern-input"
                  placeholder="Digite o nome ou deixe em branco para buscar..."
                />
              </div>

              <div class="modal-form-actions">
                <button type="button" @click="fecharModalAdd" class="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" class="btn-primary">
                  <UserPlus :size="16" /> Adicionar Pessoa
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
.usuarios-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Master Info Simples */
.master-info-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: #f8fafc;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 12px 16px;
  max-width: 640px;
}

@media (max-width: 650px) {
  .master-info-card {
    flex-direction: column;
    align-items: flex-start;
  }
}

.master-info-content {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
  color: var(--text-main);
}

.master-info-icon {
  color: var(--primary);
  flex-shrink: 0;
}

.master-info-label {
  color: var(--text-muted);
  margin-right: 6px;
}

.master-info-name {
  font-weight: 700;
  color: var(--text-main);
}

.master-info-badge {
  font-size: 0.74rem;
  font-weight: 700;
  color: #4338ca;
  background: #e0e7ff;
  border: 1px solid #c7d2fe;
  padding: 3px 9px;
  border-radius: 4px;
  white-space: nowrap;
}

/* Container do Card Pessoas Autorizadas */
.autorizados-container {
  max-width: 640px;
}

.card-pessoas-autorizadas {
  padding: 22px 24px;
}

.card-header {
  margin-bottom: 16px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.card-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-add-card {
  padding: 8px 14px;
  font-size: 0.82rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  flex-shrink: 0;
}

.card-header h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-main);
}

.card-header p {
  font-size: 0.82rem;
  color: var(--text-muted);
  margin-top: 2px;
}

.count-badge {
  background: #f1f5f9;
  color: #475569;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
}

/* Tabela */
.items-list-container {
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
  max-height: 380px;
  overflow-y: auto;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
}

.items-table th {
  background: #f8fafc;
  padding: 10px 14px;
  font-weight: 700;
  font-size: 0.75rem;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 1;
  text-align: left;
}

.th-colaborador {
  width: 62%;
  text-align: left !important;
}

.th-nivel {
  width: 38%;
  text-align: left !important;
}

.items-table td {
  padding: 11px 14px;
  border-bottom: 1px solid #f1f5f9;
  text-align: left;
}

.font-medium {
  font-weight: 600;
  color: var(--text-main);
}

.badge-master {
  display: inline-block;
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fde68a;
  padding: 2px 7px;
  border-radius: 4px;
  font-size: 0.72rem;
  font-weight: 700;
}

.badge-admin {
  display: inline-block;
  background: #f1f5f9;
  color: #334155;
  border: 1px solid #cbd5e1;
  padding: 2px 7px;
  border-radius: 4px;
  font-size: 0.72rem;
  font-weight: 600;
}

.nivel-cell-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  text-align: left;
}

/* Modal de Adicionar Pessoa */
.user-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
}

.user-modal-card {
  background: white;
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 440px;
  padding: 24px;
  box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: zoomIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.user-modal-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.user-modal-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: #f1f5f9;
  color: var(--primary);
  border: 1px solid var(--border);
}

.user-modal-titles h3 {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-main);
}

.user-modal-titles p {
  font-size: 0.82rem;
  color: var(--text-muted);
  margin-top: 2px;
}

.btn-close-modal {
  margin-left: auto;
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.btn-close-modal:hover {
  background: #f1f5f9;
  color: var(--text-main);
}

.alert-modal {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  padding: 8px 12px;
  border-radius: var(--radius-md);
}

.user-modal-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.modal-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
}

@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
