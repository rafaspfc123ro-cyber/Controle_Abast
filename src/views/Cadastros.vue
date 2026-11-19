<script setup>
import { ref } from 'vue'
import { 
  Tag, 
  FlaskConical, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Database
} from 'lucide-vue-next'
import { useRegistrosStore } from '../stores/registros'

const store = useRegistrosStore()

// Estado do formulário de Marca
const novaMarca = ref('')
const feedbackMarca = ref({ tipo: '', msg: '' })

// Estado do formulário de Produto
const novoProduto = ref({
  nome: '',
  valor: ''
})
const feedbackProduto = ref({ tipo: '', msg: '' })

const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0)
}

// Cadastrar Marca
const salvarMarca = () => {
  if (!novaMarca.value.trim()) return

  const res = store.adicionarMarca(novaMarca.value)
  if (res.ok) {
    feedbackMarca.value = { tipo: 'sucesso', msg: res.msg }
    novaMarca.value = ''
  } else {
    feedbackMarca.value = { tipo: 'erro', msg: res.msg }
  }

  setTimeout(() => {
    feedbackMarca.value = { tipo: '', msg: '' }
  }, 3500)
}

const excluirMarca = (marca) => {
  if (confirm(`Deseja realmente excluir a marca "${marca}"?`)) {
    const res = store.removerMarca(marca)
    if (!res.ok) {
      alert(res.msg)
    }
  }
}

// Cadastrar Produto
const salvarProduto = () => {
  if (!novoProduto.value.nome.trim() || novoProduto.value.valor === '') return

  const res = store.adicionarProduto({
    nome: novoProduto.value.nome,
    valor: novoProduto.value.valor
  })

  if (res.ok) {
    feedbackProduto.value = { tipo: 'sucesso', msg: res.msg }
    novoProduto.value = { nome: '', valor: '' }
  } else {
    feedbackProduto.value = { tipo: 'erro', msg: res.msg }
  }

  setTimeout(() => {
    feedbackProduto.value = { tipo: '', msg: '' }
  }, 3500)
}

const excluirProduto = (id, nome) => {
  if (confirm(`Deseja realmente excluir o produto "${nome}"?`)) {
    const res = store.removerProduto(id)
    if (!res.ok) {
      alert(res.msg)
    }
  }
}

// Conta quantos abastecimentos já usaram a marca
const contarUsosMarca = (marca) => {
  return store.registros.filter(r => (r.marca || '').toUpperCase() === marca.toUpperCase()).length
}

// Conta quantos abastecimentos já usaram o produto
const contarUsosProduto = (nome) => {
  return store.registros.filter(r => (r.produto || '').toLowerCase() === nome.toLowerCase()).length
}
</script>

