import type { SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
  options: Array<{ value: string; label: string }>
}

export function Select({ label, error, id, options, className = '', ...props }: SelectProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex w-full flex-col gap-1.5">
      <label htmlFor={inputId} className="font-body text-sm font-medium text-jet-black">
        {label}
      </label>
      <select
        id={inputId}
        className={[
          'w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5',
          'font-body text-sm text-jet-black',
          'transition-all duration-200',
          'focus:border-sea-green focus:outline-none focus:ring-2 focus:ring-sea-green/20',
          'hover:border-slate-400',
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : '',
          className,
        ].join(' ')}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <span id={`${inputId}-error`} className="font-body text-xs text-red-600">
          {error}
        </span>
      )}
    </div>
  )
}
