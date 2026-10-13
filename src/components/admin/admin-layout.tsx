import type { ReactNode } from 'react'
import { LayoutDashboard, Building2, Users, UserPlus, Radio, LogOut } from 'lucide-react'
import type { AuthUser } from '../../types'
import logo from '../../assets/logo.png'

interface AdminLayoutProps {
  user: AuthUser
  activeItem: string
  onNavigate: (page: string) => void
  onLogout: () => void
  title: string
  subtitle?: string
  children: ReactNode
}

const NAV = [
  { id: 'admin', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'admin-empresas', label: 'Empresas', icon: Building2 },
  { id: 'admin-usuarios', label: 'Usuários', icon: Users },
  { id: 'admin-cadastros', label: 'Cadastros', icon: UserPlus },
  { id: 'admin-sensores', label: 'Sensores', icon: Radio },
]

export function AdminLayout({ user, activeItem, onNavigate, onLogout, title, subtitle, children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 lg:flex-row">
      <aside className="flex shrink-0 flex-row items-center justify-between border-b border-air-blue/20 bg-jet-black px-4 py-3 lg:w-60 lg:flex-col lg:items-stretch lg:justify-start lg:gap-6 lg:px-4 lg:py-6">
        <div className="flex items-center gap-2">
          <img src={logo} alt="SIVA" className="h-9 w-auto object-contain" />
          <div className="hidden lg:block">
            <p className="font-heading text-sm font-bold text-white">SIVA Admin</p>
            <p className="font-body text-xs text-sky-blue">Painel administrativo</p>
          </div>
        </div>
        <nav aria-label="Administração" className="flex items-center gap-1 lg:flex-col lg:items-stretch">
          {NAV.map((item) => {
            const Icon = item.icon
            const active = activeItem === item.id || (item.id === 'admin-empresas' && activeItem === 'admin-empresa-detalhes')
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                aria-current={active ? 'page' : undefined}
                className={[
                  'inline-flex items-center gap-2 rounded-lg px-3 py-2 font-body text-sm font-medium transition-colors',
                  active ? 'bg-sea-green text-jet-black' : 'text-sky-blue hover:bg-slate-deep hover:text-white',
                ].join(' ')}
              >
                <Icon size={16} />
                <span className="hidden sm:inline lg:inline">{item.label}</span>
              </button>
            )
          })}
        </nav>
        <div className="hidden lg:mt-auto lg:block">
          <div className="rounded-lg border border-air-blue/20 bg-slate-deep p-3">
            <p className="font-body text-sm font-medium text-white">{user.nome}</p>
            <p className="font-body text-xs text-sky-blue">{user.nivel.cargo}</p>
            <button
              type="button"
              onClick={onLogout}
              className="mt-2 inline-flex items-center gap-1.5 font-body text-xs font-medium text-sky-blue hover:text-white"
            >
              <LogOut size={14} /> Sair
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sky-blue hover:text-white lg:hidden"
          aria-label="Sair"
        >
          <LogOut size={18} />
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-slate-200 bg-white px-4 py-4 lg:px-8">
          <h1 className="font-heading text-xl font-bold text-jet-black">{title}</h1>
          {subtitle && <p className="font-body mt-1 text-sm text-air-blue">{subtitle}</p>}
        </header>
        <main className="flex-1 p-4 lg:p-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
