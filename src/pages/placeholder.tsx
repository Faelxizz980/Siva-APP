import { useState } from 'react'
import { Construction } from 'lucide-react'
import type { AuthUser } from '../types'
import type { Notificacao } from '../types/Notificacao/notificacao.types'
import { DashboardHeader } from '../components/dashboard/header'
import { TopNav } from '../components/dashboard/top-nav'
import { ProfileModal } from '../components/profile-modal'

interface PlaceholderScreenProps {
  user: AuthUser
  onLogout: () => void
  onNavigate: (page: string) => void
  activeItem: string
  title?: string
  description?: string
  notifications?: Notificacao[]
  onMarkAsRead?: (id: string) => void
  onMarkAllAsRead?: () => void
  onNotificationAction?: (n: Notificacao) => void
}

const fallbackCopy: Record<string, { title: string; description: string }> = {
  preventivas: {
    title: 'Preventivas',
    description: 'Acompanhamento das manutenções preventivas. Tela em construção.',
  },
  relatorios: {
    title: 'Relatórios',
    description: 'Exportação e análise de relatórios operacionais. Tela em construção.',
  },
  configuracoes: {
    title: 'Configurações',
    description: 'Ajustes gerais do sistema. Tela em construção.',
  },
}

export default function PlaceholderScreen({
  user,
  onLogout,
  onNavigate,
  activeItem,
  title,
  description,
  notifications = [],
  onMarkAsRead,
  onMarkAllAsRead,
  onNotificationAction,
}: PlaceholderScreenProps) {
  const [navOpen, setNavOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const copy = fallbackCopy[activeItem] ?? { title: activeItem, description: 'Tela em construção.' }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <DashboardHeader
        user={user}
        onMenuToggle={() => setNavOpen((p) => !p)}
        onProfileClick={() => setProfileOpen(true)}
        onLogout={onLogout}
        onNavigate={onNavigate}
        notifications={notifications}
        onMarkAsRead={onMarkAsRead}
        onMarkAllAsRead={onMarkAllAsRead}
        onNotificationAction={onNotificationAction}
      />
      <TopNav user={user} activeItem={activeItem} onNavigate={onNavigate} isMobileOpen={navOpen} />

      <main className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div>
            <h1 className="font-heading text-xl font-bold text-jet-black">{title ?? copy.title}</h1>
            <p className="mt-1 max-w-2xl font-body text-sm text-air-blue">{description ?? copy.description}</p>
          </div>

          <div className="rounded-xl border border-dashed border-air-blue/20 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-blue/10 text-air-blue">
              <Construction size={28} />
            </div>
            <h3 className="mt-4 font-heading text-base font-semibold text-jet-black">Em breve</h3>
            <p className="mx-auto mt-1 max-w-md font-body text-sm text-air-blue">
              Esta seção ainda não foi implementada. Use o menu acima para navegar.
            </p>
          </div>
        </div>
      </main>

      <ProfileModal user={user} isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  )
}
