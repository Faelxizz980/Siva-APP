import { Menu, Bell, Search } from 'lucide-react'
import type { AuthUser } from '../../types'

interface DashboardHeaderProps {
  user: AuthUser
  onMenuToggle: () => void
  onProfileClick: () => void
  onLogout: () => void
}

export function DashboardHeader({ user, onMenuToggle, onProfileClick, onLogout }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuToggle}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 lg:hidden"
        >
          <Menu size={20} />
        </button>

        <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 sm:flex">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Buscar..."
            className="w-48 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 lg:w-64"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          <Bell size={20} />
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            3
          </span>
        </button>

        <div className="mx-2 hidden h-6 w-px bg-slate-200 sm:block" />

        <button
          type="button"
          onClick={onProfileClick}
          className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-50"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
            {user.nome.charAt(0).toUpperCase()}
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-sm font-medium text-slate-700">{user.nome}</p>
            <p className="text-xs text-slate-400">{user.nivel.cargo}</p>
          </div>
        </button>

        <button
          type="button"
          onClick={onLogout}
          className="ml-1 cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          Sair
        </button>
      </div>
    </header>
  )
}
