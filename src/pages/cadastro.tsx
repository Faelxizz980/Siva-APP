import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { useForm } from '../hooks/use-form'
import logo from '../../assets/logo.png'

interface CadastroFormValues {
  nome: string
  email: string
  senha: string
  confirmarSenha: string
}

const initialValues: CadastroFormValues = {
  nome: '',
  email: '',
  senha: '',
  confirmarSenha: '',
}

const validations = {
  nome: (value: string): string | null => {
    if (!value.trim()) return 'Nome é obrigatório'
    if (value.trim().length < 3) return 'Nome deve ter pelo menos 3 caracteres'
    return null
  },
  email: (value: string): string | null => {
    if (!value.trim()) return 'Email é obrigatório'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Email inválido'
    return null
  },
  senha: (value: string): string | null => {
    if (!value) return 'Senha é obrigatória'
    if (value.length < 6) return 'Senha deve ter pelo menos 6 caracteres'
    return null
  },
  confirmarSenha: (value: string): string | null => {
    if (!value) return 'Confirmação de senha é obrigatória'
    return null
  },
}

interface CadastroScreenProps {
  onNavigateToLogin: () => void
}

export default function CadastroScreen({ onNavigateToLogin }: CadastroScreenProps) {
  const [success, setSuccess] = useState(false)
  const [showSenha, setShowSenha] = useState(false)
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false)

  const { values, errors, isSubmitting, handleChange, handleSubmit, setFieldError } =
    useForm<CadastroFormValues>({
      initialValues,
      validations,
      onSubmit: async (formValues) => {
        if (formValues.senha !== formValues.confirmarSenha) {
          setFieldError('confirmarSenha', 'As senhas não conferem')
          return
        }

        setSuccess(true)
      },
    })

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-jet-black via-slate-deep to-jet-black px-4">
        <div className="w-full max-w-md rounded-2xl border border-air-blue/20 bg-jet-black p-8 text-center shadow-lg shadow-jet-black/20">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sea-green/20">
            <svg className="h-7 w-7 text-sea-green" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h2 className="font-heading text-xl font-bold text-white">Cadastro realizado!</h2>
          <p className="font-body mt-2 text-sm font-normal text-sky-blue">
            Sua conta foi criada com sucesso.
          </p>
          <Button className="mt-6 w-full py-3 rounded-lg font-body font-semibold text-jet-black bg-sea-green transition-colors duration-300 ease-in-out hover:bg-air-blue hover:text-white active:bg-slate-deep active:text-white focus:outline-none focus:ring-2 focus:ring-sky-blue focus:ring-offset-2 focus:ring-offset-jet-black" onClick={onNavigateToLogin}>
            Ir para o login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-jet-black via-slate-deep to-jet-black px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <img src={logo} alt="SIVA" className="mx-auto mb-4 h-20 w-auto max-w-[200px] object-contain" />
          <h1 className="font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Criar conta
          </h1>
          <p className="font-body mt-2 text-sm font-normal text-sky-blue">
            Preencha os dados abaixo para se cadastrar
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-2xl border border-air-blue/20 bg-jet-black p-6 shadow-lg shadow-jet-black/20 sm:p-8"
        >
          <div className="flex flex-col gap-4">
            <Input
              label="Nome completo"
              placeholder="Digite seu nome"
              autoComplete="name"
              value={values.nome}
              onChange={handleChange('nome')}
              error={errors.nome}
              labelClassName="font-body font-medium text-white"
              className="font-body w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-jet-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sea-green focus:border-sea-green"
            />

            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              autoComplete="email"
              value={values.email}
              onChange={handleChange('email')}
              error={errors.email}
              labelClassName="font-body font-medium text-white"
              className="font-body w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-jet-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sea-green focus:border-sea-green"
            />

            <div className="flex flex-col gap-1.5 w-full">
              <label htmlFor="senha" className="font-body text-sm font-medium text-white">
                Senha
              </label>
              <div className="relative">
                <input
                  id="senha"
                  type={showSenha ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                  value={values.senha}
                  onChange={handleChange('senha')}
                  aria-invalid={!!errors.senha}
                  aria-describedby={errors.senha ? 'senha-error' : undefined}
                  className={[
                    'w-full rounded-lg border bg-white px-4 py-2 pr-10',
                    'font-body text-sm text-jet-black placeholder:text-gray-400',
                    'transition-all duration-200',
                    'focus:border-sea-green focus:outline-none focus:ring-2 focus:ring-sea-green/20',
                    'hover:border-slate-400',
                    errors.senha ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300',
                  ].join(' ')}
                />
                <button
                  type="button"
                  onClick={() => setShowSenha((v) => !v)}
                  aria-label={showSenha ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent text-air-blue hover:text-sea-green transition-colors"
                >
                  {showSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.senha && (
                <span id="senha-error" className="font-body text-xs text-red-600">
                  {errors.senha}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label htmlFor="confirmar-senha" className="font-body text-sm font-medium text-white">
                Confirmar senha
              </label>
              <div className="relative">
                <input
                  id="confirmar-senha"
                  type={showConfirmarSenha ? 'text' : 'password'}
                  placeholder="Repita a senha"
                  autoComplete="new-password"
                  value={values.confirmarSenha}
                  onChange={handleChange('confirmarSenha')}
                  aria-invalid={!!errors.confirmarSenha}
                  aria-describedby={errors.confirmarSenha ? 'confirmar-senha-error' : undefined}
                  className={[
                    'w-full rounded-lg border bg-white px-4 py-2 pr-10',
                    'font-body text-sm text-jet-black placeholder:text-gray-400',
                    'transition-all duration-200',
                    'focus:border-sea-green focus:outline-none focus:ring-2 focus:ring-sea-green/20',
                    'hover:border-slate-400',
                    errors.confirmarSenha ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300',
                  ].join(' ')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmarSenha((v) => !v)}
                  aria-label={showConfirmarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent text-air-blue hover:text-sea-green transition-colors"
                >
                  {showConfirmarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmarSenha && (
                <span id="confirmar-senha-error" className="font-body text-xs text-red-600">
                  {errors.confirmarSenha}
                </span>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="mt-6 w-full py-3 rounded-lg font-body font-semibold text-jet-black bg-sea-green transition-colors duration-300 ease-in-out hover:bg-air-blue hover:text-white active:bg-slate-deep active:text-white focus:outline-none focus:ring-2 focus:ring-sky-blue focus:ring-offset-2 focus:ring-offset-jet-black"
            isLoading={isSubmitting}
          >
            Cadastrar
          </Button>

          <p className="font-body mt-4 text-center text-sm font-normal text-sky-blue">
            Já tem uma conta?{' '}
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="font-body font-medium text-sea-green hover:text-air-blue transition-colors duration-200 cursor-pointer"
            >
              Entrar
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}
