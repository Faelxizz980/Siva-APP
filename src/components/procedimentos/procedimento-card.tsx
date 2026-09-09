import { Wrench, User, ShieldCheck } from 'lucide-react'
import type { Procedimento } from '../../types/Procedimento/procedimento.types'
import type { Especialidade } from '../../types/Especialidade/especialidade.types'

interface Props {
  procedimento: Procedimento
  especialidades: Especialidade[]
  supervisorNome?: string
  emUsoPorPlanoAtivo?: boolean
  onEdit: (p: Procedimento) => void
  onToggleAtivo: (p: Procedimento) => void
}

const categoriaStyle: Record<string, string> = {
  preventiva: 'bg-violet-50 text-violet-700 border-violet-200',
  inspecao: 'bg-sky-50 text-sky-700 border-sky-200',
}

export function ProcedimentoCard({ procedimento, especialidades, supervisorNome, emUsoPorPlanoAtivo, onEdit, onToggleAtivo }: Props) {
  const equipe = especialidades.filter((e) => procedimento.especialidade_ids.includes(e.id))

  return (
    <div className={['rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md', procedimento.ativo ? 'border-slate-200' : 'border-slate-200 opacity-60'].join(' ')}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
            <Wrench size={16} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{procedimento.nome}</p>
            <span className={['inline-flex rounded-full border px-2 py-0.5 text-xs font-medium', categoriaStyle[procedimento.categoria]].join(' ')}>
              {procedimento.categoria}
            </span>
          </div>
        </div>
        <span className={['inline-flex rounded-full border px-2 py-0.5 text-xs font-medium', procedimento.ativo ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-600 border-slate-200'].join(' ')}>
          {procedimento.ativo ? 'Ativo' : 'Inativo'}
        </span>
      </div>

      {procedimento.descricao && <p className="mt-3 text-xs leading-4 text-slate-600 line-clamp-2">{procedimento.descricao}</p>}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {equipe.length === 0 ? (
          <span className="text-xs text-slate-400">Sem equipe</span>
        ) : (
          equipe.map((e) => (
            <span key={e.id} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
              <ShieldCheck size={12} /> {e.nome}
            </span>
          ))
        )}
      </div>

      <div className="mt-3 flex items-center gap-1 text-xs text-slate-500">
        <User size={12} /> Supervisor: {supervisorNome ?? `#${procedimento.supervisor_id}`}
      </div>

      {emUsoPorPlanoAtivo && procedimento.ativo && (
        <p className="mt-2 text-xs font-medium text-amber-600">Em uso por plano ativo</p>
      )}

      <div className="mt-4 flex gap-2">
        <button type="button" onClick={() => onEdit(procedimento)} className="flex-1 cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
          Editar
        </button>
        <button
          type="button"
          onClick={() => onToggleAtivo(procedimento)}
          className={[
            'flex-1 cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold',
            procedimento.ativo ? 'bg-slate-900 text-white hover:bg-black' : 'bg-green-600 text-white hover:bg-green-700',
          ].join(' ')}
        >
          {procedimento.ativo ? 'Inativar' : 'Reativar'}
        </button>
      </div>
    </div>
  )
}
