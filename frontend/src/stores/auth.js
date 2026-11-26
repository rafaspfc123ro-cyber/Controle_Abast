// src/stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  api,
  TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY,
  clearStoredSession,
  setUnauthorizedHandler,
} from '../services/api'

function carregarUsuarioSalvo() {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY)
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(
    typeof window !== 'undefined' ? localStorage.getItem(TOKEN_STORAGE_KEY) : null,
  )
  const usuario = ref(carregarUsuarioSalvo())
  const loading = ref(false)
  const error = ref(null)
  const modalLoginAberto = ref(false)

  const isAuthenticated = computed(() => Boolean(usuario.value))
  const isAdmin = computed(() => {
    if (!isAuthenticated.value) return false
    if (
      usuario.value?.isAdmin ||
      usuario.value?.isGlobalAdmin ||
      usuario.value?.isLocalAdmin ||
      usuario.value?.isMaster
    ) {
      return true
    }
    const perfil = String(usuario.value?.perfil || usuario.value?.role || '').toLowerCase()
    return perfil === 'master' || perfil === 'admin'
  })

  const limparEstadoSessao = () => {
    token.value = null
    usuario.value = null
    error.value = null
    clearStoredSession()
  }

  setUnauthorizedHandler(() => {
    limparEstadoSessao()
  })

  const abrirModalLogin = () => {
    error.value = null
    modalLoginAberto.value = true
  }

  const fecharModalLogin = () => {
    modalLoginAberto.value = false
    error.value = null
  }

  const login = async (credenciais) => {
    loading.value = true
    error.value = null

    try {
      const payload = {
        usuario: (credenciais?.usuario || credenciais?.cracha || '').trim(),
        senha: credenciais?.senha || '',
      }

      const data = await api.post('/auth/login', payload)
      const authToken = data?.token || data?.accessToken
      const userData = data?.usuario || data?.user

      if (!authToken || !userData) {
        throw new Error('Resposta de autenticação inválida do servidor.')
      }

      token.value = authToken
      usuario.value = userData

      if (typeof window !== 'undefined') {
        localStorage.setItem(TOKEN_STORAGE_KEY, authToken)
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData))
      }

      return { ok: true, usuario: userData, token: authToken }
    } catch (err) {
      const msg = err?.message || 'Não foi possível realizar o login.'
      error.value = msg
      return { ok: false, msg }
    } finally {
      loading.value = false
    }
  }

  const verificarSessao = async () => {
    if (!token.value && !usuario.value) return { ok: false }
    try {
      const data = await api.get('/auth/me')
      if (data?.usuario) {
        usuario.value = data.usuario
        if (typeof window !== 'undefined') {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.usuario))
        }
        return { ok: true, usuario: data.usuario }
      }
      return { ok: false }
    } catch {
      limparEstadoSessao()
      return { ok: false }
    }
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout', {})
    } catch {
      // Ignora erro de rede ao limpar sessão local
    }
    limparEstadoSessao()
  }

  return {
    token,
    usuario,
    loading,
    error,
    modalLoginAberto,
    isAuthenticated,
    isAdmin,
    abrirModalLogin,
    fecharModalLogin,
    login,
    verificarSessao,
    logout,
  }
})
