import { useEffect, useMemo, useRef, useState } from 'react'

interface ParsedValue {
  target: number
  suffix: string
  decimals: number
  useThousandSep: boolean
  hasComma: boolean
}

function parseValue(raw: string): ParsedValue {
  const value = raw.trim()

  // Caso fração do tipo "24/28"
  if (value.includes('/')) {
    const [left, ...rightParts] = value.split('/')
    const right = rightParts.join('/')
    const leftNum = Number(left.replace(/\./g, '').replace(',', '.'))
    const target = Number.isFinite(leftNum) ? leftNum : 0
    // Preserva exatamente o denominador como sufixo
    const suffix = `/${right}`
    return {
      target,
      suffix,
      decimals: 0,
      useThousandSep: false,
      hasComma: false,
    }
  }

  const match = value.match(/^([\d.,]+)(.*)$/)
  if (!match) {
    return { target: 0, suffix: value, decimals: 0, useThousandSep: false, hasComma: false }
  }

  const numStr = match[1]
  const suffix = match[2] // já inclui espaço quando houver, ex: " m³"

  const hasComma = numStr.includes(',')
  const hasDot = numStr.includes('.')

  let decimals = 0
  let useThousandSep = false
  let normalized = numStr

  if (hasComma) {
    const afterComma = (numStr.split(',').pop() ?? '')
    decimals = afterComma.length
    normalized = numStr.replace(/\./g, '').replace(',', '.')
    useThousandSep = numStr.includes('.')
  } else if (hasDot) {
    const parts = numStr.split('.')
    const isThousands =
      parts.length > 1 && parts.every((p, i) => (i === 0 ? p.length >= 1 && p.length <= 3 : p.length === 3))
    if (isThousands) {
      decimals = 0
      useThousandSep = true
      normalized = numStr.replace(/\./g, '')
    } else {
      const afterDot = (numStr.split('.').pop() ?? '')
      decimals = afterDot.length
      useThousandSep = false
      normalized = numStr
    }
  }

  const target = Number(normalized)
  return {
    target: Number.isFinite(target) ? target : 0,
    suffix,
    decimals,
    useThousandSep,
    hasComma,
  }
}

function formatNumber(current: number, decimals: number, useThousandSep: boolean, hasComma: boolean): string {
  if (decimals === 0 && useThousandSep) {
    return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(Math.round(current))
  }
  if (decimals > 0) {
    if (hasComma) {
      return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(current)
    }
    return current.toFixed(decimals)
  }
  // Inteiro simples sem separador ("3", "5" ou "24" da fração)
  return Math.round(current).toString()
}

interface CountUpProps {
  /** Valor exatamente como em mockStats, ex: "2.847 m³" | "24/28" | "3" */
  value: string
  /** Duração em ms — discreta e rápida */
  duration?: number
  /** Delay inicial em ms */
  delay?: number
  className?: string
}

/**
 * React Bits — CountUp
 * Microinteração: anima de 0 até o valor apenas na montagem.
 * Preserva formatação, unidades e casas decimais sem alterar layout.
 */
export function CountUp({ value, duration = 900, delay = 80, className }: CountUpProps) {
  const parsed = useMemo(() => parseValue(value), [value])
  const [display, setDisplay] = useState<string>(() => {
    // Estado inicial já formatado como 0 para evitar flash de layout
    const zero = formatNumber(0, parsed.decimals, parsed.useThousandSep, parsed.hasComma)
    return `${zero}${parsed.suffix}`
  })
  const rafRef = useRef<number | null>(null)
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    // Respeita prefers-reduced-motion — sem animação, exibe valor final
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const finalFormatted = formatNumber(parsed.target, parsed.decimals, parsed.useThousandSep, parsed.hasComma)
      setDisplay(`${finalFormatted}${parsed.suffix}`)
      return
    }

    const startValue = 0
    const target = parsed.target

    // Se target 0, nada a animar
    if (target === 0) {
      const zero = formatNumber(0, parsed.decimals, parsed.useThousandSep, parsed.hasComma)
      setDisplay(`${zero}${parsed.suffix}`)
      return
    }

    const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3)

    const startAnimation = (): void => {
      const startAt = performance.now()

      const tick = (now: number): void => {
        const elapsed = now - startAt
        const progress = Math.min(elapsed / duration, 1)
        const eased = easeOutCubic(progress)
        const current = startValue + (target - startValue) * eased
        const formatted = formatNumber(current, parsed.decimals, parsed.useThousandSep, parsed.hasComma)
        setDisplay(`${formatted}${parsed.suffix}`)

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(tick)
        }
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    timeoutRef.current = window.setTimeout(startAnimation, delay)

    return () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [parsed, duration, delay])

  // Mantém largura/altura idênticas ao <p> original — apenas texto
  return <span className={className}>{display}</span>
}
