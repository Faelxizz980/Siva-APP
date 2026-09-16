import { Calendar, Cpu, Radio, User, Wrench, AlertTriangle } from 'lucide-react'
import type { OrdemServico } from '../../types/OrdemServico/ordem.types'
import type { SensorEntity } from '../../types/Sensor/sensor.types'
import type { Esp32 } from '../../types/Esp32/esp32.types'
import type { AuthUser } from '../../types'
import { formatDateTimeBR } from '../../utils/format'

const statusStyles: Record<string, string> = {
  aberta: 'bg-sky-blue/10 text-slate-deep border-sky-blue/30',
  agendada: 'bg-sea-green/10 text-slate-deep border-sea-green/20',
  em_andamento: 'bg-amber-50 text-amber-700 border-amber-200',
  concluida: 'bg-sea-green/15 text-slate-deep border-sea-green/30',
  cancelada: 'bg-red-50 text-red-600 border-red-200',
}

interface Props {
  ordem: OrdemServico
  sensores: SensorEntity[]
  esp32s: Esp32[]
  tecnicos: AuthUser[]
  conflito?: boolean
  onReagendar: (o: OrdemServico) => void
  onCancelar: (o: OrdemServico) => void
  onStatusChange: (o: OrdemServico, novo: OrdemServico['status']) => void
}

export function OrdemCard({ ordem, sensores, esp32s, tecnicos, conflito, onReagendar, onCancelar, onStatusChange }: Props) {
  const equipLabel =
    ordem.sensor_id !== null
      ? (() => {
          const s = sensores.find((x) => x.id === ordem.sensor_id)
          return s ? `${s.tag} — ${s.descricao ?? ''}` : `Sensor #${ordem.sensor_id}`
        })()
      : ordem.esp32_id !== null
        ? (() => {
            const e = esp32s.find((x) => x.id === ordem.esp32_id)
            return e ? `${e.esp_id} — ${e.descricao}` : `ESP32 #${ordem.esp32_id}`
          })()
        : '—'

  const tecnico = tecnicos.find((t) => t.id === ordem.tecnico_id)
  const Icon = ordem.sensor_id !== null ? Radio : Cpu
  const origem =
    ordem.plano_manutencao_id !== null ? `Plano #${ordem.plano_manutencao_id}` : ordem.solicitacao_id !== null ? `Solic. #${ordem.solicitacao_id}` : 'Avulsa'

  return (
    <div className={['rounded-xl border bg-white p-4 shadow-sm hover:shadow-md transition', conflito ? 'border-amber-300 bg-amber-50/30' : 'border-air-blue/20'].join(' ')}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sea-green/10 text-slate-deep">
            <Icon size={16} />
          </div>
          <div>
            <p className="font-heading text-sm font-semibold text-jet-black">
              OS #{ordem.id} • {equipLabel}
            </p>
            <p className="font-body text-xs text-air-blue">{ordem.descricao.slice(0, 60)}</p>
          </div>
        </div>
        <span className={['inline-flex rounded-full border px-2 py-0.5 font-body text-xs font-medium', statusStyles[ordem.status] ?? ''].join(' ')}>{ordem.status}</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-slate-700">
          <Wrench size={12} /> {ordem.tipo}
        </span>
        <span className="inline-flex items-center gap-1 text-slate-500">
          <Calendar size={12} /> {formatDateTimeBR(ordem.data_agendada)}
        </span>
        {ordem.data_limite && <span className="text-slate-400">limite {formatDateTimeBR(ordem.data_limite)}</span>}
      </div>

      <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
        <User size={12} /> {tecnico ? tecnico.nome : <span className="text-amber-600 font-medium">Sem técnico</span>}
        <span className="text-slate-300">•</span>
        <span>{origem}</span>
      </div>

      {conflito && (
        <div className="mt-2 flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
          <AlertTriangle size={12} /> Conflito: mesmo técnico no mesmo dia
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => onReagendar(ordem)}
          disabled={ordem.status === 'cancelada' || ordem.status === 'concluida'}
          className="cursor-pointer rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
        >
          Reagendar
        </button>
        <button
          type="button"
          onClick={() => onCancelar(ordem)}
          disabled={ordem.status === 'cancelada' || ordem.status === 'concluida'}
          className="cursor-pointer rounded-lg border border-red-200 bg-white px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-40"
        >
          Cancelar
        </button>
        {ordem.status === 'agendada' && (
          <button type="button" onClick={() => onStatusChange(ordem, 'em_andamento')} className="cursor-pointer rounded-lg bg-amber-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-amber-700">
            Iniciar
          </button>
        )}
        {ordem.status === 'em_andamento' && (
          <button type="button" onClick={() => onStatusChange(ordem, 'concluida')} className="cursor-pointer rounded-lg bg-green-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-green-700">
            Concluir
          </button>
        )}
        {ordem.status === 'aberta' && !ordem.tecnico_id && (
          <span className="inline-flex items-center rounded-lg bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">Aguardando técnico</span>
        )}
      </div>
    </div>
  )
}
