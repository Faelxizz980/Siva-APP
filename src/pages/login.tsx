import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { useForm } from '../hooks/use-form'
import type { AuthUser } from '../types'
import { loginRequest, storeToken } from '../services/auth.service'
import logo from '../assets/logo.png'

interface LoginFormValues {
  email: string
  senha: string
}

const initialValues: LoginFormValues = {
  email: '',
  senha: '',
}

const validations = {
  email: (value: string): string | null => {
    if (!value.trim()) return 'Email é obrigatório'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'Email inválido'
    return null
  },
  senha: (value: string): string | null => {
    if (!value) return 'Senha é obrigatória'
    if (value.length < 6) return 'Senha deve ter no mínimo 6 caracteres'
    return null
  },
}

interface LoginScreenProps {
  onLogin: (user: AuthUser) => void
  onBackToHome?: () => void
}

export default function LoginScreen({ onLogin, onBackToHome }: LoginScreenProps) {
  const [showSenha, setShowSenha] = useState(false)
  const { values, errors, isSubmitting, handleChange, handleSubmit, setFieldError } =
    useForm<LoginFormValues>({
      initialValues,
      validations,
      onSubmit: async (formValues) => {
        try {
          const res = await loginRequest({ email: formValues.email, senha: formValues.senha })
          storeToken(res.token)
          onLogin(res.user)
        } catch {
          setFieldError('senha', 'Email ou senha incorretos')
        }
      },
    })

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-jet-black via-slate-deep to-jet-black px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <img src={logo} alt="SIVA" className="mx-auto mb-4 h-20 w-auto max-w-[200px] object-contain" />
          <h1 className="font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Entrar
          </h1>
          <p className="font-body mt-2 text-sm font-normal text-sky-blue">
            Acesse sua conta para continuar
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-2xl border border-air-blue/20 bg-jet-black p-6 shadow-lg shadow-jet-black/20 sm:p-8"
        >
          <div className="flex flex-col gap-4">
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
                  placeholder="Digite sua senha"
                  autoComplete="current-password"
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
          </div>

          <Button
            type="submit"
            className="mt-6 w-full py-3 rounded-lg font-body font-semibold text-jet-black bg-sea-green transition-colors duration-300 ease-in-out hover:bg-air-blue hover:text-white active:bg-slate-deep active:text-white focus:outline-none focus:ring-2 focus:ring-sky-blue focus:ring-offset-2 focus:ring-offset-jet-black"
            isLoading={isSubmitting}
          >
            Entrar
          </Button>

          {onBackToHome && (
            <button
              type="button"
              onClick={onBackToHome}
              className="font-body mx-auto mt-4 block text-sm font-medium text-sky-blue hover:text-sea-green transition-colors cursor-pointer"
            >
              ← Voltar à página inicial
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
