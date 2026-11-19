// src/stores/registros.js
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

const MARCAS_PADRAO = ['NIKE', 'FILA', 'UMBRO', 'OSKLEN']

const PRODUTOS_PADRAO = [
  { id: 1, nome: 'Adesivo PU', valor: 45.50 },
  { id: 2, nome: 'Primer EVA', valor: 32.00 },
  { id: 3, nome: 'Primer Borracha', valor: 38.00 },
  { id: 4, nome: 'Halogenante', valor: 28.50 },
  { id: 5, nome: 'Solvente Limpador', valor: 19.80 },
  { id: 6, nome: 'Catalisador / Reticulante', valor: 65.00 },
  { id: 7, nome: 'Reativador UV', valor: 42.00 }
]

const DADOS_INICIAIS = [
  { 
    id: 1, 
    tipo: 'Abastecimento', 
    dataHora: '18/11/2026 07:30', 
    cracha: '54201', 
    marca: 'NIKE', 
    celula: 'CÉLULA 04', 
    produto: 'Adesivo PU', 
    qtd: 4.500, 
    valorUnitario: 45.50,
    valorTotal: 204.75,
    nome: 'Crachá 54201' 
  },
  { 
    id: 2, 
    tipo: 'Abastecimento', 
    dataHora: '18/11/2026 08:15', 
    cracha: '39102', 
    marca: 'FILA', 
    celula: 'CÉLULA 02', 
    produto: 'Primer EVA', 
    qtd: 2.800, 
    valorUnitario: 32.00,
    valorTotal: 89.60,
    nome: 'Crachá 39102' 
  },
  { 
    id: 3, 
    tipo: 'Abastecimento', 
    dataHora: '18/11/2026 09:00', 
    cracha: '61450', 
    marca: 'UMBRO', 
    celula: 'CÉLULA 05', 
    produto: 'Solvente Limpador', 
    qtd: 3.200, 
    valorUnitario: 19.80,
    valorTotal: 63.36,
    nome: 'Crachá 61450' 
  },
  { 
    id: 4, 
    tipo: 'Abastecimento', 
    dataHora: '18/11/2026 10:10', 
    cracha: '42880', 
    marca: 'OSKLEN', 
    celula: 'CÉLULA 01', 
    produto: 'Halogenante', 
    qtd: 1.500, 
    valorUnitario: 28.50,
    valorTotal: 42.75,
    nome: 'Crachá 42880' 
  },
  { 
    id: 5, 
    tipo: 'Resíduo', 
    dataHora: '17/11/2026 16:30', 
    cracha: '12055', 
    marca: 'GERAL', 
    celula: 'DESTINAÇÃO AMBIENTAL', 
    produto: 'Borra de Cola / Solventes Residuais (Kg)', 
    qtd: 15.0, 
    valorUnitario: 0,
    valorTotal: 0, 
    nome: 'Crachá 12055' 
  }
]

