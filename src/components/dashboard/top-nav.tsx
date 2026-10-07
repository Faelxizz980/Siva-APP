import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import {
  LayoutDashboard,
  Building2,
  Cog,
  Cpu,
  Radio,
  Wrench,
  ShieldCheck,
  FileText,
  ClipboardList,
  ClipboardCheck,
  CalendarDays,
  ScrollText,
  ChevronDown,
  Boxes,
} from 'lucide-react'
import { CLOSE_NAV_MENUS, LAYER_CLASS, requestCloseTopbarMenus } from '../../utils/layers'
import { isTecnico } from '../../utils/permissions'
import type { AuthUser } from '../../types'

interface TopNavProps {
  user: AuthUser
  activeItem?: string
  onNavigate?: (itemId: string) => void
  isMobileOpen?: boolean
}

interface NavItem {
  id: string
  label: string
  icon: ReactNode
}

interface NavGroup {
  id: 'infra' | 'manut'
  label: string
  icon: ReactNode
  items: NavItem[]
}

const dashboardItem: NavItem = { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> }
const relatoriosItem: NavItem = { id: 'relatorios', label: 'Relatórios', icon: <FileText size={16} /> }

const infraItems: NavItem[] = [
  { id: 'setores', label: 'Setores', icon: <Building2 size={16} /> },
  { id: 'ativos', label: 'Ativos', icon: <Cog size={16} /> },
  { id: 'esp32', label: 'ESP32', icon: <Cpu size={16} /> },
  { id: 'sensores', label: 'Sensores', icon: <Radio size={16} /> },
]

const manutItems: NavItem[] = [
  { id: 'solicitacoes', label: 'Solicitações', icon: <ClipboardList size={16} /> },
  { id: 'ordens', label: 'Ordens de Serviço', icon: <Wrench size={16} /> },
  { id: 'procedimentos', label: 'Procedimentos', icon: <ScrollText size={16} /> },
  { id: 'planos', label: 'Planos', icon: <CalendarDays size={16} /> },
  { id: 'preventivas', label: 'Preventivas', icon: <ShieldCheck size={16} /> },
]

const manutItemsTecnico: NavItem[] = [
  { id: 'minhas-ordens', label: 'Minhas Ordens', icon: <ClipboardCheck size={16} /> },
  { id: 'solicitacoes', label: 'Solicitações', icon: <ClipboardList size={16} /> },
]

const pillBase =
  'inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 font-body text-sm font-medium whitespace-nowrap transition-colors duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-sea-green/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-deep motion-reduce:transition-none'

