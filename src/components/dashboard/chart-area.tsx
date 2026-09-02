import { useState } from 'react'
import { BarChart3 } from 'lucide-react'
import type { PeriodFilter as PeriodFilterType } from '../../types/dashboard.types'
import { PeriodFilter } from './period-filter'

export function ChartArea() {
  const [period, setPeriod] = useState<PeriodFilterType>('7d')

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 size={18} className="text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-700">Consumo de Água</h3>
        </div>
        <PeriodFilter value={period} onChange={setPeriod} />
      </div>

      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50">
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <BarChart3 size={40} strokeWidth={1.5} />
          <p className="text-sm font-medium">Gráfico de consumo</p>
          <p className="text-xs">Período: {period}</p>
        </div>
      </div>
    </div>
  )
}
