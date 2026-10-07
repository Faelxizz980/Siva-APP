import { apiFetch } from './api'
import type { OrdemServico, OrdemStatus } from '../types/OrdemServico/ordem.types'

/**
 * Contrato HTTP das ordens do técnico.
 * - GET   /minhas-ordens        → só as OS atribuídas ao usuário logado
 * - GET   /ordens/:id           → detalhe
 * - PATCH /ordens/:id/status    → `{ status, observacao_execucao? }`
 */
export const ordemService = {
  listMinhas(): Promise<OrdemServico[]> {
    return apiFetch<OrdemServico[]>('/minhas-ordens')
  },

  getById(id: number): Promise<OrdemServico> {
    return apiFetch<OrdemServico>(`/ordens/${id}`)
  },

  updateStatus(id: number, status: OrdemStatus, observacao_execucao?: string): Promise<OrdemServico> {
    return apiFetch<OrdemServico>(`/ordens/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, observacao_execucao: observacao_execucao ?? null }),
    })
  },
}
