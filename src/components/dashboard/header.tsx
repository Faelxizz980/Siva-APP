import { useState } from 'react'
import { Menu, Search, Settings } from 'lucide-react'
import type { AuthUser } from '../../types'
import type { Notificacao } from '../../types/Notificacao/notificacao.types'
import { NotificationBell, NotificationDropdown } from '../notificacoes/notification-dropdown'
import logo from '../../assets/logo.png'

interface DashboardHeaderProps {
  user: AuthUser
  onMenuToggle: () => void
  onProfileClick: () => void
  onLogout: () => void
  onNavigate?: (page: string) => void
  notifications?: Notificacao[]
  onMarkAsRead?: (id: string) => void
  onMarkAllAsRead?: () => void
  onNotificationAction?: (n: Notificacao) => void
}

export function DashboardHeader({ user, onMenuToggle, onProfileClick, onLogout, onNavigate, notifications = [], onMarkAsRead, onMarkAllAsRead, onNotificationAction }: DashboardHeaderProps) {
  const [notifOpen, setNotifOpen] = useState(false)
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-air-blue/20 bg-jet-black px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuToggle}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-sky-blue transition-colors hover:bg-slate-deep hover:text-white lg:hidden"
        >
          <Menu size={20} />
        </button>

        <img src={logo} alt="SIVA" className="h-10 w-auto max-w-[140px] object-contain hidden sm:block" />
        <img src={logo} alt="SIVA" className="h-8 w-auto object-contain sm:hidden" />

        <div className="hidden items-center gap-2 rounded-lg border border-air-blue/20 bg-white px-3 py-2 sm:flex ml-4">
          <Search size={16} className="text-air-blue" />
          <input
            type="text"
            placeholder="Buscar..."
            className="w-48 bg-transparent font-body text-sm text-jet-black outline-none placeholder:text-gray-400 lg:w-64"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <NotificationBell
            count={notifications.filter((n) => !n.lida).length}
            onClick={() => setNotifOpen((v) => !v)}
          />
          <NotificationDropdown
            notifications={notifications}
            isOpen={notifOpen}
            onClose={() => setNotifOpen(false)}
            onMarkAsRead={(id) => onMarkAsRead?.(id)}
            onMarkAllAsRead={() => onMarkAllAsRead?.()}
            onAction={(n) => {
              setNotifOpen(false)
              onNotificationAction?.(n)
            }}
          />
        </div>

        <button
          type="button"
          onClick={() => onNavigate?.('configuracoes')}
          aria-label="Configurações"
          title="Configurações"
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-sky-blue transition-colors hover:bg-slate-deep hover:text-white"
        >
          <Settings size={20} />
        </button>

        <div className="mx-2 hidden h-6 w-px bg-air-blue/20 sm:block" />

        <button
          type="button"
          onClick={onProfileClick}
          className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-deep"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sea-green font-body text-sm font-semibold text-jet-black">
            {user.nome.charAt(0).toUpperCase()}
          </div>
          <div className="hidden text-left sm:block">
            <p className="font-body text-sm font-medium text-white">{user.nome}</p>
            <p className="font-body text-xs text-sky-blue">{user.nivel.cargo}</p>
          </div>
        </button>

        <button
          type="button"
          onClick={onLogout}
          className="ml-1 cursor-pointer rounded-lg px-3 py-1.5 font-body text-sm font-medium text-sky-blue transition-colors hover:bg-slate-deep hover:text-white"
        >
          Sair
        </button>
      </div>
    </header>
  )
}
