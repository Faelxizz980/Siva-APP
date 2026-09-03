/**
 * Tipos baseados em CREATE TABLE ativo
 */

export type AtivoCriticidade = 'baixa' | 'media' | 'alta'

export interface Ativo {
  id: number
  empresa_id: number
  setor_id: number
  nome: string
  tag: string
  tipo: string | null
  criticidade: AtivoCriticidade
  centro_custo: string | null
  foto_url: string | null
  manual_url: string | null
  descricao: string | null
  ativo: boolean
  criado_em: string
  atualizado_em: string
}

export interface CreateAtivoDTO {
  setor_id: number
  nome: string
  tag: string
  tipo?: string | null
  criticidade: AtivoCriticidade
  centro_custo?: string | null
  foto_url?: string | null
  manual_url?: string | null
  descricao?: string | null
  ativo?: boolean
}

export interface UpdateAtivoDTO {
  setor_id?: number
  nome?: string
  tag?: string
  tipo?: string | null
  criticidade?: AtivoCriticidade
  centro_custo?: string | null
  foto_url?: string | null
  manual_url?: string | null
  descricao?: string | null
  ativo?: boolean
}
