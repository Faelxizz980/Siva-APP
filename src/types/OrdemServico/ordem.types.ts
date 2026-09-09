export type OrdemTipo = 'preventiva' | 'inspecao' | 'corretiva'
export type OrdemStatus = 'aberta' | 'agendada' | 'em_andamento' | 'concluida' | 'cancelada'

export interface OrdemServico {
  id: number
  solicitacao_id: number | null
  plano_manutencao_id: number | null
  empresa_id: number
  tecnico_id: number | null
  sensor_id: number | null
  esp32_id: number | null
  tipo: OrdemTipo
  status: OrdemStatus
  descricao: string
  observacao_execucao: string | null
  data_agendada: string | null
  data_limite: string | null
  aberto_em: string
  iniciado_em: string | null
  concluido_em: string | null
  atualizado_em: string
}

export interface CreateOrdemDTO {
  solicitacao_id?: number | null
  plano_manutencao_id?: number | null
  tipo: OrdemTipo
  equipamentoTipo: 'sensor' | 'esp32'
  equipamentoId: number
  tecnico_id?: number | null
  descricao: string
  data_agendada?: string | null
  data_limite?: string | null
}

export interface UpdateOrdemDTO {
  tecnico_id?: number | null
  status?: OrdemStatus
  data_agendada?: string | null
  observacao_execucao?: string | null
  iniciado_em?: string | null
  concluido_em?: string | null
}
