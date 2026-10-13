import { apiFetch, USE_API } from './api'
import { mockAdminSensores, type AdminSensor } from '../data/admin.mock'

/**
 * Sensores (visão ADMIN: cadastro gera código de uso entregue à empresa).
 * Backend esperado: `GET /admin/sensores`, `POST /admin/sensores`,
 * `GET /admin/sensores/:id`. Sem backend, usa mocks locais.
 */
export const adminSensorService = {
  async list(): Promise<AdminSensor[]> {
    if (USE_API) return apiFetch<AdminSensor[]>('/admin/sensores')
    return [...mockAdminSensores]
  },
  async create(input: { descricao?: string }): Promise<AdminSensor> {
    if (USE_API) {
      return apiFetch<AdminSensor>('/admin/sensores', { method: 'POST', body: JSON.stringify(input) })
    }
    const codigo = `SIVA-SENS-${String(mockAdminSensores.length + 1).padStart(3, '0')}${Math.floor(Math.random() * 90 + 10)}`
    return {
      id: Date.now(),
      codigo,
      status: 'disponivel',
      empresa_id: null,
      empresa_nome: null,
      criado_em: new Date().toISOString(),
    }
  },
}
