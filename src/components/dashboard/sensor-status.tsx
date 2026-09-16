import { Radio, WifiOff, AlertTriangle, Wrench } from 'lucide-react'
import type { SensorStatus } from '../../types/dashboard.types'
import { mockSensorStatusCounts } from '../../data/mock'

const statusConfig: Record<SensorStatus, { color: string; bgColor: string; icon: React.ReactNode }> = {
  online: {
    color: 'text-sea-green',
    bgColor: 'bg-sea-green/10',
    icon: <Radio size={18} />,
  },
  offline: {
    color: 'text-air-blue',
    bgColor: 'bg-sky-blue/10',
    icon: <WifiOff size={18} />,
  },
  alerta: {
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    icon: <AlertTriangle size={18} />,
  },
  manutencao: {
    color: 'text-slate-deep',
    bgColor: 'bg-sky-blue/20',
    icon: <Wrench size={18} />,
  },
}

export function SensorStatus() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-air-blue/20 bg-white p-5 shadow-sm">
      <h3 className="font-heading text-sm font-semibold text-jet-black">Status dos Sensores</h3>

      <div className="grid grid-cols-2 gap-3">
        {mockSensorStatusCounts.map((item) => {
          const config = statusConfig[item.status]
          return (
            <div
              key={item.status}
              className={`flex items-center gap-3 rounded-lg ${config.bgColor} p-3`}
            >
              <div className={config.color}>{config.icon}</div>
              <div>
                <p className="font-heading text-lg font-bold text-jet-black">{item.count}</p>
                <p className="font-body text-xs font-medium text-air-blue">{item.label}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
