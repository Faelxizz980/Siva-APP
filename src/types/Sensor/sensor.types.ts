export interface Sensor {
  id: number
  nome: string
  setor: string
  status: 'online' | 'offline' | 'alerta' | 'manutencao'
  ultima_leitura: string
  vazao_atual: number
  vazao_meta: number
}
