import { Building2, Tag, Cog, AlertTriangle, FileText, Image as ImageIcon, ExternalLink, Activity, Cpu } from 'lucide-react'
import { Modal } from '../ui/modal'
import type { Ativo } from '../../types/Ativo/ativo.types'
import type { Setor } from '../../types/Setor/setor.types'

interface AtivoDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  ativo: Ativo | null
  setor: Setor | null
}

const criticidadeColor: Record<string, string> = {
  baixa: 'bg-slate-100 text-slate-600 border-slate-200',
  media: 'bg-amber-50 text-amber-700 border-amber-200',
  alta: 'bg-red-50 text-red-700 border-red-200',
}

export function AtivoDetailsModal({ isOpen, onClose, ativo, setor }: AtivoDetailsModalProps) {
  if (!ativo) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white px-6 py-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Cog size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Ativo</p>
              <h2 className="truncate text-lg font-bold text-slate-900">{ativo.nome}</h2>
              <p className="flex items-center gap-1.5 text-sm text-slate-500">
                <Tag size={14} />
                {ativo.tag} {ativo.tipo ? `· ${ativo.tipo}` : ''}
              </p>
            </div>
            <span
              className={[
                'inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-xs font-semibold',
                ativo.ativo ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-600 border-slate-200',
              ].join(' ')}
            >
              {ativo.ativo ? 'Ativo' : 'Inativo'}
            </span>
          </div>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
          {/* Destaque Setor + Criticidade + Status */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4">
              <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-blue-600">
                <Building2 size={12} />
                Setor
              </p>
              <p className="mt-1 text-base font-bold text-blue-900">{setor?.nome ?? `Setor #${ativo.setor_id}`}</p>
              {setor && <p className="text-xs text-blue-700">{setor.localizacao}</p>}
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <p className="text-xs font-medium text-slate-500">Criticidade</p>
              <p className="mt-2">
                <span className={['inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold', criticidadeColor[ativo.criticidade]].join(' ')}>
                  <AlertTriangle size={12} />
                  {ativo.criticidade.charAt(0).toUpperCase() + ativo.criticidade.slice(1)}
                </span>
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <p className="text-xs font-medium text-slate-500">Status</p>
              <p className="mt-2">
                <span
                  className={[
                    'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold',
                    ativo.ativo ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-600 border-slate-200',
                  ].join(' ')}
                >
                  <span className={['h-1.5 w-1.5 rounded-full', ativo.ativo ? 'bg-green-500' : 'bg-slate-400'].join(' ')} />
                  {ativo.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </p>
            </div>
          </div>

          {/* Detalhes */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <p className="text-xs font-medium text-slate-500">Tag</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{ativo.tag}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <p className="text-xs font-medium text-slate-500">Tipo</p>
              <p className="mt-1 text-sm font-medium text-slate-900">{ativo.tipo ?? '—'}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <p className="text-xs font-medium text-slate-500">Centro de custo</p>
              <p className="mt-1 text-sm font-medium text-slate-900">{ativo.centro_custo ?? '—'}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <p className="text-xs font-medium text-slate-500">Empresa</p>
              <p className="mt-1 text-sm font-medium text-slate-900">#{ativo.empresa_id}</p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <p className="text-xs font-medium text-slate-500">Descrição</p>
            <p className="mt-1 text-sm text-slate-700">{ativo.descricao ?? 'Sem descrição cadastrada.'}</p>
          </div>

          {/* Foto e Manual */}
          {(ativo.foto_url || ativo.manual_url) && (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {ativo.foto_url && (
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    <ImageIcon size={12} /> Foto
                  </p>
                  <a
                    href={ativo.foto_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    Abrir imagem <ExternalLink size={12} />
                  </a>
                  <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
                    <img src={ativo.foto_url} alt={ativo.nome} className="h-32 w-full object-cover" />
                  </div>
                </div>
              )}
              {ativo.manual_url && (
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    <FileText size={12} /> Manual
                  </p>
                  <a
                    href={ativo.manual_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    Abrir manual <ExternalLink size={12} />
                  </a>
                  <p className="mt-3 text-xs text-slate-500">Documento vinculado ao ativo.</p>
                </div>
              )}
            </div>
          )}

          {!ativo.foto_url && !ativo.manual_url && (
            <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center">
              <p className="text-sm text-slate-500">Nenhuma foto ou manual vinculado a este ativo.</p>
            </div>
          )}

          {/* Sensores vinculados / ESP32 placeholders */}
          <div className="mt-6">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Activity size={14} className="text-slate-400" /> Sensores vinculados
            </h3>
            <div className="mt-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center">
              <p className="text-sm text-slate-500">Nenhum sensor vinculado a este ativo no momento.</p>
              <p className="text-xs text-slate-400">Integração futura com módulo de sensores/ESP32.</p>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Cpu size={14} className="text-slate-400" /> ESP32 relacionado
            </h3>
            <div className="mt-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-center">
              <p className="text-sm text-slate-500">Nenhum ESP32 vinculado.</p>
              <p className="text-xs text-slate-400">Campo preparado para integração futura.</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg bg-white border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
          >
            Fechar
          </button>
        </div>
      </div>
    </Modal>
  )
}
