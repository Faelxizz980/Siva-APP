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
  tag: string | null
  descricao: string | null
  ativo: boolean
  criado_em: string
  atualizado_em: string
}

/** Limite em minutos para considerar o ESP32 online a partir do ultimo_contato. */
export const SENSOR_OFFLINE_THRESHOLD_MINUTES = 5

export interface CreateSensorDTO {
  ativo_id: number
  esp32_id: number
  sensor_id: string
  tag: string | null
  descricao?: string | null
  ativo_status?: boolean
}

export interface UpdateSensorDTO {
  ativo_id?: number
  esp32_id?: number
  sensor_id?: string
  tag?: string | null
  descricao?: string | null
  ativo_status?: boolean
}
