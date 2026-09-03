/**
 * Tipos baseados em CREATE TABLE setor
 * - Campos de banco: id, empresa_id, nome, ativo, criado_em, atualizado_em
 * - Campos de UI estendidos: descricao, localizacao (preparados para futura coluna/migração)
 */

export interface Setor {
  id: number
  empresa_id: number
  nome: string
  /** UI: descrição da finalidade do setor — não persiste em DB ainda, preparado para futura coluna */
  descricao: string
  /** UI: localização física — não persiste em DB ainda, preparado para futura coluna */
  localizacao: string
  ativo: boolean
  criado_em: string
  atualizado_em: string
}

export interface CreateSetorDTO {
  nome: string
  descricao: string
  localizacao: string
  ativo: boolean
}

export interface UpdateSetorDTO {
  nome?: string
  descricao?: string
  localizacao?: string
  ativo?: boolean
}
