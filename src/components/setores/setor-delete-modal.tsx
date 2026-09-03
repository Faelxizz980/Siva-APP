import { AlertTriangle } from 'lucide-react'
import { Modal } from '../ui/modal'
import { Button } from '../ui/button'
import type { Setor } from '../../types/Setor/setor.types'

interface SetorDeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  setor: Setor | null
}

export function SetorDeleteModal({ isOpen, onClose, onConfirm, setor }: SetorDeleteModalProps) {
  if (!setor) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="px-6 pt-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
              <AlertTriangle size={20} />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-semibold text-slate-900">Excluir setor?</h2>
              <p className="mt-1 text-sm text-slate-500">
                Tem certeza que deseja excluir o setor <span className="font-semibold text-slate-700">"{setor.nome}"</span>? Essa ação não
                poderá ser desfeita.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            className="bg-red-600 text-white hover:bg-red-700 hover:shadow-red-600/20 active:bg-red-800"
          >
            Excluir
          </Button>
        </div>
      </div>
    </Modal>
  )
}
