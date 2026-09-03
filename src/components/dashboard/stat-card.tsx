import {
  Droplets,
  TrendingUp,
  Radio,
  AlertTriangle,
  Wrench,
} from 'lucide-react'
import type { StatCardData } from '../../types/dashboard.types'
import { CountUp } from '../ui/count-up'

const iconMap: Record<string, React.ReactNode> = {
  'droplets': <Droplets size={20} />,
  'trending-up': <TrendingUp size={20} />,
  'radio': <Radio size={20} />,
  'alert-triangle': <AlertTriangle size={20} />,
  'wrench': <Wrench size={20} />,
}

const trendColors: Record<string, string> = {
  up: 'text-red-600',
  down: 'text-green-600',
  neutral: 'text-slate-500',
}

interface StatCardProps {
  data: StatCardData
}

export function StatCard({ data }: StatCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{data.label}</span>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
          {iconMap[data.icon] ?? null}
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">
          <CountUp value={data.value} />
        </p>
        {data.trend && (
          <p className={`mt-1 text-xs font-medium ${trendColors[data.trendDirection ?? 'neutral']}`}>
            {data.trend}
          </p>
        )}
      </div>
    </div>
  )
}
