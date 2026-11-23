<script setup>
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Save, 
  CheckCircle2, 
  Calendar, 
  IdCard, 
  Tag, 
  Building2, 
  FlaskConical, 
  Scale, 
  List,
  DollarSign,
  Lock,
  AlertCircle,
  X
} from 'lucide-vue-next'
import { useRegistrosStore } from '../stores/registros'

const router = useRouter()
const store = useRegistrosStore()

// Data de hoje no formato local YYYY-MM-DD
const obterDataHoje = () => {
  const d = new Date()
  const ano = d.getFullYear()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

// Helper para verificar se o campo tem valor preenchido (para aplicar cor de preenchido)
const isCampoPreenchido = (valor) => {
  if (valor === null || valor === undefined) return false
  if (typeof valor === 'string') return valor.trim().length > 0
  return String(valor).length > 0
}

const form = ref({
  data: obterDataHoje(),
  cracha: '',
  marca: '',
  celula: '',
  produto: '',
  quantidade: ''
})

const sucesso = ref(false)

// Modal de Confirmação do Crachá (solicitado ao clicar em Salvar)
const modalCrachaAberto = ref(false)
const crachaTemp = ref('')
const erroCracha = ref('')
const inputCrachaRef = ref(null)

const fecharModalCracha = () => {
  modalCrachaAberto.value = false
  crachaTemp.value = ''
  erroCracha.value = ''
}

const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0)
}

// Objeto do produto selecionado
const produtoSelecionado = computed(() => {
  if (!form.value.produto) return null
  return store.produtos.find(p => p.nome.toLowerCase() === form.value.produto.toLowerCase()) || null
})

// Valor unitário do produto selecionado
const valorUnitario = computed(() => {
  return produtoSelecionado.value ? Number(produtoSelecionado.value.valor) : 0
})

// Custo total: Quantidade * Valor do produto
const custoTotalCalculado = computed(() => {
  const qtd = Number(form.value.quantidade || 0)
  return qtd * valorUnitario.value
})

const solicitarCracha = () => {
  if (
    !form.value.data || 
    !form.value.marca || 
    !form.value.celula || 
    !form.value.produto || 
    !form.value.quantidade
  ) {
    return
  }
  crachaTemp.value = ''
  erroCracha.value = ''
  modalCrachaAberto.value = true
  nextTick(() => {
    inputCrachaRef.value?.focus()
  })
}

const confirmarCrachaESalvar = () => {
  const crachaLimpo = (crachaTemp.value || '').trim()
  if (!crachaLimpo) {
    erroCracha.value = 'Por favor, digite ou aproxime o crachá do operador para salvar.'
    nextTick(() => inputCrachaRef.value?.focus())
    return
  }

  // Formatar data YYYY-MM-DD para DD/MM/YYYY
  const [ano, mes, dia] = form.value.data.split('-')
  const dataFormatada = `${dia}/${mes}/${ano}`
  const horaAtual = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const qtdNum = Number(form.value.quantidade)

  store.adicionarRegistro({
    tipo: 'Abastecimento',
    dataHora: `${dataFormatada} ${horaAtual}`,
    cracha: crachaLimpo,
    marca: form.value.marca,
    celula: form.value.celula.trim().toUpperCase(),
    produto: form.value.produto.trim(),
    qtd: qtdNum,
    valorUnitario: valorUnitario.value,
    valorTotal: custoTotalCalculado.value,
    nome: `Crachá ${crachaLimpo}`
  })

  sucesso.value = true

  // Ao salvar: limpa Produto Químico e Quantidade Abastecida, preservando Data, Marca e Célula
  const marcaAtual = form.value.marca
  const celulaAtual = form.value.celula
  form.value = {
    data: form.value.data || obterDataHoje(),
    cracha: '',
    marca: marcaAtual,
    celula: celulaAtual,
    produto: '',
    quantidade: ''
  }

  fecharModalCracha()

  setTimeout(() => {
    sucesso.value = false
  }, 4000)
}
</script>

