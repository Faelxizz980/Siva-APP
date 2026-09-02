import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  isLoading?: boolean
}

const variants = {
  primary: [
    'bg-blue-600 text-white',
    'hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/25 hover:-translate-y-0.5',
    'active:bg-blue-800 active:translate-y-0 active:shadow-none',
  ].join(' '),
  secondary: [
    'bg-slate-100 text-slate-700 border border-slate-300',
    'hover:bg-slate-200 hover:border-slate-400 hover:-translate-y-0.5',
    'active:bg-slate-300 active:translate-y-0',
  ].join(' '),
  ghost: [
    'bg-transparent text-slate-600',
    'hover:bg-slate-100 hover:text-slate-900',
    'active:bg-slate-200',
  ].join(' '),
}

export function Button({
  variant = 'primary',
  isLoading = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5',
        'text-sm font-semibold transition-all duration-200 ease-out',
        'disabled:pointer-events-none disabled:opacity-50',
        'cursor-pointer',
        variants[variant],
        className,
      ].join(' ')}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  )
}
