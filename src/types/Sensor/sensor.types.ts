export interface Sensor {
  id: number
  nome: string
  setor: string
  status: 'online' | 'offline' | 'alerta' | 'manutencao'
  ultima_leitura: string
  vazao_atual: number
  vazao_meta: number
}

export interface SensorEntity {
  id: number
  empresa_id: number
  ativo_id: number
  esp32_id: number
  sensor_id: string
  tag: string
  descricao: string | null
  ativo: boolean
  criado_em: string
  atualizado_em: string
}
