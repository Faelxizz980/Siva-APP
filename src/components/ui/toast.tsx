import { CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { useEffect } from 'react'

export type ToastType = 'success' | 'error' | 'info'

interface ToastProps {
  message: string
  type?: ToastType
  onClose: () => void
}

const iconMap: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 size={18} className="text-green-600" />,
  error: <AlertCircle size={18} className="text-red-600" />,
  info: <Info size={18} className="text-blue-600" />,
}

const bgMap: Record<ToastType, string> = {
  success: 'border-green-200 bg-green-50',
  error: 'border-red-200 bg-red-50',
  info: 'border-slate-200 bg-white',
}

export function Toast({ message, type = 'success', onClose }: ToastProps) {
  useEffect(() => {
    const id = window.setTimeout(onClose, 3000)
    return () => window.clearTimeout(id)
  }, [onClose])

  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        'pointer-events-auto flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg',
        'animate-in slide-in-from-bottom-2 fade-in duration-200',
        bgMap[type],
      ].join(' ')}
    >
      {iconMap[type]}
      <p className="text-sm font-medium text-slate-700">{message}</p>
      <button
        type="button"
        onClick={onClose}
        className="ml-2 cursor-pointer text-slate-400 hover:text-slate-600"
        aria-label="Fechar notificação"
      >
        ×
      </button>
    </div>
  )
}
