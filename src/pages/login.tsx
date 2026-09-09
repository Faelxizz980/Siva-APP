import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { useForm } from '../hooks/use-form'
import type { AuthUser } from '../types'
import { email as MOCK_EMAIL, senha as MOCK_SENHA } from '../../db/requisits'

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
    if (value.trim().toLowerCase() !== MOCK_EMAIL.trim().toLowerCase())
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
  onNavigateToCadastro: () => void
}

export default function LoginScreen({ onLogin, onNavigateToCadastro }: LoginScreenProps) {
  const { values, errors, isSubmitting, handleChange, handleSubmit, setFieldError } =
    useForm<LoginFormValues>({
      initialValues,
      validations,
      onSubmit: async (formValues) => {
        const normalizedEmail = formValues.email.trim().toLowerCase()
        const isEmailValid = normalizedEmail === MOCK_EMAIL.trim().toLowerCase()
        const isSenhaValid = formValues.senha === MOCK_SENHA

        if (!isEmailValid || !isSenhaValid) {
          if (!isEmailValid) setFieldError('email', 'Email incorreto')
          if (!isSenhaValid) setFieldError('senha', 'Senha incorreta')
          // quando ambos errados, destaca os dois; mensagem genérica também disponível via senha
          if (!isEmailValid && !isSenhaValid) {
            setFieldError('senha', 'Email ou senha incorretos')
          }
          return
        }

        onLogin({
          id: 1,
          nome: formValues.email.split('@')[0],
          email: normalizedEmail,
          cpf: '000.000.000-00',
          empresa_id: null,
          nivel: { id: 1, tipo: 'admin', cargo: 'Administrador' },
          ativo: true,
        })
      },
    })

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/25">
            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Entrar
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Acesse sua conta para continuar
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
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
            />

            <Input
              label="Senha"
              type="password"
              placeholder="Digite sua senha"
              autoComplete="current-password"
              value={values.senha}
              onChange={handleChange('senha')}
              error={errors.senha}
            />
          </div>

          <Button
            type="submit"
            className="mt-6 w-full"
            isLoading={isSubmitting}
          >
            Entrar
          </Button>

          <p className="mt-4 text-center text-sm text-slate-500">
            Não tem uma conta?{' '}
            <button
              type="button"
              onClick={onNavigateToCadastro}
              className="font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200 cursor-pointer"
            >
              Cadastre-se
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}
