export type NotificacaoTipo = 'sucesso' | 'alerta' | 'info' | 'erro'

export interface Notificacao {
  id: string
  tipo: NotificacaoTipo
  titulo: string
  mensagem: string
  timestamp: string // ISO
  lida: boolean
  acaoLabel?: string
  acaoDestino?: string // page id para navegação
  relacionadoId?: number
  relacionadoTipo?: 'solicitacao' | 'ordem' | 'plano' | 'esp32'
}

export interface CreateNotificacaoDTO {
  tipo: NotificacaoTipo
  titulo: string
  mensagem: string
  acaoLabel?: string
  acaoDestino?: string
  relacionadoId?: number
  relacionadoTipo?: Notificacao['relacionadoTipo']
}