export function TopNav({ user, activeItem = 'dashboard', onNavigate, isMobileOpen = false }: TopNavProps) {
  const [openGroup, setOpenGroup] = useState<NavGroup['id'] | null>(null)
  const navRef = useRef<HTMLElement>(null)
  const tecnico = isTecnico(user)

  // Técnico: sem Dashboard/Relatórios; Manutenção só com Minhas Ordens + Solicitações.
  const navGroups: NavGroup[] = [
    { id: 'infra', label: 'Infraestrutura', icon: <Boxes size={16} />, items: infraItems },
    { id: 'manut', label: 'Manutenção', icon: <Wrench size={16} />, items: tecnico ? manutItemsTecnico : manutItems },
  ]

  // Só um overlay aberto por vez: a topbar (sino) pode pedir o fechamento daqui.
  useEffect(() => {
    const close = () => setOpenGroup(null)
    window.addEventListener(CLOSE_NAV_MENUS, close)
    return () => window.removeEventListener(CLOSE_NAV_MENUS, close)
  }, [])

  useEffect(() => {
    if (!openGroup) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenGroup(null)
    }
    const onOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenGroup(null)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onOutside)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onOutside)
    }
  }, [openGroup])

  const go = (id: string) => {
    setOpenGroup(null)
    requestCloseTopbarMenus()
    onNavigate?.(id)
  }

  const renderDirect = (item: NavItem) => {
    const isActive = item.id === activeItem
    return (
      <button
        key={item.id}
        type="button"
        onClick={() => go(item.id)}
        aria-current={isActive ? 'page' : undefined}
        className={[
          pillBase,
          'w-full justify-start lg:w-auto',
          isActive ? 'bg-sea-green text-jet-black shadow-sm' : 'text-sky-blue hover:bg-air-blue/20 hover:text-white',
        ].join(' ')}
      >
        <span className={isActive ? 'text-jet-black' : 'text-sky-blue'}>{item.icon}</span>
        {item.label}
      </button>
    )
  }

  const renderGroup = (group: NavGroup) => {
    const isGroupActive = group.items.some((i) => i.id === activeItem)
    const isOpen = openGroup === group.id
    return (
      <div key={group.id} className="relative w-full lg:w-auto">
        <button
          type="button"
          onClick={() => {
            const next = openGroup === group.id ? null : group.id
            setOpenGroup(next)
            // Abrir o dropdown fecha o painel de notificações e vice-versa.
            if (next) requestCloseTopbarMenus()
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setOpenGroup(null)
          }}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          className={[
            pillBase,
            'w-full justify-between lg:w-auto lg:justify-start',
            isGroupActive || isOpen
              ? 'bg-sea-green text-jet-black shadow-sm'
              : 'text-sky-blue hover:bg-air-blue/20 hover:text-white',
          ].join(' ')}
        >
          <span className="inline-flex items-center gap-2">
            <span className={isGroupActive || isOpen ? 'text-jet-black' : 'text-sky-blue'}>{group.icon}</span>
            {group.label}
          </span>
          <ChevronDown
            size={15}
            aria-hidden="true"
            className={['transition-transform duration-200 motion-reduce:transition-none', isOpen ? 'rotate-180' : ''].join(' ')}
          />
        </button>

        {/* Painel sempre montado no desktop (animação de saída); no mobile usa show/hide inline */}
        <div
          role="menu"
          aria-label={group.label}
          aria-hidden={!isOpen}
          className={[
            'origin-top p-1.5 shadow-xl',
            'mt-1 w-full flex-col gap-1 rounded-[10px] border border-air-blue/20 bg-slate-deep',
            isOpen ? 'flex' : 'hidden lg:flex',
            'lg:absolute lg:top-[calc(100%+8px)] lg:left-0 lg:mt-0 lg:w-auto lg:min-w-[220px] lg:z-[var(--z-nav-menu)]',
            'lg:transition-[opacity,transform,visibility] lg:duration-[180ms] lg:ease-out motion-reduce:transition-none',
            isOpen
              ? 'lg:visible lg:translate-y-0 lg:opacity-100 lg:pointer-events-auto'
              : 'lg:invisible lg:-translate-y-2 lg:opacity-0 lg:pointer-events-none',
          ].join(' ')}
        >
          {group.items.map((item, index) => {
            const isActive = item.id === activeItem
            return (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                tabIndex={isOpen ? 0 : -1}
                onClick={() => go(item.id)}
                aria-current={isActive ? 'page' : undefined}
                style={{ transitionDelay: isOpen ? `${index * 30}ms` : '0ms' }}
                className={[
                  'flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-left font-body text-sm whitespace-nowrap transition-[opacity,transform,background-color,color] duration-[180ms] ease-out outline-none motion-reduce:transition-none',
                  'focus-visible:ring-2 focus-visible:ring-sea-green/70',
                  isOpen ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0',
                  isActive
                    ? 'bg-sea-green font-semibold text-jet-black'
                    : 'font-medium text-sky-blue hover:bg-sea-green/15 hover:text-white',
                ].join(' ')}
              >
                <span className={isActive ? 'text-jet-black' : 'text-sky-blue'}>{item.icon}</span>
                {item.label}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <nav
      ref={navRef}
      aria-label="Navegação principal"
      className={[
        'relative w-full overflow-visible border-b border-air-blue/20 bg-slate-deep',
        LAYER_CLASS.nav,
        isMobileOpen ? 'block' : 'hidden lg:block',
      ].join(' ')}
    >
      <div className="mx-auto max-w-7xl overflow-visible px-2 lg:px-6">
        <div className="flex flex-col gap-1 overflow-visible py-2 lg:flex-row lg:items-start lg:gap-1 lg:py-2">
          {!tecnico && renderDirect(dashboardItem)}
          {navGroups.map(renderGroup)}
          {!tecnico && renderDirect(relatoriosItem)}
        </div>
      </div>
    </nav>
  )
}