<template>
  <div class="cadastros-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-badge">
        <Database :size="15" />
        <span>Setor Químico • Configurações</span>
      </div>
      <h1 class="page-title">Cadastros Gerais</h1>
      <p class="page-subtitle">Cadastre novas marcas de calçados e produtos químicos com nome e valor para abastecimento</p>
    </div>

    <div class="cadastros-grid">
      <!-- Card 1: Cadastro de Marcas -->
      <div class="modern-card cadastro-card">
        <div class="card-header">
          <div class="card-icon-title">
            <div class="icon-wrap tag-glow">
              <Tag :size="20" />
            </div>
            <div>
              <h3>Marcas de Calçados</h3>
              <p>Gerencie as marcas disponíveis no formulário de abastecimento</p>
            </div>
          </div>
          <span class="count-badge">{{ store.marcas.length }} marcas</span>
        </div>

        <!-- Alerta Marca -->
        <div v-if="feedbackMarca.msg" :class="feedbackMarca.tipo === 'sucesso' ? 'alert-success' : 'alert-danger'">
          <CheckCircle2 v-if="feedbackMarca.tipo === 'sucesso'" :size="18" />
          <AlertCircle v-else :size="18" />
          <span>{{ feedbackMarca.msg }}</span>
        </div>

        <!-- Form Adicionar Marca -->
        <form @submit.prevent="salvarMarca" class="inline-add-form">
          <input
            type="text"
            v-model="novaMarca"
            class="modern-input"
            placeholder="Nome da nova marca (Ex: PUMA, VANS...)"
            required
          />
          <button type="submit" class="btn-primary">
            <Plus :size="16" /> Cadastrar Marca
          </button>
        </form>

        <!-- Lista de Marcas -->
        <div class="items-list-container">
          <table class="items-table">
            <thead>
              <tr>
                <th>Marca</th>
                <th class="text-center">Lançamentos</th>
                <th class="text-right">Ação</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in store.marcas" :key="m">
                <td>
                  <span class="brand-item-badge">{{ m }}</span>
                </td>
                <td class="text-center text-muted">
                  {{ contarUsosMarca(m) }} reg.
                </td>
                <td class="text-right">
                  <button 
                    type="button" 
                    @click="excluirMarca(m)" 
                    class="btn-icon-danger"
                    title="Excluir marca"
                  >
                    <Trash2 :size="16" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Card 2: Cadastro de Produtos Químicos com Valor -->
      <div class="modern-card cadastro-card">
        <div class="card-header">
          <div class="card-icon-title">
            <div class="icon-wrap flask-glow">
              <FlaskConical :size="20" />
            </div>
            <div>
              <h3>Produtos Químicos</h3>
              <p>Cadastre insumos com nome e valor unitário (R$)</p>
            </div>
          </div>
          <span class="count-badge">{{ store.produtos.length }} produtos</span>
        </div>

        <!-- Alerta Produto -->
        <div v-if="feedbackProduto.msg" :class="feedbackProduto.tipo === 'sucesso' ? 'alert-success' : 'alert-danger'">
          <CheckCircle2 v-if="feedbackProduto.tipo === 'sucesso'" :size="18" />
          <AlertCircle v-else :size="18" />
          <span>{{ feedbackProduto.msg }}</span>
        </div>

        <!-- Form Adicionar Produto -->
        <form @submit.prevent="salvarProduto" class="product-add-form">
          <div class="form-grid-prod">
            <div class="input-group">
              <label>Nome do Produto</label>
              <input
                type="text"
                v-model="novoProduto.nome"
                class="modern-input"
                placeholder="Ex: Adesivo Aquoso 200"
                required
              />
            </div>

            <div class="input-group">
              <label>Valor do Produto (R$)</label>
              <div class="input-with-prefix">
                <span class="prefix">R$</span>
                <input
                  type="number"
                  v-model="novoProduto.valor"
                  class="modern-input pl-currency"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
          </div>

          <button type="submit" class="btn-primary btn-add-full">
            <Plus :size="16" /> Cadastrar Produto Químico
          </button>
        </form>

        <!-- Lista de Produtos -->
        <div class="items-list-container">
          <table class="items-table">
            <thead>
              <tr>
                <th>Produto</th>
                <th class="text-right">Valor Unitário</th>
                <th class="text-right">Ação</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in store.produtos" :key="p.id">
                <td class="font-medium">
                  {{ p.nome }}
                  <span class="sub-uses">{{ contarUsosProduto(p.nome) }} abastecimentos</span>
                </td>
                <td class="text-right font-bold text-primary">
                  {{ formatarMoeda(p.valor) }}
                </td>
                <td class="text-right">
                  <button 
                    type="button" 
                    @click="excluirProduto(p.id, p.nome)" 
                    class="btn-icon-danger"
                    title="Excluir produto"
                  >
                    <Trash2 :size="16" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cadastros-page {
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

.cadastros-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(460px, 1fr));
  gap: 24px;
}

@media (max-width: 600px) {
  .cadastros-grid {
    grid-template-columns: 1fr;
  }
}

.cadastro-card {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.card-icon-title {
  display: flex;
  align-items: center;
  gap: 14px;
}

.card-icon-title h3 {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-main);
  letter-spacing: -0.3px;
}

.card-icon-title p {
  font-size: 0.82rem;
  color: var(--text-muted);
  margin-top: 2px;
}

.icon-wrap {
  width: 42px;
  height: 42px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tag-glow {
  background: #f1f5f9;
  color: #0f172a;
}

.flask-glow {
  background: #eef2ff;
  color: #4f46e5;
}

.count-badge {
  background: #f1f5f9;
  color: #475569;
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 0.78rem;
  font-weight: 700;
}

/* Formulário de Marca */
.inline-add-form {
  display: flex;
  gap: 10px;
}

.inline-add-form input {
  flex: 1;
}

/* Formulário de Produto */
.product-add-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-grid-prod {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 12px;
}

@media (max-width: 500px) {
  .form-grid-prod {
    grid-template-columns: 1fr;
  }
}

.btn-add-full {
  width: 100%;
}

.input-with-prefix {
  position: relative;
  display: flex;
  align-items: center;
}

.input-with-prefix .prefix {
  position: absolute;
  left: 14px;
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.pl-currency {
  padding-left: 42px !important;
  width: 100%;
}

/* Tabela de Itens */
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
  padding: 10px 16px;
  font-weight: 700;
  font-size: 0.75rem;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 1;
}

.items-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
}

.items-table tbody tr:hover {
  background-color: #f8fafc;
}

.brand-item-badge {
  display: inline-block;
  background: #0f172a;
  color: white;
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: 800;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
}

.sub-uses {
  display: block;
  font-size: 0.72rem;
  color: var(--text-light);
  font-weight: 400;
  margin-top: 2px;
}

.text-primary {
  color: var(--primary);
}

.text-muted {
  color: var(--text-muted);
}

.font-medium {
  font-weight: 600;
}

.font-bold {
  font-weight: 700;
}

.text-right {
  text-align: right;
}

.text-center {
  text-align: center;
}

.btn-icon-danger {
  background: transparent;
  border: none;
  color: #ef4444;
  padding: 6px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-icon-danger:hover {
  background: #fee2e2;
  transform: scale(1.1);
}

.alert-danger {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.88rem;
  font-weight: 500;
  animation: slideDown 0.3s ease;
}
</style>