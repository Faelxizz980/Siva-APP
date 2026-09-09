import { Modal } from '../ui/modal'
import type { PlanoManutencao } from '../../types/PlanoManutencao/plano.types'
import type { OrdemServico } from '../../types/OrdemServico/ordem.types'
import type { Procedimento } from '../../types/Procedimento/procedimento.types'
import { formatDateTimeBR } from '../../utils/format'

interface Props {
  isOpen: boolean
  onClose: () => void
  plano: PlanoManutencao | null
  procedimento?: Procedimento
  ordens: OrdemServico[]
}

const statusStyle: Record<string, string> = {
  aberta: 'bg-slate-100 text-slate-700',
  agendada: 'bg-blue-50 text-blue-700',
  em_andamento: 'bg-amber-50 text-amber-700',
  concluida: 'bg-green-50 text-green-700',
  cancelada: 'bg-red-50 text-red-600',
}

export function PlanoHistoricoModal({ isOpen, onClose, plano, procedimento, ordens }: Props) {
  if (!plano) return null
  const relacionadas = ordens.filter((o) => o.plano_manutencao_id === plano.id).sort((a, b) => new Date(b.aberto_em).getTime() - new Date(a.aberto_em).getTime())

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="text-base font-semibold text-slate-900">Histórico OS — {procedimento?.nome ?? `Plano #${plano.id}`}</h2>
          <p className="mt-1 text-xs text-slate-500">Plano {plano.periodicidade} • próximo: {plano.proxima_geracao} • prazo {plano.prazo_maximo_dias}d • {relacionadas.length} OS geradas</p>
        </div>
        <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
          {relacionadas.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">Nenhuma OS gerada por este plano ainda.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {relacionadas.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">OS #{o.id} • {o.tipo}</p>
                    <p className="text-xs text-slate-500 line-clamp-1">{o.descricao}</p>
                    <p className="text-xs text-slate-400">Agendada: {formatDateTimeBR(o.data_agendada)} • Limite: {formatDateTimeBR(o.data_limite)}</p>
                  </div>
                  <span className={['inline-flex rounded-full px-2 py-0.5 text-xs font-medium', statusStyle[o.status] ?? ''].join(' ')}>{o.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex justify-end border-t border-slate-100 px-6 py-4">
          <button type="button" onClick={onClose} className="cursor-pointer rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black">
            Fechar
          </button>
        </div>
      </div>
    </Modal>
  )
}
