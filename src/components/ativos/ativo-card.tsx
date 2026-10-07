import { Cog, Tag, Building2, AlertTriangle, Eye, Pencil, Trash2 } from 'lucide-react'
import type { Ativo } from '../../types/Ativo/ativo.types'

interface AtivoCardProps {
  ativo: Ativo
  setorNome: string
  onView: (ativo: Ativo) => void
  onEdit?: (ativo: Ativo) => void
  onDelete?: (ativo: Ativo) => void
}

const criticidadeStyles: Record<string, string> = {
  baixa: 'bg-slate-100 text-slate-600 border-slate-200',
  media: 'bg-amber-50 text-amber-700 border-amber-200',
  alta: 'bg-red-50 text-red-700 border-red-200',
}

export function AtivoCard({ ativo, setorNome, onView, onEdit, onDelete }: AtivoCardProps) {
  return (
    <div className="flex flex-col rounded-xl border border-air-blue/20 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sea-green/10 text-slate-deep">
          <Cog size={20} />
        </div>
        <span
          className={[
            'inline-flex items-center rounded-full border px-2.5 py-1 font-body text-xs font-semibold',
            ativo.ativo ? 'bg-sea-green/10 text-slate-deep border-sea-green/20' : 'bg-slate-100 text-slate-600 border-slate-200',
          ].join(' ')}
        >
          <span className={['h-1.5 w-1.5 rounded-full mr-1.5', ativo.ativo ? 'bg-sea-green' : 'bg-slate-400'].join(' ')} />
          {ativo.ativo ? 'Ativo' : 'Inativo'}
        </span>
      </div>

      {/* Conteúdo */}
      <div className="mt-4 flex flex-1 flex-col gap-1">
        <h3 className="truncate font-heading text-base font-semibold text-jet-black">{ativo.nome}</h3>
        <p className="flex items-center gap-1.5 font-body text-xs font-medium text-air-blue">
          <Tag size={12} />
          TAG: {ativo.tag}
        </p>

        <div className="mt-3 flex flex-col gap-2 font-body text-sm">
          <div className="flex items-center gap-2 text-slate-700">
            <Building2 size={14} className="shrink-0 text-sea-green" />
            <span className="truncate">
              Setor: <span className="font-semibold text-jet-black">{setorNome}</span>
            </span>
          </div>

          {ativo.tipo && (
            <div className="flex items-center gap-2 text-slate-600">
              <Cog size={14} className="shrink-0 text-slate-400" />
              <span className="truncate">Tipo: {ativo.tipo}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={['inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold', criticidadeStyles[ativo.criticidade] ?? criticidadeStyles.media].join(' ')}
            >
              <AlertTriangle size={12} />
              {ativo.criticidade.charAt(0).toUpperCase() + ativo.criticidade.slice(1)}
            </span>
            {ativo.centro_custo && (
              <span className="text-xs text-slate-500">CC: {ativo.centro_custo}</span>
            )}
          </div>

          {ativo.descricao && (
            <p className="line-clamp-2 text-sm text-slate-500">{ativo.descricao}</p>
          )}
        </div>
      </div>

      {/* Ações */}
      <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={() => onView(ativo)}
          className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
          aria-label={`Visualizar ${ativo.nome}`}
        >
          <Eye size={14} />
          Visualizar
        </button>
        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(ativo)}
            className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
            aria-label={`Editar ${ativo.nome}`}
          >
            <Pencil size={14} />
            Editar
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(ativo)}
            className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 hover:border-red-200"
            aria-label={`Excluir ${ativo.nome}`}
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
