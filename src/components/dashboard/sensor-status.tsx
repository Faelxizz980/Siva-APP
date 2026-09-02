import { Radio, WifiOff, AlertTriangle, Wrench } from 'lucide-react'
import type { SensorStatus } from '../../types/dashboard.types'
import { mockSensorStatusCounts } from '../../data/mock'

const statusConfig: Record<SensorStatus, { color: string; bgColor: string; icon: React.ReactNode }> = {
  online: {
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    icon: <Radio size={18} />,
  },
  offline: {
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
    icon: <WifiOff size={18} />,
  },
  alerta: {
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    icon: <AlertTriangle size={18} />,
  },
  manutencao: {
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    icon: <Wrench size={18} />,
  },
}

export function SensorStatus() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-slate-700">Status dos Sensores</h3>

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
                <p className="text-lg font-bold text-slate-900">{item.count}</p>
                <p className="text-xs font-medium text-slate-500">{item.label}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
