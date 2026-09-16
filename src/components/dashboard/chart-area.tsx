import { useState } from 'react'
import { BarChart3 } from 'lucide-react'
import type { PeriodFilter as PeriodFilterType } from '../../types/dashboard.types'
import { PeriodFilter } from './period-filter'

export function ChartArea() {
  const [period, setPeriod] = useState<PeriodFilterType>('7d')

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-air-blue/20 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 size={18} className="text-air-blue" />
          <h3 className="font-heading text-sm font-semibold text-jet-black">Consumo de Água</h3>
        </div>
        <PeriodFilter value={period} onChange={setPeriod} />
      </div>

      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-air-blue/20 bg-sky-blue/10">
        <div className="flex flex-col items-center gap-2 text-air-blue">
          <BarChart3 size={40} strokeWidth={1.5} />
          <p className="font-body text-sm font-medium">Gráfico de consumo</p>
          <p className="font-body text-xs">Período: {period}</p>
        </div>
      </div>
    </div>
  )
}
