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
  descricao?: string | null
  ativo?: boolean
}
