import type { PeriodFilter as PeriodFilterType } from '../../types/dashboard.types'

interface PeriodFilterProps {
  value: PeriodFilterType
  onChange: (period: PeriodFilterType) => void
}

const periods: { value: PeriodFilterType; label: string }[] = [
  { value: '7d', label: '7 dias' },
  { value: '15d', label: '15 dias' },
  { value: '30d', label: '30 dias' },
  { value: '90d', label: '90 dias' },
]

export function PeriodFilter({ value, onChange }: PeriodFilterProps) {
  return (
    <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
      {periods.map((period) => (
        <button
          key={period.value}
          type="button"
          onClick={() => onChange(period.value)}
          className={[
            'cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-150',
            value === period.value
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-700',
          ].join(' ')}
        >
          {period.label}
        </button>
      ))}
    </div>
  )
}
