import {
  LayoutDashboard,
  Building2,
  Cog,
  Radio,
  Wrench,
  ShieldCheck,
  FileText,
  ClipboardList,
  CalendarDays,
  ScrollText,
} from 'lucide-react'
import type { ReactNode } from 'react'

interface TopNavProps {
  activeItem?: string
  onNavigate?: (itemId: string) => void
  isMobileOpen?: boolean
}

interface NavItem {
  id: string
  label: string
  icon: ReactNode
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
  { id: 'setores', label: 'Setores', icon: <Building2 size={16} /> },
  { id: 'ativos', label: 'Ativos', icon: <Cog size={16} /> },
  { id: 'solicitacoes', label: 'Solicitações', icon: <ClipboardList size={16} /> },
  { id: 'ordens', label: 'Ordens', icon: <Wrench size={16} /> },
  { id: 'procedimentos', label: 'Procedimentos', icon: <ScrollText size={16} /> },
  { id: 'planos', label: 'Planos', icon: <CalendarDays size={16} /> },
  { id: 'sensores', label: 'Sensores', icon: <Radio size={16} /> },
  { id: 'preventivas', label: 'Preventivas', icon: <ShieldCheck size={16} /> },
  { id: 'relatorios', label: 'Relatórios', icon: <FileText size={16} /> },
]

export function TopNav({ activeItem = 'dashboard', onNavigate, isMobileOpen = false }: TopNavProps) {
  return (
    <nav
      className={[
        'w-full border-b border-air-blue/20 bg-slate-deep',
        isMobileOpen ? 'block' : 'hidden lg:block',
      ].join(' ')}
    >
      <div className="mx-auto max-w-7xl px-2 lg:px-6">
        <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-air-blue/30">
          {navItems.map((item) => {
            const isActive = item.id === activeItem
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate?.(item.id)}
                className={[
                  'inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 font-body text-sm font-medium whitespace-nowrap transition-colors duration-200 cursor-pointer',
                  isActive
                    ? 'bg-sea-green text-jet-black shadow-sm'
                    : 'text-sky-blue hover:bg-air-blue/20 hover:text-white',
                ].join(' ')}
              >
                <span className={isActive ? 'text-jet-black' : 'text-sky-blue'}>{item.icon}</span>
                {item.label}
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
