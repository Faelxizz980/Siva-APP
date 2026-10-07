import { apiFetch, ApiError } from './api'
import type { CreateEsp32DTO, Esp32, Esp32ListItem, UpdateEsp32DTO } from '../types/Esp32/esp32.types'

/**
 * Contrato HTTP esperado do backend para ESP32.
 *
 * Enquanto o backend não existe, as telas operam sobre mocks em memória
 * (ver `src/data/siva-domain.mock.ts`) com esta mesma semântica — inclusive o
 * erro 409 de `esp_id` duplicado, tratado no front como
 * "Já existe um ESP32 com esse ID".
 *
 * Endpoints esperados (base configurável via `VITE_API_URL`):
 * - GET    /esp32            → lista com `setor_nome` e `sensores_count`
 * - GET    /esp32/:id        → detalhe
 * - POST   /esp32            → cria e retorna `{ esp32, token }`
 * - PUT    /esp32/:id        → atualiza (sem retornar o token)
 * - GET    /esp32/:id/token  → revela o token (requer confirmação no front)
 */

export class Esp32ApiError extends ApiError {
  get isConflict(): boolean {
    return this.status === 409
  }
}

export interface CreateEsp32Result {
  esp32: Esp32
  /** Token gerado pelo backend — exibido uma única vez após a criação. */
  token: string
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    return await apiFetch<T>(path, init)
  } catch (err) {
    if (err instanceof ApiError) throw new Esp32ApiError(err.status, err.message)
    throw err
  }
}

export const esp32Service = {
  list(): Promise<Esp32ListItem[]> {
    return request<Esp32ListItem[]>('/esp32')
  },

  getById(id: number): Promise<Esp32> {
    return request<Esp32>(`/esp32/${id}`)
  },

  create(data: CreateEsp32DTO): Promise<CreateEsp32Result> {
    return request<CreateEsp32Result>('/esp32', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update(id: number, data: UpdateEsp32DTO): Promise<Esp32> {
    return request<Esp32>(`/esp32/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  getToken(id: number): Promise<{ token: string }> {
    return request<{ token: string }>(`/esp32/${id}/token`)
  },
}