export const useRegistrosStore = defineStore('registros', () => {
  // 1. Marcas cadastradas
  const marcasSalvas = localStorage.getItem('controlabast_marcas')
  const marcas = ref(marcasSalvas ? JSON.parse(marcasSalvas) : MARCAS_PADRAO)

  watch(
    marcas,
    (novas) => {
      localStorage.setItem('controlabast_marcas', JSON.stringify(novas))
    },
    { deep: true }
  )

  const adicionarMarca = (nome) => {
    const nomeLimpo = (nome || '').trim().toUpperCase()
    if (!nomeLimpo) return { ok: false, msg: 'Nome da marca não pode ser vazio.' }
    if (marcas.value.includes(nomeLimpo)) {
      return { ok: false, msg: 'Esta marca já está cadastrada.' }
    }
    marcas.value.push(nomeLimpo)
    return { ok: true, msg: 'Marca cadastrada com sucesso!' }
  }

  const removerMarca = (nome) => {
    if (marcas.value.length <= 1) {
      return { ok: false, msg: 'É necessário manter ao menos uma marca cadastrada.' }
    }
    marcas.value = marcas.value.filter(m => m !== nome)
    return { ok: true, msg: 'Marca removida com sucesso.' }
  }

  // 2. Produtos cadastrados (com nome e valor)
  const produtosSalvos = localStorage.getItem('controlabast_produtos')
  const produtos = ref(produtosSalvos ? JSON.parse(produtosSalvos) : PRODUTOS_PADRAO)

  watch(
    produtos,
    (novos) => {
      localStorage.setItem('controlabast_produtos', JSON.stringify(novos))
    },
    { deep: true }
  )

  const adicionarProduto = ({ nome, valor }) => {
    const nomeLimpo = (nome || '').trim()
    const valorNum = Number(valor)

    if (!nomeLimpo) return { ok: false, msg: 'Nome do produto é obrigatório.' }
    if (isNaN(valorNum) || valorNum < 0) return { ok: false, msg: 'Informe um valor válido maior ou igual a zero.' }

    const jaExiste = produtos.value.some(p => p.nome.toLowerCase() === nomeLimpo.toLowerCase())
    if (jaExiste) {
      return { ok: false, msg: 'Já existe um produto com este nome.' }
    }

    produtos.value.push({
      id: Date.now(),
      nome: nomeLimpo,
      valor: valorNum
    })

    return { ok: true, msg: 'Produto cadastrado com sucesso!' }
  }

  const removerProduto = (id) => {
    if (produtos.value.length <= 1) {
      return { ok: false, msg: 'É necessário manter ao menos um produto cadastrado.' }
    }
    produtos.value = produtos.value.filter(p => p.id !== id)
    return { ok: true, msg: 'Produto removido com sucesso.' }
  }

  // 3. Registros de abastecimento e resíduo
  const dadosSalvos = localStorage.getItem('controlabast_registros_v2') || localStorage.getItem('controlabast_registros')
  let dadosIniciais = DADOS_INICIAIS

  if (dadosSalvos) {
    try {
      const parsed = JSON.parse(dadosSalvos)
      if (Array.isArray(parsed) && parsed.length > 0) {
        dadosIniciais = parsed.map(item => ({
          ...item,
          marca: item.marca || 'NIKE',
          cracha: item.cracha || (item.nome && item.nome.includes('Crachá') ? item.nome.replace('Crachá', '').trim() : item.nome || '—')
        }))
      }
    } catch {
      dadosIniciais = DADOS_INICIAIS
    }
  }

  const registros = ref(dadosIniciais)

  watch(
    registros,
    (novos) => {
      localStorage.setItem('controlabast_registros_v2', JSON.stringify(novos))
      localStorage.setItem('controlabast_registros', JSON.stringify(novos))
    },
    { deep: true }
  )

  const adicionarRegistro = (registro) => {
    registros.value.unshift({
      id: Date.now(),
      ...registro
    })
  }

  const removerRegistro = (id) => {
    registros.value = registros.value.filter(reg => reg.id !== id)
  }

  // Getters para totais
  const totalAbastecido = computed(() => {
    return registros.value
      .filter(r => r.tipo === 'Abastecimento')
      .reduce((acc, curr) => acc + Number(curr.qtd || 0), 0)
  })

  const totalResiduos = computed(() => {
    return registros.value
      .filter(r => r.tipo === 'Resíduo')
      .reduce((acc, curr) => acc + Number(curr.qtd || 0), 0)
  })

  const totaisPorMarca = computed(() => {
    const mapa = {}
    marcas.value.forEach(m => {
      mapa[m] = 0
    })
    registros.value
      .filter(r => r.tipo === 'Abastecimento')
      .forEach(r => {
        const m = (r.marca || '').toUpperCase()
        if (mapa[m] !== undefined) {
          mapa[m] += Number(r.qtd || 0)
        } else {
          mapa[m] = Number(r.qtd || 0)
        }
      })
    return mapa
  })

  const custosTotais = computed(() => {
    return registros.value.reduce((acc, curr) => acc + Number(curr.valorTotal || 0), 0)
  })

  return { 
    marcas,
    adicionarMarca,
    removerMarca,
    produtos,
    adicionarProduto,
    removerProduto,
    registros, 
    adicionarRegistro, 
    removerRegistro, 
    totalAbastecido, 
    totalResiduos, 
    totaisPorMarca,
    custosTotais 
  }
})
