<script setup>
import { computed } from 'vue'
import { useRegistrosStore } from '../stores/registros'
import { BRAND_LOGOS_DATA } from './brandLogosData'

const props = defineProps({
  marca: {
    type: String,
    required: true
  }
})

const store = useRegistrosStore()

const marcaNormalizada = computed(() => {
  return (props.marca || '').trim().toUpperCase()
})

const logoPersonalizada = computed(() => {
  return store.logosMarcas ? store.logosMarcas[marcaNormalizada.value] : null
})

const caminhoLogo = computed(() => {
  if (logoPersonalizada.value) return logoPersonalizada.value
  return BRAND_LOGOS_DATA[marcaNormalizada.value] || null
})

const iniciais = computed(() => {
  const limpo = marcaNormalizada.value.replace(/[^A-Z0-9\s]/g, '')
  const partes = limpo.split(/\s+/).filter(Boolean)
  if (partes.length === 0) return 'MK'
  if (partes.length === 1) return partes[0].slice(0, 2)
  return (partes[0][0] + partes[1][0]).slice(0, 2)
})
</script>

<template>
  <div class="brand-logo-container" :title="marca">
    <!-- 1. Imagem Oficial/Personalizada (Nike, Fila, Umbro, Osklen em Base64 ou upload) -->
    <img 
      v-if="caminhoLogo" 
      :src="caminhoLogo" 
      :alt="marca" 
      class="brand-logo-img" 
      :class="`img-${marcaNormalizada.toLowerCase()}`"
    />

    <!-- 2. NIKE (Fallback SVG) -->
    <svg 
      v-else-if="marcaNormalizada === 'NIKE'" 
      viewBox="0 0 24 24" 
      class="brand-logo-svg logo-nike" 
      fill="currentColor"
    >
      <path d="M21.71 5.29c-2.43 1.54-5.49 4.09-8.48 7.07-2.67 2.67-4.66 5.39-5.56 6.91-.32.54-.7.91-1.18.91-.31 0-.58-.18-.75-.53-.39-.81-.13-2.16.74-3.83 1.3-2.51 3.86-5.54 7.09-7.85 1.77-1.26 3.59-2.12 5.25-2.54.74-.19 1.55-.17 2.18.14.57.29.81.82.71 1.72z"/>
    </svg>

    <!-- 3. FILA (Fallback SVG) -->
    <svg 
      v-else-if="marcaNormalizada === 'FILA'" 
      viewBox="0 0 32 24" 
      class="brand-logo-svg logo-fila"
    >
      <path d="M3 21V3h8v6h8c2.4 0 4.5 2 4.5 4.5v1c0 2.5-2.1 4.5-4.5 4.5H3z" fill="#00205B"/>
      <path d="M11 3h8c2.4 0 4.5 2 4.5 4.5v0c0 2.5-2.1 4.5-4.5 4.5h-8V3z" fill="#E21836"/>
    </svg>

    <!-- 4. UMBRO (Fallback SVG) -->
    <svg 
      v-else-if="marcaNormalizada === 'UMBRO'" 
      viewBox="0 0 44 24" 
      class="brand-logo-svg logo-umbro" 
      fill="none"
    >
      <!-- Diamante externo -->
      <polygon points="22,2 42,12 22,22 2,12" stroke="currentColor" stroke-width="2.8" stroke-linejoin="miter"/>
      <!-- Diamante interno -->
      <polygon points="22,6.5 33,12 22,17.5 11,12" fill="currentColor"/>
    </svg>

    <!-- 5. ADIDAS -->
    <svg 
      v-else-if="marcaNormalizada === 'ADIDAS'" 
      viewBox="0 0 32 24" 
      class="brand-logo-svg logo-adidas" 
      fill="currentColor"
    >
      <polygon points="3,21 8,21 14,12 9,12"/>
      <polygon points="11,21 16,21 22,7 17,7"/>
      <polygon points="19,21 24,21 30,2 25,2"/>
    </svg>

    <!-- 6. PUMA -->
    <svg 
      v-else-if="marcaNormalizada === 'PUMA'" 
      viewBox="0 0 32 24" 
      class="brand-logo-svg logo-puma" 
      fill="currentColor"
    >
      <path d="M28.4 4.1c-.8-1-2.2-1.7-3.6-1.5-.5.1-.9.3-1.3.6-.9.8-1.5 2-1.8 3.2-.2.8-.2 1.7-.1 2.5-1.2.6-2.5.9-3.8.9-1.9 0-3.7-.6-5.2-1.7-1.1-.8-2-1.9-2.7-3.1-.4-.6-.7-1.3-.9-2-.2-.6-.4-1.2-.6-1.8-.3-.8-.9-1.3-1.7-1.5-.7-.2-1.5 0-2.1.5-.6.5-1 1.2-1 2 0 1.2.5 2.4 1.3 3.3 1.2 1.3 2.7 2.3 4.4 2.8-.3.8-.5 1.7-.5 2.6 0 1.9.8 3.7 2.2 4.9 1.1.9 2.5 1.5 3.9 1.6-1.5 1.3-3.4 2.1-5.4 2.1-1.3 0-2.6-.3-3.8-1-.5-.3-1.1-.4-1.7-.2-.6.2-1.1.7-1.3 1.3-.3.8 0 1.7.6 2.2 1.9 1.5 4.3 2.3 6.7 2.3 3.5 0 6.8-1.5 9.1-4.1 1.7-1.9 2.7-4.4 2.8-7 .7-.5 1.5-1 2.2-1.6 1.4-1.1 2.5-2.6 3.1-4.2.4-1.1.5-2.2.4-3.3-.1-1.1-.6-2.2-1.4-2.9z"/>
    </svg>

    <!-- 7. OSKLEN -->
    <div v-else-if="marcaNormalizada === 'OSKLEN'" class="logo-osklen-badge">
      <span>OSK</span>
    </div>

    <!-- 8. OLYMPIKUS -->
    <svg 
      v-else-if="marcaNormalizada === 'OLYMPIKUS'" 
      viewBox="0 0 34 24" 
      class="brand-logo-svg logo-olympikus"
    >
      <circle cx="11" cy="12" r="7" fill="none" stroke="currentColor" stroke-width="2.5"/>
      <circle cx="23" cy="12" r="7" fill="none" stroke="currentColor" stroke-width="2.5"/>
    </svg>

    <!-- 9. MIZUNO -->
    <svg 
      v-else-if="marcaNormalizada === 'MIZUNO'" 
      viewBox="0 0 34 24" 
      class="brand-logo-svg logo-mizuno" 
      fill="currentColor"
    >
      <path d="M2 13c6 0 12-4 18-9 2-1.6 4-2.5 6-2.5 2 0 3.5 1 3.5 3 0 2-2 5-5 8-5 5-11 8-18 9 4-2 7-5 9-8-4 0-9 1-13.5-.5z"/>
    </svg>

    <!-- 10. ASICS -->
    <svg 
      v-else-if="marcaNormalizada === 'ASICS'" 
      viewBox="0 0 32 24" 
      class="brand-logo-svg logo-asics" 
      fill="currentColor"
    >
      <path d="M4 18c7 0 14-3 18-9 1-1.8 1.5-3.5 1.5-5 0-1.5-.7-2.5-2-2.5-3 0-6 4-9 9-4 6-9 8-13 8.5z"/>
    </svg>

    <!-- 11. CONVERSE -->
    <svg 
      v-else-if="marcaNormalizada === 'CONVERSE'" 
      viewBox="0 0 32 24" 
      class="brand-logo-svg logo-converse" 
      fill="currentColor"
    >
      <polygon points="10,4 12,9 17,9 13,12 15,17 10,14 6,17 7.5,12 4,9 8.5,9" />
      <path d="M18 5l6 7-6 7h3.5l6-7-6-7h-3.5z" />
    </svg>

    <!-- 12. VANS -->
    <div v-else-if="marcaNormalizada === 'VANS'" class="logo-vans-badge">
      <span>VANS</span>
    </div>

    <!-- 13. NEW BALANCE -->
    <div v-else-if="marcaNormalizada === 'NEW BALANCE' || marcaNormalizada === 'NB'" class="logo-nb-badge">
      <span>NB</span>
    </div>

    <!-- 14. UNDER ARMOUR -->
    <svg 
      v-else-if="marcaNormalizada === 'UNDER ARMOUR' || marcaNormalizada === 'UA'" 
      viewBox="0 0 32 24" 
      class="brand-logo-svg logo-ua" 
      fill="currentColor"
    >
      <path d="M16 4a6 6 0 0 0-6 6h3a3 3 0 0 1 6 0h3a6 6 0 0 0-6-6zm0 16a6 6 0 0 0 6-6h-3a3 3 0 0 1-6 0h-3a6 6 0 0 0 6 6z"/>
    </svg>

    <!-- 15. DASS -->
    <div v-else-if="marcaNormalizada === 'DASS'" class="logo-dass-badge">
      <span>DASS</span>
    </div>

    <!-- 16. Fallback / Marca Personalizada -->
    <div v-else class="brand-monogram-badge">
      <span>{{ iniciais }}</span>
    </div>
  </div>
