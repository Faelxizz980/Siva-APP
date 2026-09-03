import { Building2, MapPin, Tag, Wrench, Activity, AlertTriangle } from 'lucide-react'
import { Modal } from '../ui/modal'
import type { Setor } from '../../types/Setor/setor.types'
import type { Ativo } from '../../types/Ativo/ativo.types'

interface SetorDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  setor: Setor | null
  ativos: Ativo[]
}

const criticidadeColor: Record<string, string> = {
  baixa: 'bg-slate-100 text-slate-600 border-slate-200',
  media: 'bg-amber-50 text-amber-700 border-amber-200',
  alta: 'bg-red-50 text-red-700 border-red-200',
}

const statusColor: Record<string, string> = {
  ativo: 'bg-green-50 text-green-700 border-green-200',
  manutencao: 'bg-amber-50 text-amber-700 border-amber-200',
  inativo: 'bg-slate-100 text-slate-600 border-slate-200',
}

function getAtivoStatusLabel(ativo: Ativo): { label: string; key: string } {
  if (!ativo.ativo) return { label: 'Inativo', key: 'inativo' }
  // Heurística visual: se tipo Equipamento e criticidade alta, demonstra Manutenção
  if (ativo.tipo === 'Equipamento' && ativo.criticidade === 'media') return { label: 'Manutenção', key: 'manutencao' }
  return { label: 'Ativo', key: 'ativo' }
}

export function SetorDetailsModal({ isOpen, onClose, setor, ativos }: SetorDetailsModalProps) {
  if (!setor) return null

  const ativosDoSetor = ativos.filter((a) => a.setor_id === setor.id)

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Building2 size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-base font-semibold text-slate-900">{setor.nome}</h2>
              <p className="text-sm text-slate-500">Detalhes do setor</p>
            </div>
            <span
              className={[
                'inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-xs font-semibold',
                setor.ativo ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-600 border-slate-200',
              ].join(' ')}
            >
              {setor.ativo ? 'Ativo' : 'Inativo'}
            </span>
          </div>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
          {/* Informações */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <p className="text-xs font-medium text-slate-500">Nome</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{setor.nome}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <p className="text-xs font-medium text-slate-500">Localização</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-900">
                <MapPin size={14} className="text-slate-400" />
                {setor.localizacao}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <p className="text-xs font-medium text-slate-500">Descrição</p>
            <p className="mt-1 text-sm text-slate-700">{setor.descricao}</p>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <p className="text-xs font-medium text-slate-500">Status</p>
              <p className="mt-1 text-sm">
                <span
                  className={[
                    'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                    setor.ativo ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-600 border-slate-200',
                  ].join(' ')}
                >
                  <span className={['h-1.5 w-1.5 rounded-full', setor.ativo ? 'bg-green-500' : 'bg-slate-400'].join(' ')} />
                  {setor.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <p className="text-xs font-medium text-slate-500">Ativos vinculados</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                <Activity size={14} className="text-slate-400" />
                {ativosDoSetor.length} {ativosDoSetor.length === 1 ? 'ativo' : 'ativos'}
              </p>
            </div>
          </div>

          {/* Ativos */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-slate-900">Ativos do Setor</h3>
            <p className="text-xs text-slate-500">Equipamentos e sensores vinculados a este setor</p>

            {ativosDoSetor.length === 0 ? (
              <div className="mt-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <Wrench size={18} />
                </div>
                <p className="mt-3 text-sm font-medium text-slate-600">Nenhum ativo vinculado</p>
                <p className="text-xs text-slate-500">Este setor ainda não possui ativos cadastrados.</p>
              </div>
            ) : (
              <div className="mt-3 flex flex-col gap-3">
                {ativosDoSetor.map((ativo) => {
                  const status = getAtivoStatusLabel(ativo)
                  return (
                    <div
                      key={ativo.id}
                      className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                        {ativo.tipo === 'Sensor de Vazão' ? <Activity size={18} /> : <Wrench size={18} />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">{ativo.nome}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1">
                            <Tag size={12} />
                            {ativo.tag}
                          </span>
                          <span className="text-slate-300">·</span>
                          <span>{ativo.tipo ?? '—'}</span>
                          {ativo.descricao && (
                            <>
                              <span className="hidden sm:inline text-slate-300">·</span>
                              <span className="hidden sm:inline truncate">{ativo.descricao}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-col items-end gap-1.5">
                        <span
                          className={['inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold', statusColor[status.key] ?? statusColor.ativo].join(' ')}
                        >
                          {status.label}
                        </span>
                        <span
                          className={['inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium', criticidadeColor[ativo.criticidade] ?? criticidadeColor.media].join(' ')}
                        >
                          <AlertTriangle size={10} />
                          {ativo.criticidade}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-slate-100 px-6 py-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200"
          >
            Fechar
          </button>
        </div>
      </div>
    </Modal>
  )
}