<template>
  <div class="form-page">
    <div class="page-header">
      <div class="header-badge">
        <FlaskConical :size="16" />
        <span>Setor Químico • Empresa de Calçados</span>
      </div>
      <h1 class="page-title">Novo Abastecimento</h1>
      <p class="page-subtitle">Registro de abastecimento de insumos químicos para células de produção de calçados</p>
    </div>

    <!-- Mensagem de Sucesso -->
    <div v-if="sucesso" class="alert-success">
      <CheckCircle2 :size="20" />
      <div>
        <strong>Abastecimento lançado com sucesso!</strong>
        <span> Registro computado para o setor químico com marca, célula e quantidade atualizados.</span>
      </div>
    </div>

    <div class="modern-card form-container">
      <!-- Caixinha de Custo Total (Largura Menor na Parte de Cima) -->
      <div v-if="produtoSelecionado" class="cost-box-wrapper">
        <div class="cost-mini-box">
          <div class="mini-box-header">
            <div class="mini-box-icon">
              <DollarSign :size="15" />
            </div>
            <span class="mini-box-title">Custo Total do Abastecimento</span>
          </div>

          <div class="mini-box-value">
            {{ formatarMoeda(custoTotalCalculado) }}
          </div>

          <div class="mini-box-footer">
            <span class="mini-box-calc">
              {{ form.quantidade || '0' }} Kg/L × {{ formatarMoeda(valorUnitario) }}
            </span>
            <span class="mini-box-sep">•</span>
            <span class="mini-box-unit">
              Unitário: <strong>{{ formatarMoeda(valorUnitario) }}</strong>
            </span>
          </div>
        </div>
      </div>

      <form @submit.prevent="solicitarCracha" class="modern-form">
        <!-- Linha 1: Data do Abastecimento e Crachá -->
        <div class="form-grid">
          <div class="input-group">
            <label><Calendar :size="16" /> Data do Abastecimento</label>
            <input 
              type="date" 
              v-model="form.data" 
              :class="['modern-input', { 'input-filled': isCampoPreenchido(form.data) }]" 
              required 
            />
          </div>

          <div class="input-group">
            <label><IdCard :size="16" /> Crachá do Operador</label>
            <div class="cracha-lock-badge">
              <Lock :size="14" />
              <span>Solicitado ao clicar em Salvar</span>
            </div>
          </div>
        </div>

        <!-- Linha 2: Marca (Lista Suspensa) e Célula (Só o Campo) -->
        <div class="form-grid">
          <div class="input-group">
            <div class="label-with-link">
              <label><Tag :size="16" /> Marca</label>
              <router-link v-if="store.isAdmin" to="/cadastros?tipo=marcas" class="link-manage" title="Cadastrar nova marca">
                + Gerenciar
              </router-link>
            </div>
            <select 
              v-model="form.marca" 
              :class="['modern-input', { 'input-filled': isCampoPreenchido(form.marca) }]" 
              required
            >
              <option value="" disabled>Selecione a marca...</option>
              <option v-for="m in store.marcas" :key="m" :value="m">
                {{ m }}
              </option>
            </select>
          </div>

          <!-- Célula: Lista Suspensa -->
          <div class="input-group">
            <div class="label-with-link">
              <label><Building2 :size="16" /> Célula</label>
              <router-link v-if="store.isAdmin" to="/cadastros?tipo=celulas" class="link-manage" title="Cadastrar nova célula">
                + Gerenciar
              </router-link>
            </div>
            <select
              v-model="form.celula"
              :class="['modern-input', { 'input-filled': isCampoPreenchido(form.celula) }]"
              required
            >
              <option value="" disabled>Selecione a célula...</option>
              <option v-for="c in store.celulas" :key="c" :value="c">
                {{ c }}
              </option>
            </select>
          </div>
        </div>

        <!-- Linha 3: Produto (Lista Suspensa - Apenas o Nome) e Quantidade -->
        <div class="form-grid">
          <div class="input-group">
            <div class="label-with-link">
              <label><FlaskConical :size="16" /> Produto</label>
              <router-link v-if="store.isAdmin" to="/cadastros?tipo=produtos" class="link-manage" title="Cadastrar novo produto">
                + Gerenciar
              </router-link>
            </div>
            <!-- Lista suspensa com apenas o nome do produto -->
            <select 
              v-model="form.produto" 
              :class="['modern-input', { 'input-filled': isCampoPreenchido(form.produto) }]" 
              required
            >
              <option value="" disabled>Selecione o produto químico...</option>
              <option v-for="p in store.produtos" :key="p.id" :value="p.nome">
                {{ p.nome }}
              </option>
            </select>
          </div>

          <div class="input-group">
            <label><Scale :size="16" /> Quantidade</label>
            <div class="input-with-suffix">
              <input
                type="number"
                v-model="form.quantidade"
                :class="['modern-input', { 'input-filled': isCampoPreenchido(form.quantidade) }]"
                step="0.001"
                placeholder="0.000"
                min="0.001"
                required
              />
              <span class="suffix" :class="{ 'suffix-filled': isCampoPreenchido(form.quantidade) }">Kg / L</span>
            </div>
            <span class="field-hint">Informe a quantidade abastecida (em Kg ou Litros)</span>
          </div>
        </div>

        <!-- Ações -->
        <div class="form-actions">
          <button type="button" @click="router.push('/registros')" class="btn-secondary">
            <List :size="18" /> Ver Registros
          </button>
          <button type="submit" class="btn-primary">
            <Save :size="18" /> Registrar Abastecimento
          </button>
        </div>
      </form>
    </div>

    <!-- Modal Flutuante de Confirmação do Crachá do Operador -->
    <Teleport to="body">
      <Transition name="fade">
        <div 
          v-if="modalCrachaAberto" 
          class="floating-modal-backdrop cracha-modal-backdrop"
          @click.self="fecharModalCracha"
          aria-modal="true"
          role="dialog"
        >
          <div class="cracha-modal-card">
            <div class="cracha-modal-header">
              <div class="cracha-modal-icon icon-circle-abast">
                <IdCard :size="24" />
              </div>
              <div class="cracha-modal-titles">
                <h3>Identificação do Operador</h3>
                <p>Aproxime ou digite o crachá para confirmar e salvar o abastecimento</p>
              </div>
              <button type="button" @click="fecharModalCracha" class="btn-close-modal" title="Cancelar">
                <X :size="20" />
              </button>
            </div>

            <!-- Resumo da Operação -->
            <div class="cracha-resumo-box resumo-abast">
              <div class="resumo-linha">
                <span class="resumo-label">Operação:</span>
                <span class="resumo-val font-bold">Abastecimento Químico</span>
              </div>
              <div class="resumo-linha">
                <span class="resumo-label">Produto:</span>
                <span class="resumo-val font-bold">{{ form.produto }}</span>
              </div>
              <div class="resumo-linha">
                <span class="resumo-label">Quantidade:</span>
                <span class="resumo-val font-bold text-primary">{{ form.quantidade }} Kg / L</span>
              </div>
              <div class="resumo-linha">
                <span class="resumo-label">Célula / Marca:</span>
                <span class="resumo-val text-muted">{{ form.celula }} • {{ form.marca }}</span>
              </div>
            </div>

            <!-- Formulário de Leitura / Digitação do Crachá -->
            <form @submit.prevent="confirmarCrachaESalvar" class="cracha-form">
              <div class="input-group">
                <label class="label-cracha"><IdCard :size="16" /> Crachá do Operador *</label>
                <input
                  ref="inputCrachaRef"
                  type="text"
                  v-model="crachaTemp"
                  class="modern-input input-cracha-destaque"
                  :class="{ 'input-filled': isCampoPreenchido(crachaTemp) }"
                  placeholder="Digite ou aproxime o crachá..."
                  required
                  autofocus
                />
                <span class="field-hint-cracha">Pressione <strong>Enter</strong> ou clique em Confirmar para salvar</span>
              </div>

              <div v-if="erroCracha" class="alert-danger alert-cracha">
                <AlertCircle :size="16" />
                <span>{{ erroCracha }}</span>
              </div>

              <div class="cracha-modal-actions">
                <button type="button" @click="fecharModalCracha" class="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" class="btn-primary">
                  <CheckCircle2 :size="18" /> Confirmar e Salvar
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
.form-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #ede9fe;
  color: #6d28d9;
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.3px;
  margin-bottom: 8px;
  border: 1px solid #ddd6fe;
}

