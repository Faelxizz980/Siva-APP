import type { StatCardData } from '../../types/dashboard.types'
import { StatCard } from './stat-card'

interface StatGridProps {
  stats: StatCardData[]
}

export function StatGrid({ stats }: StatGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {stats.map((stat) => (
        <StatCard key={stat.id} data={stat} />
      ))}
    </div>
  )
}
