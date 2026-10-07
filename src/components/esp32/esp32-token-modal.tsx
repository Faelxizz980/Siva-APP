import { useEffect, useState } from 'react'
import { Check, Copy, Eye, ShieldAlert } from 'lucide-react'
import { Modal } from '../ui/modal'
import { Button } from '../ui/button'
import type { Esp32 } from '../../types/Esp32/esp32.types'

interface Esp32TokenModalProps {
  isOpen: boolean
  onClose: () => void
  esp32: Esp32 | null
}

export function Esp32TokenModal({ isOpen, onClose, esp32 }: Esp32TokenModalProps) {
  const [revealed, setRevealed] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setRevealed(false)
      setCopied(false)
    }
  }, [isOpen])

  const handleCopy = async (): Promise<void> => {
    if (!esp32) return
    try {
      await navigator.clipboard.writeText(esp32.token)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="font-heading text-base font-semibold text-jet-black">
            Token do {esp32?.esp_id ?? 'ESP32'}
          </h2>
          <p className="mt-1 font-body text-sm text-slate-500">
            {revealed ? 'Copie o token para configurar o firmware.' : 'Confirme para revelar o token deste ESP32.'}
          </p>
        </div>

        <div className="px-6 py-5">
          {revealed ? (
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
              <code className="min-w-0 flex-1 truncate font-mono text-sm text-jet-black">{esp32?.token}</code>
              <Button type="button" variant="secondary" onClick={handleCopy} className="shrink-0 text-xs">
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copiado!' : 'Copiar'}
              </Button>
            </div>
          ) : (
            <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <ShieldAlert size={16} className="mt-0.5 shrink-0 text-amber-600" />
              <p className="font-body text-xs text-amber-800">
                O token é secreto e autentica o firmware no header X-Token. Revele apenas se precisar
                reconfigurar o dispositivo.
              </p>
            </div>
          )}

          <div className="mt-6 flex items-center justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              {revealed ? 'Fechar' : 'Cancelar'}
            </Button>
            {!revealed && (
              <Button type="button" variant="primary" onClick={() => setRevealed(true)}>
                <Eye size={16} />
                Revelar token
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}
