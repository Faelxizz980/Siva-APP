import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Bell, CheckCircle2, AlertTriangle, Info, XCircle, X, Check } from 'lucide-react'
import type { Notificacao, NotificacaoTipo } from '../../types/Notificacao/notificacao.types'
import { relativeTime } from '../../utils/format'
import { CLOSE_NAV_MENUS, LAYER_CLASS, requestCloseNavMenus } from '../../utils/layers'

interface Props {
  notifications: Notificacao[]
  isOpen: boolean
  onClose: () => void
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onAction?: (n: Notificacao) => void
  anchorRef?: React.RefObject<HTMLButtonElement | null>
}

const iconMap: Record<NotificacaoTipo, React.ReactNode> = {
  sucesso: <CheckCircle2 size={16} className="text-sea-green" />,
  alerta: <AlertTriangle size={16} className="text-amber-600" />,
  info: <Info size={16} className="text-slate-deep" />,
  erro: <XCircle size={16} className="text-red-600" />,
}

const bgMap: Record<NotificacaoTipo, string> = {
  sucesso: 'bg-sea-green/10 border-sea-green/20',
  alerta: 'bg-amber-50 border-amber-200',
  info: 'bg-sky-blue/20 border-sky-blue/30',
  erro: 'bg-red-50 border-red-200',
}

/** Distância em px entre o botão do sino e o painel. */
const PANEL_GAP = 8

export function NotificationDropdown({ notifications, isOpen, onClose, onMarkAsRead, onMarkAllAsRead, onAction, anchorRef }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ top: 0, right: 16 })

  const resolveAnchor = useCallback((): HTMLElement | null => {
    return anchorRef?.current ?? document.getElementById('notif-bell-btn')
  }, [anchorRef])

  const updatePosition = useCallback(() => {
    const anchor = resolveAnchor()
    if (!anchor) return
    const rect = anchor.getBoundingClientRect()
    setPosition({
      top: Math.round(rect.bottom + PANEL_GAP),
      right: Math.max(8, Math.round(window.innerWidth - rect.right)),
    })
  }, [resolveAnchor])

  // Reposiciona ao abrir e acompanha scroll/resize (painel em portal `fixed`).
  useLayoutEffect(() => {
    if (!isOpen) return
    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [isOpen, updatePosition])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const onClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (ref.current && !ref.current.contains(target)) {
        const bell = resolveAnchor()
        if (bell && bell.contains(target)) return
        onClose()
      }
    }
    // Abrir outro overlay (ex.: dropdown do nav) fecha este painel.
    const onCloseRequest = () => onClose()
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClickOutside)
    window.addEventListener(CLOSE_NAV_MENUS, onCloseRequest)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClickOutside)
      window.removeEventListener(CLOSE_NAV_MENUS, onCloseRequest)
    }
  }, [isOpen, onClose, resolveAnchor])

  // focus trap: focus first element when open
  useEffect(() => {
    if (isOpen && ref.current) {
      const btn = ref.current.querySelector<HTMLElement>('button')
      btn?.focus()
    }
  }, [isOpen])

  const unread = notifications.filter((n) => !n.lida).length

  // Sempre montado (no body, via portal) para permitir a animação de saída;
  // quando fechado fica invisível e fora do fluxo de tabulação.
  return createPortal(
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label="Notificações"
      aria-hidden={!isOpen}
      style={{ top: position.top, right: position.right }}
      className={[
        'fixed w-[min(24rem,calc(100vw-16px))] origin-top-right overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl',
        'transition-[opacity,transform,visibility] duration-[180ms] ease-out motion-reduce:transition-none',
        LAYER_CLASS.topbarMenu,
        isOpen
          ? 'visible translate-y-0 opacity-100 pointer-events-auto'
          : 'invisible -translate-y-2 opacity-0 pointer-events-none',
      ].join(' ')}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-slate-600" />
          <h3 className="text-sm font-semibold text-slate-900">Notificações</h3>
          {unread > 0 && (
            <span className="rounded-full bg-sea-green px-2 py-0.5 font-body text-xs font-bold text-jet-black">{unread}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unread > 0 && (
            <button
              type="button"
              tabIndex={isOpen ? 0 : -1}
              onClick={onMarkAllAsRead}
              className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 font-body text-xs font-medium text-slate-deep hover:bg-sea-green/10"
            >
              <Check size={12} /> Marcar todas
            </button>
          )}
          <button
            type="button"
            tabIndex={isOpen ? 0 : -1}
            onClick={onClose}
            aria-label="Fechar notificações"
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Lista */}
      <div className="max-h-80 overflow-y-auto" aria-live="polite">
        {notifications.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Bell size={20} />
            </div>
            <p className="mt-3 text-sm font-medium text-slate-600">Nenhuma notificação</p>
            <p className="mt-1 text-xs text-slate-400">Você está em dia!</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={[
                  'flex gap-3 px-4 py-3 transition-colors',
                  !n.lida ? 'bg-sea-green/5' : 'bg-white',
                  'hover:bg-sky-blue/10',
                ].join(' ')}
              >
                <div className={['mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border', bgMap[n.tipo]].join(' ')}>
                  {iconMap[n.tipo]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold leading-4 text-slate-900">{n.titulo}</p>
                    {!n.lida && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-sea-green" aria-label="não lida" />}
                  </div>
                  <p className="mt-1 text-xs leading-4 text-slate-600 line-clamp-2">{n.mensagem}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">{relativeTime(n.timestamp)}</span>
                    <div className="flex items-center gap-1">
                      {n.acaoLabel && onAction && (
                        <button
                          type="button"
                          tabIndex={isOpen ? 0 : -1}
                          onClick={() => onAction(n)}
                          className="cursor-pointer rounded-lg bg-white px-2 py-1 font-body text-xs font-medium text-slate-deep ring-1 ring-air-blue/20 hover:bg-sea-green/10"
                        >
                          {n.acaoLabel}
                        </button>
                      )}
                      {!n.lida && (
                        <button
                          type="button"
                          tabIndex={isOpen ? 0 : -1}
                          onClick={() => onMarkAsRead(n.id)}
                          className="cursor-pointer rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                        >
                          Marcar como lida
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-2 text-center">
          <p className="text-xs text-slate-400">{notifications.length} notificação(ões) • {unread} não lida(s)</p>
        </div>
      )}
    </div>,
    document.body,
  )
}

export function NotificationBell({
  count,
  onClick,
  expanded = false,
  buttonRef,
}: {
  count: number
  onClick: () => void
  expanded?: boolean
  buttonRef?: React.RefObject<HTMLButtonElement | null>
}) {
  return (
    <button
      id="notif-bell-btn"
      ref={buttonRef}
      type="button"
      onClick={() => {
        // Só um overlay aberto por vez: abrir o sino fecha os dropdowns do nav.
        requestCloseNavMenus()
        onClick()
      }}
      aria-label={`Notificações ${count > 0 ? `(${count} não lidas)` : ''}`}
      aria-haspopup="dialog"
      aria-expanded={expanded}
      className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-sky-blue outline-none transition-colors hover:bg-slate-deep hover:text-white focus-visible:ring-2 focus-visible:ring-sea-green/70 motion-reduce:transition-none"
    >
      <Bell size={20} />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  )
}