</template>

<style scoped>
.brand-logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: transparent;
}

.brand-logo-img {
  max-width: 100%;
  max-height: 26px;
  width: auto;
  height: auto;
  object-fit: contain;
  display: block;
  background: transparent;
}

.img-nike {
  max-height: 20px;
}

.img-fila {
  max-height: 20px;
}

.img-umbro {
  max-height: 22px;
}

.img-osklen {
  max-height: 26px;
}

.brand-logo-svg {
  width: 26px;
  height: 18px;
  display: block;
}

/* Estilos específicos de cada logo */
.logo-nike {
  color: #0f172a;
  transform: scale(1.15);
}

.logo-fila {
  width: 24px;
  height: 18px;
}

.logo-umbro {
  color: #0284c7;
  width: 28px;
  height: 16px;
}

.logo-adidas {
  color: #0f172a;
}

.logo-puma {
  color: #0f172a;
}

.logo-olympikus {
  color: #2563eb;
}

.logo-mizuno {
  color: #1e3a8a;
}

.logo-asics {
  color: #0284c7;
}

.logo-converse {
  color: #0f172a;
}

.logo-ua {
  color: #0f172a;
}

/* Badges estilizados */
.logo-osklen-badge,
.logo-vans-badge,
.logo-nb-badge,
.logo-dass-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  border-radius: 4px;
  line-height: 1;
}

.logo-osklen-badge {
  font-size: 0.68rem;
  letter-spacing: 0.8px;
  color: #854d0e;
  border: 1px solid #fde047;
  padding: 2px 4px;
  background: #fefce8;
}

.logo-vans-badge {
  font-size: 0.65rem;
  letter-spacing: 0.5px;
  color: #ffffff;
  background: #dc2626;
  padding: 2px 4px;
}

.logo-nb-badge {
  font-size: 0.76rem;
  font-style: italic;
  font-weight: 900;
  letter-spacing: -0.5px;
  color: #dc2626;
}

.logo-dass-badge {
  font-size: 0.65rem;
  letter-spacing: 0.5px;
  color: #ffffff;
  background: #0284c7;
  padding: 2px 5px;
}

/* Monograma padrão para outras marcas */
.brand-monogram-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 20px;
  border-radius: 4px;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #334155;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.4px;
}
</style>
