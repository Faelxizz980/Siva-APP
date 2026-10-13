import { apiFetch, USE_API } from './api'
import type { Empresa, CreateEmpresaDTO, UpdateEmpresaDTO } from '../types/Empresa/empresa.types'
import { mockAdminEmpresas, type AdminEmpresa } from '../data/admin.mock'

/**
 * Empresas — consumo real via `GET /empresas`, `POST /empresas`,
 * `GET /empresas/:id`, `PUT /empresas/:id`.
 * Sem backend, opera sobre cópia local dos mocks (não persiste).
 */
export interface EmpresaListItem extends Empresa {
  status: 'ativa' | 'inativa'
  funcionarios_count: number
  sensores_count: number
}

function toListItem(e: AdminEmpresa): EmpresaListItem {
  return { ...e }
}

export const empresaService = {
  async list(): Promise<EmpresaListItem[]> {
    if (USE_API) return apiFetch<EmpresaListItem[]>('/empresas')
    return mockAdminEmpresas.map(toListItem)
  },
  async getById(id: number): Promise<EmpresaListItem> {
    if (USE_API) return apiFetch<EmpresaListItem>(`/empresas/${id}`)
    const found = mockAdminEmpresas.find((e) => e.id === id)
    if (!found) throw new Error('Empresa não encontrada')
    return toListItem(found)
  },
  async create(dto: CreateEmpresaDTO): Promise<Empresa> {
    if (USE_API) {
      return apiFetch<Empresa>('/empresas', { method: 'POST', body: JSON.stringify(dto) })
    }
    const now = new Date().toISOString()
    return {
      id: Math.max(...mockAdminEmpresas.map((e) => e.id)) + 1,
      nome: dto.nome,
      cnpj: dto.cnpj ?? null,
      ativo: true,
      criado_em: now,
      atualizado_em: now,
    }
  },
  async update(id: number, dto: UpdateEmpresaDTO): Promise<Empresa> {
    if (USE_API) {
      return apiFetch<Empresa>(`/empresas/${id}`, { method: 'PUT', body: JSON.stringify(dto) })
    }
    const found = mockAdminEmpresas.find((e) => e.id === id)
    if (!found) throw new Error('Empresa não encontrada')
    return { ...found, ...dto, atualizado_em: new Date().toISOString() }
  },
}
