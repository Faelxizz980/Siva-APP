import {
  LayoutDashboard,
  Building2,
  Cog,
  Radio,
  Wrench,
  ShieldCheck,
  FileText,
  Settings,
  ChevronLeft,
} from 'lucide-react'
import type { ReactNode } from 'react'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  activeItem?: string
  onNavigate?: (itemId: string) => void
}

interface NavItem {
  id: string
  label: string
  icon: ReactNode
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'setores', label: 'Setores', icon: <Building2 size={20} /> },
  { id: 'ativos', label: 'Ativos', icon: <Cog size={20} /> },
  { id: 'sensores', label: 'Sensores', icon: <Radio size={20} /> },
  { id: 'manutencoes', label: 'Manutenções', icon: <Wrench size={20} /> },
  { id: 'preventivas', label: 'Preventivas', icon: <ShieldCheck size={20} /> },
  { id: 'relatorios', label: 'Relatórios', icon: <FileText size={20} /> },
  { id: 'configuracoes', label: 'Configurações', icon: <Settings size={20} /> },
]

export function Sidebar({ isOpen, onToggle, activeItem = 'dashboard', onNavigate }: SidebarProps) {
  return (
    <>
      {!isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={[
          'fixed top-0 left-0 z-40 flex h-full flex-col border-r border-slate-200 bg-white transition-transform duration-300',
          'w-64',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0 lg:static lg:z-auto',
        ].join(' ')}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
              S
            </div>
            <span className="text-lg font-bold text-slate-900">SIVA</span>
          </div>
          <button
            type="button"
            onClick={onToggle}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 lg:hidden"
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = item.id === activeItem
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onNavigate?.(item.id)}
                    className={[
                      'flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150',
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                    ].join(' ')}
                  >
                    <span className={isActive ? 'text-blue-600' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    {item.label}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="border-t border-slate-200 p-4">
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs font-medium text-slate-500">Sistema SIVA</p>
            <p className="text-xs text-slate-400">v1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  )
}
