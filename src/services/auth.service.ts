import { apiFetch, USE_API } from './api'
import type { AuthUser, LoginDTO, LoginResponse } from '../types/auth/auth.types'
import { mockUsuarios } from '../data/siva-domain.mock'

/**
 * Auth preparada para o backend real.
 * Sem `VITE_API_URL`, usa mocks locais (admin/gestor/técnico).
 * Com backend, espera `POST /auth/login -> { user, token }`
 * onde `user.nivel.tipo` é `admin | gestor | tecnico`.
 */
export async function loginRequest(dto: LoginDTO): Promise<LoginResponse> {
  if (USE_API) {
    return apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(dto),
    })
  }
  const email = dto.email.trim().toLowerCase()
  const found = mockUsuarios.find((u) => u.email.toLowerCase() === email)
  // Mock local: senha única `123456` para todos os perfis.
  if (!found || dto.senha !== '123456') {
    throw new Error('Email ou senha incorretos')
  }
  const user: AuthUser = { ...found }
  return { user, token: `mock-token-${user.id}` }
}

export function storeToken(token: string): void {
  try {
    localStorage.setItem('siva_token', token)
  } catch {
    // ambiente sem storage — ignora
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem('siva_token')
  } catch {
    // ignora
  }
}
