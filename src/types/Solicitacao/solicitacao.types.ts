export type SolicitacaoTipo = 'preventiva' | 'inspecao' | 'corretiva'
export type SolicitacaoStatus =
  | 'aberta'
  | 'em_analise'
  | 'aprovada'
  | 'recusada'
  | 'agendada'
  | 'concluida'
  | 'cancelada'

export type EquipamentoTipo = 'sensor' | 'esp32'

export interface SolicitacaoServico {
  id: number
  empresa_id: number
  solicitante_id: number
  sensor_id: number | null
  esp32_id: number | null
  tipo: SolicitacaoTipo
  status: SolicitacaoStatus
  descricao: string
  data_solicitada: string
  data_desejada: string | null
  atualizado_em: string
}

export interface CreateSolicitacaoDTO {
  tipo: SolicitacaoTipo
  equipamentoTipo: EquipamentoTipo
  equipamentoId: number
  descricao: string
  data_desejada?: string | null
}

export interface UpdateSolicitacaoDTO {
  status?: SolicitacaoStatus
  data_desejada?: string | null
  descricao?: string
}
