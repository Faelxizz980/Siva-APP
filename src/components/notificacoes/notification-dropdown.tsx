import { useEffect, useRef } from 'react'
import { Bell, CheckCircle2, AlertTriangle, Info, XCircle, X, Check } from 'lucide-react'
import type { Notificacao, NotificacaoTipo } from '../../types/Notificacao/notificacao.types'
import { relativeTime } from '../../utils/format'

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
  sucesso: <CheckCircle2 size={16} className="text-green-600" />,
  alerta: <AlertTriangle size={16} className="text-amber-600" />,
  info: <Info size={16} className="text-blue-600" />,
  erro: <XCircle size={16} className="text-red-600" />,
}

const bgMap: Record<NotificacaoTipo, string> = {
  sucesso: 'bg-green-50 border-green-200',
  alerta: 'bg-amber-50 border-amber-200',
  info: 'bg-blue-50 border-blue-200',
  erro: 'bg-red-50 border-red-200',
}

export function NotificationDropdown({ notifications, isOpen, onClose, onMarkAsRead, onMarkAllAsRead, onAction }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        // also check bell button
        const bell = document.getElementById('notif-bell-btn')
        if (bell && bell.contains(e.target as Node)) return
        onClose()
      }
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClickOutside)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClickOutside)
    }
  }, [isOpen, onClose])

  // focus trap: focus first element when open
  useEffect(() => {
    if (isOpen && ref.current) {
      const btn = ref.current.querySelector<HTMLElement>('button')
      btn?.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  const unread = notifications.filter((n) => !n.lida).length

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label="Notificações"
      className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl sm:w-96"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-slate-600" />
          <h3 className="text-sm font-semibold text-slate-900">Notificações</h3>
          {unread > 0 && (
            <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">{unread}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unread > 0 && (
            <button
              type="button"
              onClick={onMarkAllAsRead}
              className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
            >
              <Check size={12} /> Marcar todas
            </button>
          )}
          <button
            type="button"
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
                  !n.lida ? 'bg-blue-50/50' : 'bg-white',
                  'hover:bg-slate-50',
                ].join(' ')}
              >
                <div className={['mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border', bgMap[n.tipo]].join(' ')}>
                  {iconMap[n.tipo]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold leading-4 text-slate-900">{n.titulo}</p>
                    {!n.lida && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600" aria-label="não lida" />}
                  </div>
                  <p className="mt-1 text-xs leading-4 text-slate-600 line-clamp-2">{n.mensagem}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">{relativeTime(n.timestamp)}</span>
                    <div className="flex items-center gap-1">
                      {n.acaoLabel && onAction && (
                        <button
                          type="button"
                          onClick={() => onAction(n)}
                          className="cursor-pointer rounded-lg bg-white px-2 py-1 text-xs font-medium text-blue-600 ring-1 ring-slate-200 hover:bg-blue-50"
                        >
                          {n.acaoLabel}
                        </button>
                      )}
                      {!n.lida && (
                        <button
                          type="button"
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
    </div>
  )
}

export function NotificationBell({
  count,
  onClick,
}: {
  count: number
  onClick: () => void
}) {
  return (
    <button
      id="notif-bell-btn"
      type="button"
      onClick={onClick}
      aria-label={`Notificações ${count > 0 ? `(${count} não lidas)` : ''}`}
      className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
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
