import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  labelClassName?: string
}

export function Input({ label, error, id, className = '', labelClassName = '', ...props }: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label
        htmlFor={inputId}
        className={['font-body text-sm font-medium', label ? '' : '', labelClassName || 'text-jet-black'].join(' ')}
      >
        {label}
      </label>
      <input
        id={inputId}
        className={[
          'w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5',
          'font-body text-sm text-jet-black placeholder:text-slate-400',
          'transition-all duration-200',
          'focus:border-sea-green focus:outline-none focus:ring-2 focus:ring-sea-green/20',
          'hover:border-slate-400',
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : '',
          className,
        ].join(' ')}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <span id={`${inputId}-error`} className="font-body text-xs text-red-600">
          {error}
        </span>
      )}
    </div>
  )
}