.form-container {
  width: 100%;
}

/* Caixinha de Custo com Largura Menor no Topo */
.cost-box-wrapper {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 22px;
}

.cost-mini-box {
  width: fit-content;
  min-width: 260px;
  max-width: 380px;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-left: 4px solid var(--primary);
  border-radius: var(--radius-md);
  padding: 12px 18px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  animation: slideDown 0.25s ease;
}

.mini-box-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mini-box-icon {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background: var(--primary-light);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.mini-box-title {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.mini-box-value {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--primary);
  letter-spacing: -0.4px;
  line-height: 1.2;
}

.mini-box-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.76rem;
  color: var(--text-muted);
  border-top: 1px solid #edf2f7;
  padding-top: 6px;
  margin-top: 2px;
}

.mini-box-calc {
  color: var(--text-light);
}

.mini-box-sep {
  color: #cbd5e1;
}

.mini-box-unit strong {
  color: var(--text-main);
}

.label-with-link {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.link-manage {
  font-size: 0.75rem;
  color: var(--primary);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;
}

.link-manage:hover {
  text-decoration: underline;
  color: var(--primary-hover);
}

.input-with-suffix {
  position: relative;
  display: flex;
  align-items: center;
}

.input-with-suffix input {
  width: 100%;
  padding-right: 65px;
}

.input-with-suffix .suffix {
  position: absolute;
  right: 14px;
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.field-hint {
  font-size: 0.75rem;
  color: var(--text-light);
  margin-top: 4px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 12px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}

/* Crachá Placeholder Bloqueado no Formulário */
.cracha-lock-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background-color: #f8fafc;
  border: 1.5px dashed #cbd5e1;
  border-radius: var(--radius-md);
  color: #64748b;
  font-size: 0.86rem;
  font-weight: 600;
  cursor: default;
  user-select: none;
}

/* Modal de Confirmação do Crachá */
.cracha-modal-backdrop {
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
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(4px);
}

.cracha-modal-card {
  background: white;
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 490px;
  padding: 28px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
  border: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cracha-modal-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  position: relative;
}

.cracha-modal-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: #eef2ff;
  color: #4f46e5;
}

.cracha-modal-titles h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-main);
  letter-spacing: -0.3px;
}

.cracha-modal-titles p {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-top: 2px;
  line-height: 1.4;
}

.btn-close-modal {
  margin-left: auto;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.2s;
}

.btn-close-modal:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.cracha-resumo-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: var(--radius-md);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cracha-resumo-box.resumo-abast {
  border-left: 4px solid #4f46e5;
  background: #f8faff;
}

.resumo-linha {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.88rem;
}

.resumo-label {
  color: var(--text-muted);
  font-weight: 500;
}

.resumo-val {
  color: var(--text-main);
}

.cracha-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.label-cracha {
  font-weight: 700 !important;
  color: var(--text-main) !important;
}

.input-cracha-destaque {
  font-size: 1.15rem !important;
  font-weight: 700 !important;
  letter-spacing: 0.8px;
  padding: 14px 18px !important;
  text-align: center;
  border-width: 2px !important;
}

.field-hint-cracha {
  display: block;
  font-size: 0.78rem;
  color: var(--text-muted);
  text-align: center;
  margin-top: 4px;
}

.alert-cracha {
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

.cracha-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}
</style>
