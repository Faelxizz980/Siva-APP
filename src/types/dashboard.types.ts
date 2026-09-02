export type SensorStatus = 'online' | 'offline' | 'alerta' | 'manutencao'

export interface Sensor {
  id: number
  nome: string
  setor: string
  status: SensorStatus
  ultima_leitura: string
  vazao_atual: number
  vazao_meta: number
}

export interface StatCardData {
  id: string
  label: string
  value: string
  trend?: string
  trendDirection?: 'up' | 'down' | 'neutral'
  icon: string
}

export interface Activity {
  id: number
  tipo: 'alerta' | 'manutencao' | 'leitura' | 'sistema'
  descricao: string
  timestamp: string
  sensor?: string
  setor?: string
}

export interface SensorStatusCount {
  status: SensorStatus
  count: number
  label: string
}

export type PeriodFilter = '7d' | '15d' | '30d' | '90d'

export interface NavigationItem {
  id: string
  label: string
  icon: string
  active?: boolean
}
