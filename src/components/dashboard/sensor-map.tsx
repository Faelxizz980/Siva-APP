import { MapPin } from 'lucide-react'

export function SensorMap() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-air-blue/20 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <MapPin size={18} className="text-air-blue" />
        <h3 className="font-heading text-sm font-semibold text-jet-black">Distribuição dos Sensores</h3>
      </div>

      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-air-blue/20 bg-sky-blue/10">
        <div className="flex flex-col items-center gap-2 text-air-blue">
          <MapPin size={40} strokeWidth={1.5} />
          <p className="font-body text-sm font-medium">Mapa de setores</p>
          <p className="font-body text-xs">Sensores distribuídos por área</p>
        </div>
      </div>
    </div>
  )
}
