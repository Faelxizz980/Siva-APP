import { useState } from 'react'
import type { AuthUser } from '../types'
import type { Notificacao } from '../types/Notificacao/notificacao.types'
import { mockStats } from '../data/mock'
import { Sidebar } from '../components/dashboard/sidebar'
import { DashboardHeader } from '../components/dashboard/header'
import { StatGrid } from '../components/dashboard/stat-grid'
import { ChartArea } from '../components/dashboard/chart-area'
import { SensorStatus } from '../components/dashboard/sensor-status'
import { SensorMap } from '../components/dashboard/sensor-map'
import { RecentActivities } from '../components/dashboard/recent-activities'
import { ProfileModal } from '../components/profile-modal'
import { Button } from '../components/ui/button'

interface DashboardScreenProps {
  user: AuthUser
  onLogout: () => void
  onNavigate?: (page: string) => void
  notifications?: Notificacao[]
  onMarkAsRead?: (id: string) => void
  onMarkAllAsRead?: () => void
  onNotificationAction?: (n: Notificacao) => void
  onRunJob?: () => void
}

export default function DashboardScreen({ user, onLogout, onNavigate, notifications = [], onMarkAsRead, onMarkAllAsRead, onNotificationAction, onRunJob }: DashboardScreenProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((prev) => !prev)}
        activeItem="dashboard"
        onNavigate={onNavigate}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader
          user={user}
          onMenuToggle={() => setSidebarOpen((prev) => !prev)}
          onProfileClick={() => setProfileOpen(true)}
          onLogout={onLogout}
          notifications={notifications}
          onMarkAsRead={onMarkAsRead}
          onMarkAllAsRead={onMarkAllAsRead}
          onNotificationAction={onNotificationAction}
        />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-sm text-slate-500">
                  Visão geral do sistema de monitoramento de vazão
                </p>
              </div>
              {onRunJob && (
                <Button variant="secondary" onClick={onRunJob} className="shrink-0 text-xs">
                  Rodar Job OS (hoje)
                </Button>
              )}
            </div>

            <StatGrid stats={mockStats} />

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="xl:col-span-2">
                <ChartArea />
              </div>
              <div>
                <SensorStatus />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="xl:col-span-2">
                <SensorMap />
              </div>
              <div>
                <RecentActivities />
              </div>
            </div>
          </div>
        </main>
      </div>

      <ProfileModal
        user={user}
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </div>
  )
}
