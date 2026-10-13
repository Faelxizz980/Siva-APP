import { apiFetch, USE_API } from './api'
import type { AuthUser } from '../types/auth/auth.types'
import type { NivelTipo } from '../types/Nivel/nivel.types'
import { mockAdminFuncionarios } from '../data/admin.mock'

export type TipoUsuarioAdmin = 'admin' | 'gestor' | 'tecnico'
export type EspecialidadeTecnico = 'MECANICO' | 'ELETRICISTA'

export interface CreateFuncionarioDTO {
  nome: string
  email: string
  senha: string
  tipo: TipoUsuarioAdmin
  empresa_id: number | null
  especialidade?: EspecialidadeTecnico
}

export interface UpdateFuncionarioDTO {
  nome?: string
  email?: string
  empresa_id?: number | null
  ativo?: boolean
}

/**
 * Funcionários/usuários — admin.
 * Backend esperado: `GET /empresas/:id/funcionarios`, `POST /usuarios`,
 * `PUT /usuarios/:id`, `PATCH /usuarios/:id/ativar|inativar`, `DELETE /usuarios/:id`.
 * Sem backend, opera em memória local (não persiste no servidor).
 */
export const usuarioService = {
  async listByEmpresa(empresaId: number): Promise<AuthUser[]> {
    if (USE_API) return apiFetch<AuthUser[]>(`/empresas/${empresaId}/funcionarios`)
    return mockAdminFuncionarios.filter((u) => u.empresa_id === empresaId)
  },
  async listAll(): Promise<AuthUser[]> {
    if (USE_API) return apiFetch<AuthUser[]>('/usuarios')
    return [...mockAdminFuncionarios]
  },
  async create(dto: CreateFuncionarioDTO): Promise<AuthUser> {
    if (USE_API) {
      return apiFetch<AuthUser>('/usuarios', { method: 'POST', body: JSON.stringify(dto) })
    }
    const nivelTipo: NivelTipo = dto.tipo === 'admin' ? 'admin' : dto.tipo
    const cargo =
      dto.tipo === 'admin' ? 'Administrador' : dto.tipo === 'gestor' ? 'Gestor' : `Técnico ${dto.especialidade === 'ELETRICISTA' ? 'Eletricista' : 'Mecânico'}`
    return {
      id: Date.now(),
      nome: dto.nome,
      email: dto.email,
      cpf: '000.000.000-00',
      empresa_id: dto.tipo === 'admin' ? null : dto.empresa_id,
      nivel: { id: Date.now(), tipo: nivelTipo, cargo },
      ativo: true,
    }
  },
  async update(id: number, dto: UpdateFuncionarioDTO): Promise<AuthUser> {
    if (USE_API) {
      return apiFetch<AuthUser>(`/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(dto) })
    }
    const found = mockAdminFuncionarios.find((u) => u.id === id)
    if (!found) throw new Error('Funcionário não encontrado')
    return { ...found, ...dto }
  },
  async setAtivo(id: number, ativo: boolean): Promise<AuthUser> {
    if (USE_API) {
      return apiFetch<AuthUser>(`/usuarios/${id}/${ativo ? 'ativar' : 'inativar'}`, { method: 'PATCH' })
    }
    const found = mockAdminFuncionarios.find((u) => u.id === id)
    if (!found) throw new Error('Funcionário não encontrado')
    return { ...found, ativo }
  },
  async remove(id: number): Promise<void> {
    if (USE_API) {
      await apiFetch<void>(`/usuarios/${id}`, { method: 'DELETE' })
      return
    }
    return
  },
}
