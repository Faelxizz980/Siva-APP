import { AlertTriangle, Wrench, Activity, Server } from 'lucide-react'
import type { Activity as ActivityType } from '../../types/dashboard.types'
import { mockActivities } from '../../data/mock'
import { AnimatedList } from '../ui/animated-list'

const activityConfig: Record<string, { icon: React.ReactNode; color: string; bgColor: string }> = {
  alerta: {
    icon: <AlertTriangle size={14} />,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
  },
  manutencao: {
    icon: <Wrench size={14} />,
    color: 'text-slate-deep',
    bgColor: 'bg-sky-blue/20',
  },
  leitura: {
    icon: <Activity size={14} />,
    color: 'text-sea-green',
    bgColor: 'bg-sea-green/10',
  },
  sistema: {
    icon: <Server size={14} />,
    color: 'text-air-blue',
    bgColor: 'bg-sky-blue/10',
  },
}

function ActivityRow({ activity }: { activity: ActivityType }) {
  const config = activityConfig[activity.tipo] ?? activityConfig.sistema

  return (
    <div className="flex items-start gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0">
      <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${config.bgColor} ${config.color}`}>
        {config.icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-slate-700">{activity.descricao}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span>{activity.timestamp}</span>
          {activity.sensor && (
            <>
              <span className="text-slate-300">·</span>
              <span className="font-medium text-slate-500">{activity.sensor}</span>
            </>
          )}
          {activity.setor && (
            <>
              <span className="text-slate-300">·</span>
              <span>{activity.setor}</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export function RecentActivities() {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-air-blue/20 bg-white shadow-sm">
      <div className="px-5 pt-5 pb-2">
        <h3 className="font-heading text-sm font-semibold text-jet-black">Atividades Recentes</h3>
      </div>
      <div className="max-h-80 overflow-y-auto">
        <AnimatedList>
          {mockActivities.map((activity) => (
            <ActivityRow key={activity.id} activity={activity} />
          ))}
        </AnimatedList>
      </div>
    </div>
  )
}
