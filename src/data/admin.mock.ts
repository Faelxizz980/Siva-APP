import type { Empresa } from '../types/Empresa/empresa.types'
import type { AuthUser } from '../types/auth/auth.types'

const now = new Date().toISOString()

export interface AdminEmpresa extends Empresa {
  status: 'ativa' | 'inativa'
  funcionarios_count: number
  sensores_count: number
}

export const mockAdminEmpresas: AdminEmpresa[] = [
  {
    id: 1,
    nome: 'Metalúrgica Prisma',
    cnpj: '12.345.678/0001-90',
    ativo: true,
    status: 'ativa',
    funcionarios_count: 4,
    sensores_count: 5,
    criado_em: now,
    atualizado_em: now,
  },
  {
    id: 2,
    nome: 'Frio Polar Alimentos',
    cnpj: '98.765.432/0001-10',
    ativo: true,
    status: 'ativa',
    funcionarios_count: 2,
    sensores_count: 3,
    criado_em: now,
    atualizado_em: now,
  },
  {
    id: 3,
    nome: 'Águas Claras Saneamento',
    cnpj: null,
    ativo: false,
    status: 'inativa',
    funcionarios_count: 0,
    sensores_count: 0,
    criado_em: now,
    atualizado_em: now,
  },
]

export const mockAdminFuncionarios: AuthUser[] = [
  { id: 2, nome: 'Carlos Gestor', email: 'gestor@siva.com', cpf: '111.111.111-11', empresa_id: 1, nivel: { id: 2, tipo: 'gestor', cargo: 'Gestor' }, ativo: true },
  { id: 3, nome: 'Ana Técnica', email: 'ana.tecnica@siva.com', cpf: '222.222.222-22', empresa_id: 1, nivel: { id: 3, tipo: 'tecnico', cargo: 'Técnica Mecânica' }, ativo: true },
  { id: 4, nome: 'Roberto Elétrica', email: 'roberto.tecnico@siva.com', cpf: '333.333.333-33', empresa_id: 1, nivel: { id: 4, tipo: 'tecnico', cargo: 'Técnico Eletricista' }, ativo: false },
  { id: 7, nome: 'Paula Gestora', email: 'paula@friopolar.com', cpf: '666.666.666-66', empresa_id: 2, nivel: { id: 2, tipo: 'gestor', cargo: 'Gestora' }, ativo: true },
]

export type EspecialidadeTecnico = 'MECANICO' | 'ELETRICISTA'

export interface AdminSensor {
  id: number
  codigo: string
  status: 'disponivel' | 'vinculado' | 'inativo'
  empresa_id: number | null
  empresa_nome: string | null
  criado_em: string
}

export const mockAdminSensores: AdminSensor[] = [
  { id: 1, codigo: 'SIVA-SENS-001', status: 'vinculado', empresa_id: 1, empresa_nome: 'Metalúrgica Prisma', criado_em: now },
  { id: 2, codigo: 'SIVA-SENS-002', status: 'vinculado', empresa_id: 1, empresa_nome: 'Metalúrgica Prisma', criado_em: now },
  { id: 3, codigo: 'SIVA-SENS-003', status: 'disponivel', empresa_id: null, empresa_nome: null, criado_em: now },
]
