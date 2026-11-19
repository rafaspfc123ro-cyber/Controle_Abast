import { createRouter, createWebHistory } from 'vue-router'
import Inicio from '../views/Inicio.vue'
import AbastecimentoForm from '../views/AbastecimentoForm.vue'
import ResiduoForm from '../views/ResiduoForm.vue'
import Registros from '../views/Registros.vue'
import Cadastros from '../views/Cadastros.vue'
import DashboardDev from '../views/DashboardDev.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'inicio', component: Inicio },
    { path: '/abastecimento', name: 'abastecimento', component: AbastecimentoForm },
    { path: '/residuo', name: 'residuo', component: ResiduoForm },
    { path: '/registros', name: 'registros', component: Registros },
    { path: '/cadastros', name: 'cadastros', component: Cadastros },
    { path: '/dashboard', name: 'dashboard', component: DashboardDev }
  ]
})

export default router
