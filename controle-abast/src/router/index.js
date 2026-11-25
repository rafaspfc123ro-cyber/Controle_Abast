import { createRouter, createWebHistory } from 'vue-router'
import Inicio from '../views/Inicio.vue'
import AbastecimentoForm from '../views/AbastecimentoForm.vue'
import ResiduoForm from '../views/ResiduoForm.vue'
import Registros from '../views/Registros.vue'
import Cadastros from '../views/Cadastros.vue'
import Dashboard from '../views/Dashboard.vue'
import Usuarios from '../views/Usuarios.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'inicio', component: Inicio },
    { path: '/abastecimento', name: 'abastecimento', component: AbastecimentoForm },
    { path: '/residuo', name: 'residuo', component: ResiduoForm },
    { path: '/registros', name: 'registros', component: Registros },
    {
      path: '/cadastros',
      name: 'cadastros',
      component: Cadastros,
      meta: { requiresAdmin: true },
    },
    { path: '/dashboard', name: 'dashboard', component: Dashboard },
    {
      path: '/usuarios',
      name: 'usuarios',
      component: Usuarios,
      meta: { requiresAdmin: true },
    },
  ],
})

// Guarda de navegação para rotas restritas aos administradores
router.beforeEach((to, _from, next) => {
  if (to.meta.requiresAdmin) {
    const adminAtivo = localStorage.getItem('controlabast_admin_ativo')
    if (!adminAtivo) {
      return next({ path: '/', query: { loginRequired: 'true' } })
    }
  }
  next()
})

export default router
