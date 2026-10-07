import { apiFetch } from './api'
import type { CreateSolicitacaoDTO, SolicitacaoServico } from '../types/Solicitacao/solicitacao.types'

/**
 * Contrato HTTP das solicitações.
 * - GET  /solicitacoes → o backend filtra pelo usuário logado quando técnico
 * - POST /solicitacoes → cria (solicitante = usuário logado)
 */
export const solicitacaoService = {
  list(): Promise<SolicitacaoServico[]> {
    return apiFetch<SolicitacaoServico[]>('/solicitacoes')
  },

  create(data: CreateSolicitacaoDTO): Promise<SolicitacaoServico> {
    return apiFetch<SolicitacaoServico>('/solicitacoes', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
}
