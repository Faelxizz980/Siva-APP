import { Calendar, Cpu, Radio, User, Clock } from 'lucide-react'
import type { SolicitacaoServico } from '../../types/Solicitacao/solicitacao.types'
import type { SensorEntity } from '../../types/Sensor/sensor.types'
import type { Esp32 } from '../../types/Esp32/esp32.types'
import { formatDateBR, formatDateTimeBR } from '../../utils/format'

const statusStyles: Record<SolicitacaoServico['status'], string> = {
  aberta: 'bg-sky-blue/10 text-slate-deep border-sky-blue/30',
  em_analise: 'bg-amber-50 text-amber-700 border-amber-200',
  aprovada: 'bg-sea-green/10 text-slate-deep border-sea-green/20',
  recusada: 'bg-red-50 text-red-700 border-red-200',
  agendada: 'bg-sea-green/15 text-slate-deep border-sea-green/30',
  concluida: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelada: 'bg-slate-50 text-slate-500 border-slate-200',
}

const tipoStyles: Record<string, string> = {
  preventiva: 'bg-violet-50 text-violet-700 border-violet-200',
  inspecao: 'bg-sky-50 text-sky-700 border-sky-200',
  corretiva: 'bg-orange-50 text-orange-700 border-orange-200',
}

interface Props {
  solicitacao: SolicitacaoServico
  sensores: SensorEntity[]
  esp32s: Esp32[]
  solicitanteNome?: string
}

export function SolicitacaoCard({ solicitacao, sensores, esp32s, solicitanteNome }: Props) {
  const equipLabel =
    solicitacao.sensor_id !== null
      ? (() => {
          const s = sensores.find((x) => x.id === solicitacao.sensor_id)
          return s ? `${s.tag} — ${s.descricao ?? s.sensor_id}` : `Sensor #${solicitacao.sensor_id}`
        })()
      : (() => {
          const e = esp32s.find((x) => x.id === solicitacao.esp32_id)
          return e ? `${e.esp_id} — ${e.descricao}` : `ESP32 #${solicitacao.esp32_id}`
        })()

  const Icon = solicitacao.sensor_id !== null ? Radio : Cpu

  return (
    <div className="rounded-xl border border-air-blue/20 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sea-green/10 text-slate-deep">
            <Icon size={16} />
          </div>
          <div>
            <p className="font-heading text-sm font-semibold text-jet-black">#{solicitacao.id} • {equipLabel}</p>
            <p className="font-body text-xs text-air-blue line-clamp-1">{solicitacao.descricao}</p>
          </div>
        </div>
        <span className={['inline-flex rounded-full border px-2 py-0.5 font-body text-xs font-medium', statusStyles[solicitacao.status]].join(' ')}>
          {solicitacao.status}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className={['inline-flex rounded-full border px-2 py-0.5 text-xs font-medium', tipoStyles[solicitacao.tipo] ?? ''].join(' ')}>
          {solicitacao.tipo}
        </span>
        {solicitacao.data_desejada && (
          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
            <Calendar size={12} /> Desejada: {formatDateBR(solicitacao.data_desejada)}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <Clock size={12} /> {formatDateTimeBR(solicitacao.data_solicitada)}
        </span>
        {solicitanteNome && (
          <span className="inline-flex items-center gap-1">
            <User size={12} /> {solicitanteNome}
          </span>
        )}
      </div>
    </div>
  )
}
