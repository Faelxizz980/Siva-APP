import { useEffect, useState } from 'react'
import { AlertTriangle, Check, CheckCircle2, Copy, Cpu } from 'lucide-react'
import { Modal } from '../ui/modal'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Select } from '../ui/select'
import { Button } from '../ui/button'
import type { Setor } from '../../types/Setor/setor.types'
import type { CreateEsp32DTO, Esp32, UpdateEsp32DTO } from '../../types/Esp32/esp32.types'

interface Esp32FormModalProps {
  isOpen: boolean
  onClose: () => void
  /** Cria o ESP32 e retorna o token gerado (mock local; no backend vem de POST /esp32). */
  onCreate: (data: CreateEsp32DTO) => string
  onUpdate: (id: number, data: UpdateEsp32DTO) => void
  setores: Setor[]
  initialData?: Esp32 | null
  existingEsp32s: Esp32[]
  onNavigateToSetores: () => void
}

interface FormErrors {
  setor_id?: string
  esp_id?: string
  descricao?: string
}

export function Esp32FormModal({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  setores,
  initialData,
  existingEsp32s,
  onNavigateToSetores,
}: Esp32FormModalProps) {
  const isEditing = !!initialData

  const [step, setStep] = useState<'form' | 'success'>('form')
  const [createdToken, setCreatedToken] = useState('')
  const [copied, setCopied] = useState(false)

  const [setorId, setSetorId] = useState('')
  const [espId, setEspId] = useState('')
  const [descricao, setDescricao] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    if (isOpen) {
      setStep('form')
      setCreatedToken('')
      setCopied(false)
      setSetorId(initialData ? String(initialData.setor_id) : '')
      setEspId(initialData?.esp_id ?? '')
      setDescricao(initialData?.descricao ?? '')
      setErrors({})
    }
  }, [isOpen, initialData])

  const espIdChanged = isEditing && espId.trim() !== '' && espId.trim() !== initialData?.esp_id

  const validate = (): boolean => {
    const next: FormErrors = {}

    if (!setorId) next.setor_id = 'Selecione um setor'
    else if (!setores.some((s) => String(s.id) === setorId)) next.setor_id = 'Setor inválido'

    const espIdTrim = espId.trim()
    if (!espIdTrim) next.esp_id = 'ESP ID é obrigatório'
    else if (espIdTrim.length > 50) next.esp_id = 'ESP ID deve ter até 50 caracteres'
    else {
      // Espelha o 409 do backend (UNIQUE esp_id).
      const duplicate = existingEsp32s.some(
        (e) => e.esp_id.toLowerCase() === espIdTrim.toLowerCase() && e.id !== initialData?.id,
      )
      if (duplicate) next.esp_id = 'Já existe um ESP32 com esse ID'
    }

    if (descricao.trim().length > 100) next.descricao = 'Descrição deve ter até 100 caracteres'

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    if (!validate()) return

    if (isEditing && initialData) {
      onUpdate(initialData.id, {
        setor_id: Number(setorId),
        esp_id: espId.trim(),
        descricao: descricao.trim() ? descricao.trim() : null,
      })
      onClose()
    } else {
      const token = onCreate({
        setor_id: Number(setorId),
        esp_id: espId.trim(),
        descricao: descricao.trim() ? descricao.trim() : null,
      })
      setCreatedToken(token)
      setStep('success')
    }
  }

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(createdToken)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        {step === 'success' ? (
          <div className="px-6 py-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sea-green/10 text-slate-deep">
              <CheckCircle2 size={28} />
            </div>
            <h2 className="mt-4 font-heading text-base font-semibold text-jet-black">ESP32 criado com sucesso</h2>
            <p className="mx-auto mt-1 max-w-md font-body text-sm text-slate-500">
              Guarde este token, ele será usado no firmware (header X-Token). Ele não será exibido novamente aqui.
            </p>
            <div className="mx-auto mt-5 flex max-w-md items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
              <code className="min-w-0 flex-1 truncate font-mono text-sm text-jet-black">{createdToken}</code>
              <Button type="button" variant="secondary" onClick={handleCopy} className="shrink-0 text-xs">
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copiado!' : 'Copiar'}
              </Button>
            </div>
            <div className="mt-6 flex items-center justify-center">
              <Button type="button" variant="primary" onClick={onClose}>
                Concluir
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="border-b border-slate-100 px-6 py-5">
              <h2 className="font-heading text-base font-semibold text-jet-black">
                {isEditing ? 'Editar ESP32' : 'Novo ESP32'}
              </h2>
              <p className="mt-1 font-body text-sm text-slate-500">
                {isEditing
                  ? 'Atualize o setor, o identificador ou a descrição do ESP32.'
                  : 'Cadastre um ESP32 vinculado a um setor. O token é gerado automaticamente.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="max-h-[70vh] overflow-y-auto px-6 py-5">
              {setores.length === 0 ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-center">
                  <p className="font-body text-sm font-medium text-amber-800">
                    Nenhum setor cadastrado. Cadastre um setor antes de criar um ESP32.
                  </p>
                  <Button type="button" variant="secondary" onClick={onNavigateToSetores} className="mt-3">
                    Ir para Setores
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  <Select
                    label="Setor *"
                    value={setorId}
                    onChange={(e) => setSetorId(e.target.value)}
                    error={errors.setor_id}
                    options={[
                      { value: '', label: 'Selecione um setor' },
                      ...setores.map((s) => ({ value: String(s.id), label: s.nome })),
                    ]}
                  />

                  <div>
                    <Input
                      label="ESP ID *"
                      placeholder="Ex: ESP32-003"
                      value={espId}
                      onChange={(e) => setEspId(e.target.value)}
                      error={errors.esp_id}
                      maxLength={50}
                    />
                    <p className="mt-1 font-body text-xs text-slate-500">
                      Deve ser idêntico ao configurado no firmware
                    </p>
                  </div>

                  {espIdChanged && (
                    <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                      <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600" />
                      <p className="font-body text-xs text-amber-800">
                        Alterar o ESP ID pode quebrar a comunicação com o firmware já configurado.
                      </p>
                    </div>
                  )}

                  <Textarea
                    label="Descrição"
                    placeholder="Ex: Case da linha de produção 1"
                    rows={2}
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    maxLength={100}
                    error={errors.descricao}
                  />
                </div>
              )}

              <div className="mt-6 flex items-center justify-end gap-3">
                <Button type="button" variant="secondary" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" disabled={setores.length === 0}>
                  <Cpu size={16} />
                  {isEditing ? 'Salvar alterações' : 'Cadastrar ESP32'}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </Modal>
  )
}
