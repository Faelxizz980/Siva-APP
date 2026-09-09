export type ProcedimentoCategoria = 'preventiva' | 'inspecao'

export interface Procedimento {
  id: number
  empresa_id: number
  nome: string
  supervisor_id: number
  categoria: ProcedimentoCategoria
  descricao: string | null
  ativo: boolean
  criado_em: string
  atualizado_em: string
  /** IDs das especialidades vinculadas (via procedimento_equipe) */
  especialidade_ids: number[]
}

export interface CreateProcedimentoDTO {
  nome: string
  supervisor_id: number
  categoria: ProcedimentoCategoria
  descricao?: string | null
  especialidade_ids: number[]
  ativo?: boolean
}

export interface UpdateProcedimentoDTO {
  nome?: string
  supervisor_id?: number
  categoria?: ProcedimentoCategoria
  descricao?: string | null
  especialidade_ids?: number[]
  ativo?: boolean
}
