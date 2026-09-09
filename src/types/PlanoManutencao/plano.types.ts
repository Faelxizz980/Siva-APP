export type Periodicidade =
  | 'semanal'
  | 'quinzenal'
  | 'mensal'
  | 'bimestral'
  | 'trimestral'
  | 'semestral'
  | 'anual'

export type PlanoEquipamentoTipo = 'sensor' | 'esp32'

export interface PlanoManutencao {
  id: number
  empresa_id: number
  procedimento_id: number
  sensor_id: number | null
  esp32_id: number | null
  periodicidade: Periodicidade
  data_inicio: string // YYYY-MM-DD
  proxima_geracao: string // YYYY-MM-DD
  prazo_maximo_dias: number
  ativo: boolean
  criado_em: string
  atualizado_em: string
}

export interface CreatePlanoDTO {
  procedimento_id: number
  equipamentoTipo: PlanoEquipamentoTipo
  equipamentoId: number
  periodicidade: Periodicidade
  data_inicio: string
  prazo_maximo_dias: number
  ativo?: boolean
}

export interface UpdatePlanoDTO {
  periodicidade?: Periodicidade
  prazo_maximo_dias?: number
  ativo?: boolean
  proxima_geracao?: string
}
