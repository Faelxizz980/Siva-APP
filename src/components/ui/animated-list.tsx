import { Children, type ReactNode } from 'react'
import { motion } from 'framer-motion'

interface AnimatedListProps {
  children: ReactNode
  className?: string
  /** Delay inicial antes do primeiro item (s) */
  initialDelay?: number
  /** Intervalo entre itens (s) */
  staggerDelay?: number
  /** Duração de cada item (s) */
  duration?: number
}

/**
 * React Bits — Animated List
 * Microinteração de entrada: cada filho surge com fade + translate sutil,
 * apenas na montagem. Preserva altura/largura/scroll do container pai.
 * Usa apenas opacity/transform para performance (sem reflow).
 */
export function AnimatedList({
  children,
  className,
  initialDelay = 0.06,
  staggerDelay = 0.055,
  duration = 0.32,
}: AnimatedListProps) {
  const items = Children.toArray(children)

  return (
    <div className={className}>
      {items.map((child, index) => (
        <motion.div
          key={(child as { key?: string | number })?.key ?? index}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration,
            delay: initialDelay + index * staggerDelay,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          // Garante que animação execute apenas uma vez (sem loop)
          style={{ willChange: 'opacity, transform' }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  )
}
