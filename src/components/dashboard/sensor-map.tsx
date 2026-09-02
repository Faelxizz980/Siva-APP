import { MapPin } from 'lucide-react'

export function SensorMap() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2">
        <MapPin size={18} className="text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-700">Distribuição dos Sensores</h3>
      </div>

      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50">
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <MapPin size={40} strokeWidth={1.5} />
          <p className="text-sm font-medium">Mapa de setores</p>
          <p className="text-xs">Sensores distribuídos por área</p>
        </div>
      </div>
    </div>
  )
}
