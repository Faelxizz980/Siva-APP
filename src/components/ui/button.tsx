import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  isLoading?: boolean
}

const variants = {
  primary: [
    'bg-jet-black text-white',
    'hover:bg-air-blue hover:shadow-lg hover:shadow-jet-black/20 hover:-translate-y-0.5',
    'active:bg-slate-deep active:translate-y-0 active:shadow-none',
    'focus:outline-none focus:ring-2 focus:ring-sea-green focus:ring-offset-2',
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

function filterTokens(source: string, override: string): string {
  let filtered = source
  if (override.includes('bg-')) {
    filtered = filtered.replace(/\S*bg-\S+/g, '').replace(/\s+/g, ' ')
  }
  if (/\btext-/.test(override) && override.includes('text-')) {
    filtered = filtered.replace(/(^|\s)text-\S+/g, ' ').replace(/\s+/g, ' ')
  }
  if (override.includes('focus:ring-')) {
    filtered = filtered.replace(/\S*focus:ring-\S+/g, '').replace(/\s+/g, ' ')
  }
  if (/\bpy-\d/.test(override)) {
    filtered = filtered.replace(/(^|\s)py-\S+/g, ' ').replace(/\s+/g, ' ')
  }
  if (/\bpx-\d/.test(override)) {
    filtered = filtered.replace(/(^|\s)px-\S+/g, ' ').replace(/\s+/g, ' ')
  }
  if (override.includes('rounded-')) {
    filtered = filtered.replace(/\S*rounded-\S+/g, '').replace(/\s+/g, ' ')
  }
  return filtered.trim()
}

export function Button({
  variant = 'primary',
  isLoading = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const variantClasses = filterTokens(variants[variant], className)
  const baseRaw = 'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-body text-sm font-semibold transition-all duration-200 ease-out disabled:pointer-events-none disabled:opacity-50 cursor-pointer'
  const baseClasses = filterTokens(baseRaw, className)
  return (
    <button
      className={[baseClasses, variantClasses, className].join(' ')}
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
