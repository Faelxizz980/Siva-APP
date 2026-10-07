export interface Esp32 {
  id: number
  empresa_id: number
  setor_id: number
  esp_id: string
  token: string
  descricao: string | null
  ativo: boolean
  ultimo_contato: string | null
  criado_em: string
  atualizado_em: string
}

export interface CreateEsp32DTO {
  setor_id: number
  esp_id: string
  descricao?: string | null
}

export interface UpdateEsp32DTO {
  setor_id?: number
  esp_id?: string
  descricao?: string | null
  ativo?: boolean
}

/** Limite em minutos para considerar o ESP32 online a partir do ultimo_contato. */
export const ESP32_OFFLINE_THRESHOLD_MINUTES = 5

/** Item da listagem: ESP32 + nome do setor + quantidade de sensores vinculados. */
export interface Esp32ListItem extends Esp32 {
  setor_nome: string
  sensores_count: number
}
