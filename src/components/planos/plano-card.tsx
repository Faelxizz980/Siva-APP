import { Calendar, Cpu, Radio, Wrench, Clock } from 'lucide-react'
import type { PlanoManutencao } from '../../types/PlanoManutencao/plano.types'
import type { Procedimento } from '../../types/Procedimento/procedimento.types'
import { formatDateBR } from '../../utils/format'

interface Props {
  plano: PlanoManutencao
  procedimento?: Procedimento
  equipLabel: string
  onEdit: (p: PlanoManutencao) => void
  onToggle: (p: PlanoManutencao) => void
  onViewHistorico: (p: PlanoManutencao) => void
}

export function PlanoCard({ plano, procedimento, equipLabel, onEdit, onToggle, onViewHistorico }: Props) {
  const isAtrasado = plano.ativo && plano.proxima_geracao <= new Date().toISOString().slice(0, 10)
  const Icon = plano.sensor_id !== null ? Radio : Cpu

  return (
    <div className={['rounded-xl border bg-white p-4 shadow-sm hover:shadow-md transition', isAtrasado ? 'border-amber-200 bg-amber-50/20' : 'border-air-blue/20'].join(' ')}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className={['flex h-9 w-9 items-center justify-center rounded-lg', isAtrasado ? 'bg-amber-100 text-amber-700' : 'bg-sea-green/10 text-slate-deep'].join(' ')}>
            <Wrench size={16} />
          </div>
          <div>
            <p className="font-heading text-sm font-semibold text-jet-black">{procedimento?.nome ?? `Procedimento #${plano.procedimento_id}`}</p>
            <p className="flex items-center gap-1 font-body text-xs text-air-blue">
              <Icon size={12} /> {equipLabel}
            </p>
          </div>
        </div>
        <span className={['inline-flex rounded-full border px-2 py-0.5 font-body text-xs font-medium', plano.ativo ? 'bg-sea-green/10 text-slate-deep border-sea-green/20' : 'bg-slate-100 text-slate-600 border-slate-200'].join(' ')}>
          {plano.ativo ? 'Ativo' : 'Inativo'}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 font-body text-xs">
        <span className="inline-flex items-center gap-1 text-air-blue">
          <Calendar size={12} /> {plano.periodicidade}
        </span>
        <span className={['inline-flex items-center gap-1', isAtrasado ? 'font-semibold text-amber-700' : 'text-air-blue'].join(' ')}>
          <Clock size={12} /> Próx: {formatDateBR(plano.proxima_geracao)}
          {isAtrasado && ' • atrasado'}
        </span>
        <span className="text-air-blue/70">Início: {formatDateBR(plano.data_inicio)}</span>
        <span className="text-air-blue/70">Prazo: {plano.prazo_maximo_dias}d</span>
      </div>

      <div className="mt-4 flex gap-2">
        <button type="button" onClick={() => onViewHistorico(plano)} className="flex-1 cursor-pointer rounded-lg border border-air-blue/20 bg-white px-3 py-1.5 font-body text-xs font-semibold text-jet-black hover:bg-sky-blue/10">
          Histórico OS
        </button>
        <button type="button" onClick={() => onEdit(plano)} className="flex-1 cursor-pointer rounded-lg border border-air-blue/20 bg-white px-3 py-1.5 font-body text-xs font-semibold text-jet-black hover:bg-sky-blue/10">
          Editar
        </button>
        <button
          type="button"
          onClick={() => onToggle(plano)}
          className={['flex-1 cursor-pointer rounded-lg px-3 py-1.5 font-body text-xs font-semibold', plano.ativo ? 'bg-jet-black text-white hover:bg-slate-deep' : 'bg-sea-green text-jet-black hover:bg-air-blue hover:text-white'].join(' ')}
        >
          {plano.ativo ? 'Inativar' : 'Reativar'}
        </button>
      </div>
    </div>
  )
}
