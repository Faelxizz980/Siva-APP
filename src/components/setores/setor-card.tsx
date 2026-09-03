import { Building2, MapPin, Activity, Eye, Pencil, Trash2 } from 'lucide-react'
import type { Setor } from '../../types/Setor/setor.types'

interface SetorCardProps {
  setor: Setor
  ativosCount: number
  onView: (setor: Setor) => void
  onEdit: (setor: Setor) => void
  onDelete: (setor: Setor) => void
}

export function SetorCard({ setor, ativosCount, onView, onEdit, onDelete }: SetorCardProps) {
  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <Building2 size={20} />
        </div>
        <span
          className={[
            'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold',
            setor.ativo ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-slate-100 text-slate-600 border border-slate-200',
          ].join(' ')}
        >
          <span className={['h-1.5 w-1.5 rounded-full mr-1.5', setor.ativo ? 'bg-green-500' : 'bg-slate-400'].join(' ')} />
          {setor.ativo ? 'Ativo' : 'Inativo'}
        </span>
      </div>

      {/* Conteúdo */}
      <div className="mt-4 flex flex-1 flex-col gap-2">
        <h3 className="text-base font-semibold text-slate-900 line-clamp-1">{setor.nome}</h3>
        <p className="text-sm text-slate-500 line-clamp-2 min-h-10">{setor.descricao}</p>

        <div className="mt-2 flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <MapPin size={14} className="shrink-0 text-slate-400" />
            <span className="truncate">{setor.localizacao}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Activity size={14} className="shrink-0 text-slate-400" />
            <span>
              {ativosCount} {ativosCount === 1 ? 'ativo' : 'ativos'}
            </span>
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={() => onView(setor)}
          className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
          aria-label={`Visualizar ${setor.nome}`}
        >
          <Eye size={14} />
          Visualizar
        </button>
        <button
          type="button"
          onClick={() => onEdit(setor)}
          className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
          aria-label={`Editar ${setor.nome}`}
        >
          <Pencil size={14} />
          Editar
        </button>
        <button
          type="button"
          onClick={() => onDelete(setor)}
          className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 hover:border-red-200"
          aria-label={`Excluir ${setor.nome}`}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )
}
