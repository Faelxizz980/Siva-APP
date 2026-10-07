/**
 * Cliente HTTP base do SIVA. Tratamento global de auth:
 * - 401 → sessão expirada (o chamador volta ao login via `onUnauthorized`)
 * - 403 → acesso negado (o chamador exibe a tela de acesso negado)
 */
export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }

  get isUnauthorized(): boolean {
    return this.status === 401
  }

  get isForbidden(): boolean {
    return this.status === 403
  }
}

const API_BASE = ((import.meta.env.VITE_API_URL as string | undefined) ?? '').replace(/\/$/, '')

/** `true` quando há backend configurado; sem ele as telas usam mocks locais. */
export const USE_API = API_BASE.length > 0

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (res.status === 401) throw new ApiError(401, 'Sessão expirada. Entre novamente.')
  if (res.status === 403) throw new ApiError(403, 'Acesso negado para o seu perfil.')
  if (!res.ok) {
    let message = `Erro ${res.status}`
    try {
      const body = (await res.json()) as { message?: string }
      if (body.message) message = body.message
    } catch {
      // mantém a mensagem padrão
    }
    throw new ApiError(res.status, message)
  }
  return (await res.json()) as T
}
