<script setup>
import { ref, computed } from 'vue'
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
  DollarSign
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

const form = ref({
  data: obterDataHoje(),
  cracha: '',
  marca: store.marcas[0] || '',
  celula: '',
  produto: store.produtos[0]?.nome || '',
  quantidade: ''
})

const sucesso = ref(false)

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

const salvar = () => {
  if (
    !form.value.data || 
    !form.value.cracha || 
    !form.value.marca || 
    !form.value.celula || 
    !form.value.produto || 
    !form.value.quantidade
  ) {
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
    cracha: form.value.cracha.trim(),
    marca: form.value.marca,
    celula: form.value.celula.trim().toUpperCase(),
    produto: form.value.produto.trim(),
    qtd: qtdNum,
    valorUnitario: valorUnitario.value,
    valorTotal: custoTotalCalculado.value,
    nome: `Crachá ${form.value.cracha.trim()}`
  })

  sucesso.value = true

  // Limpa os campos preservando a data de hoje, a marca e o produto padrão
  const marcaAtual = form.value.marca
  const prodAtual = form.value.produto
  form.value = {
    data: obterDataHoje(),
    cracha: '',
    marca: marcaAtual,
    celula: '',
    produto: prodAtual,
    quantidade: ''
  }

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

      <form @submit.prevent="salvar" class="modern-form">
        <!-- Linha 1: Data do Abastecimento e Crachá -->
        <div class="form-grid">
          <div class="input-group">
            <label><Calendar :size="16" /> Data do Abastecimento</label>
            <input 
              type="date" 
              v-model="form.data" 
              class="modern-input" 
              required 
            />
          </div>

          <div class="input-group">
            <label><IdCard :size="16" /> Crachá</label>
            <input
              type="text"
              v-model="form.cracha"
              class="modern-input"
              placeholder="Digite o número do crachá (Ex: 58492)"
              required
            />
          </div>
        </div>

        <!-- Linha 2: Marca (Lista Suspensa) e Célula (Só o Campo) -->
        <div class="form-grid">
          <div class="input-group">
            <div class="label-with-link">
              <label><Tag :size="16" /> Marca</label>
              <router-link to="/cadastros" class="link-manage" title="Cadastrar nova marca">
                + Gerenciar
              </router-link>
            </div>
            <select v-model="form.marca" class="modern-input" required>
              <option value="" disabled>Selecione a marca...</option>
              <option v-for="m in store.marcas" :key="m" :value="m">
                {{ m }}
              </option>
            </select>
          </div>

          <!-- Célula: apenas o campo de texto solicitado -->
          <div class="input-group">
            <label><Building2 :size="16" /> Célula</label>
            <input
              type="text"
              v-model="form.celula"
              class="modern-input"
              placeholder="Digite a célula (Ex: Célula 04, Montagem A...)"
              required
            />
          </div>
        </div>

        <!-- Linha 3: Produto (Lista Suspensa - Apenas o Nome) e Quantidade -->
        <div class="form-grid">
          <div class="input-group">
            <div class="label-with-link">
              <label><FlaskConical :size="16" /> Produto</label>
              <router-link to="/cadastros" class="link-manage" title="Cadastrar novo produto">
                + Gerenciar
              </router-link>
            </div>
            <!-- Lista suspensa com apenas o nome do produto -->
            <select v-model="form.produto" class="modern-input" required>
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
                class="modern-input"
                step="0.001"
                placeholder="0.000"
                min="0.001"
                required
              />
              <span class="suffix">Kg / L</span>
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
</style>
