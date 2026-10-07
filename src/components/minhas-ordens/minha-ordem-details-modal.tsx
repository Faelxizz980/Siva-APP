import { useEffect, useState } from 'react'
import { AlertTriangle, Play, CheckCircle2 } from 'lucide-react'
import { Modal } from '../ui/modal'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'
import type { OrdemServico } from '../../types/OrdemServico/ordem.types'
import { formatDateTimeBR } from '../../utils/format'

interface MinhaOrdemDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  ordem: OrdemServico | null
  ativoNome: string
  setorNome: string
  equipamentoLabel: string
  procedimentoNome?: string | null
  isAtrasada: boolean
  onStart: (ordem: OrdemServico) => void
  onComplete: (ordem: OrdemServico, observacao: string) => void
}

export function MinhaOrdemDetailsModal({
  isOpen,
  onClose,
  ordem,
  ativoNome,
  setorNome,
  equipamentoLabel,
  procedimentoNome,
  isAtrasada,
  onStart,
  onComplete,
}: MinhaOrdemDetailsModalProps) {
  const [observacao, setObservacao] = useState('')
  const [observacaoError, setObservacaoError] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (isOpen) {
      setObservacao('')
      setObservacaoError(undefined)
    }
  }, [isOpen, ordem])

  if (!ordem) return null

  const canStart = ordem.status === 'agendada'
  const canComplete = ordem.status === 'em_andamento'

  const handleComplete = (): void => {
    if (!observacao.trim()) {
      setObservacaoError('Descreva o que foi executado para concluir a OS')
      return
    }
    onComplete(ordem, observacao.trim())
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="border-b border-slate-100 px-6 py-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-heading text-base font-semibold text-jet-black">OS #{ordem.id}</h2>
            <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 font-body text-xs font-medium text-slate-700">
              {ordem.status}
            </span>
          </div>
          <p className="mt-1 font-body text-sm text-slate-500">{ordem.descricao}</p>
          {isAtrasada && (
            <p className="mt-2 inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2 py-1 font-body text-xs font-medium text-red-600">
              <AlertTriangle size={12} /> Prazo vencido
            </p>
          )}
        </div>

        <div className="max-h-[60vh] space-y-3 overflow-y-auto px-6 py-5 font-body text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Ativo</span>
            <span className="text-right font-medium text-jet-black">{ativoNome}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Setor</span>
            <span className="text-right font-medium text-jet-black">{setorNome}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Equipamento</span>
            <span className="text-right font-medium text-jet-black">{equipamentoLabel}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Tipo</span>
            <span className="text-right font-medium text-jet-black">{ordem.tipo}</span>
          </div>
          {procedimentoNome && (
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Procedimento</span>
              <span className="text-right font-medium text-jet-black">{procedimentoNome}</span>
            </div>
          )}
          {ordem.solicitacao_id !== null && (
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Solicitação</span>
              <span className="text-right font-medium text-jet-black">#{ordem.solicitacao_id}</span>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Agendada para</span>
            <span className="text-right font-medium text-jet-black">{formatDateTimeBR(ordem.data_agendada)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Prazo</span>
            <span className="text-right font-medium text-jet-black">{formatDateTimeBR(ordem.data_limite)}</span>
          </div>
          {ordem.observacao_execucao && (
            <div className="rounded-lg bg-slate-50 px-3 py-2">
              <p className="text-xs text-slate-500">Observação de execução</p>
              <p className="mt-0.5 text-jet-black">{ordem.observacao_execucao}</p>
            </div>
          )}

          {canComplete && (
            <Textarea
              label="Observação da execução *"
              placeholder="Descreva o que foi executado"
              rows={3}
              value={observacao}
              onChange={(e) => {
                setObservacao(e.target.value)
                setObservacaoError(undefined)
              }}
              error={observacaoError}
              maxLength={500}
            />
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Fechar
          </Button>
          {canStart && (
            <Button type="button" variant="primary" onClick={() => onStart(ordem)}>
              <Play size={16} />
              Iniciar
            </Button>
          )}
          {canComplete && (
            <Button type="button" variant="primary" onClick={handleComplete}>
              <CheckCircle2 size={16} />
              Concluir
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}
