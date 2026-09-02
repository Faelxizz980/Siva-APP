import type { AuthUser } from '../types'
import { Modal } from './ui/modal'

interface ProfileModalProps {
  user: AuthUser
  isOpen: boolean
  onClose: () => void
}

function formatCpf(cpf: string): string {
  const digits = cpf.replace(/\D/g, '')
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

const nivelBadgeColor: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700',
  gestor: 'bg-blue-100 text-blue-700',
  tecnico: 'bg-amber-100 text-amber-700',
  funcionario: 'bg-slate-100 text-slate-700',
}

export function ProfileModal({ user, isOpen, onClose }: ProfileModalProps) {
  const badgeColor = nivelBadgeColor[user.nivel.tipo] ?? nivelBadgeColor.funcionario

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center gap-4 bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-lg font-bold text-white">
            {user.nome.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold text-white">{user.nome}</p>
            <p className="truncate text-sm text-blue-100">{user.email}</p>
          </div>
        </div>

        <div className="px-6 py-4">
          <dl className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <dt className="text-sm text-slate-500">CPF</dt>
              <dd className="text-sm font-medium text-slate-900">
                {formatCpf(user.cpf)}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-sm text-slate-500">Cargo</dt>
              <dd className="text-sm font-medium text-slate-900">{user.nivel.cargo}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-sm text-slate-500">Nível</dt>
              <dd>
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeColor}`}>
                  {user.nivel.tipo.charAt(0).toUpperCase() + user.nivel.tipo.slice(1)}
                </span>
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-sm text-slate-500">Status</dt>
              <dd className="flex items-center gap-1.5 text-sm font-medium">
                <span className={`h-2 w-2 rounded-full ${user.ativo ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className={user.ativo ? 'text-green-700' : 'text-red-700'}>
                  {user.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </dd>
            </div>
          </dl>
        </div>

        <div className="border-t border-slate-100 px-6 py-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full cursor-pointer rounded-lg bg-slate-100 py-2 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-200"
          >
            Fechar
          </button>
        </div>
      </div>
    </Modal>
  )
}
