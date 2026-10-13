import { Activity, ArrowRight, Building2, Gauge, Radio, ShieldCheck, Users } from 'lucide-react'
import { Button } from '../components/ui/button'
import logo from '../assets/logo.png'

interface HomeScreenProps {
  onNavigateToLogin: () => void
}

const steps = [
  { icon: Building2, title: '1. Empresa contratante', text: 'O ADMIN cadastra a empresa compradora e seus gestores no painel administrativo.' },
  { icon: Radio, title: '2. Sensor provisionado', text: 'Cada sensor recebe um código de uso gerado pelo sistema e é entregue à empresa.' },
  { icon: Activity, title: '3. Operação monitorada', text: 'Gestores e técnicos acompanham vazão, ordens de serviço e planos de manutenção.' },
]

const products = [
  { icon: Gauge, title: 'Monitoramento de vazão', text: 'Sensores ESP32 com leitura contínua e status online/offline em tempo real.' },
  { icon: ShieldCheck, title: 'Manutenção preventiva', text: 'Planos recorrentes com geração automática de ordens de serviço.' },
  { icon: Users, title: 'Gestão de equipes', text: 'Gestores, técnicos mecânicos e eletricistas organizados por empresa.' },
]

export default function HomeScreen({ onNavigateToLogin }: HomeScreenProps) {
  return (
    <div className="min-h-screen bg-white font-body">
      <header className="sticky top-0 z-30 border-b border-air-blue/20 bg-jet-black">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-2">
            <img src={logo} alt="SIVA" className="h-14 w-auto object-contain" />
          </div>
          <Button
            onClick={onNavigateToLogin}
            className="bg-sea-green text-jet-black hover:bg-air-blue hover:text-white"
          >
            Login <ArrowRight size={16} />
          </Button>
        </div>
      </header>

      <main>
        <section className="bg-gradient-to-br from-jet-black via-slate-deep to-jet-black">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 lg:grid-cols-2 lg:items-center lg:px-6 lg:py-20">
            <div>
              <p className="font-body text-sm font-semibold uppercase tracking-widest text-sea-green">
                Sistema de monitoramento industrial
              </p>
              <h1 className="font-heading mt-3 text-3xl font-bold text-white sm:text-4xl">
                Gestão de empresas, sensores e operações em um só lugar
              </h1>
              <p className="font-body mt-4 text-base text-sky-blue">
                O SIVA conecta sensores de vazão, equipes de manutenção e gestores
                em uma plataforma empresarial moderna e segura.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button onClick={onNavigateToLogin} className="bg-sea-green text-jet-black hover:bg-air-blue hover:text-white">
                  Acessar sistema
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '+120', label: 'Sensores ativos' },
                { value: '24/7', label: 'Monitoramento' },
                { value: '+35', label: 'Empresas' },
                { value: '99%', label: 'Disponibilidade' },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border border-air-blue/20 bg-jet-black/60 p-5">
                  <p className="font-heading text-2xl font-bold text-sea-green">{s.value}</p>
                  <p className="font-body text-sm text-sky-blue">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12 lg:px-6">
          <h2 className="font-heading text-2xl font-bold text-jet-black">Quem somos</h2>
          <p className="font-body mt-3 max-w-3xl text-base text-slate-600">
            Somos uma empresa de tecnologia industrial especializada em monitoramento
            de vazão e gestão de manutenção. Atendemos empresas que precisam de
            controle operacional, rastreabilidade e equipes organizadas por especialidade.
          </p>
        </section>

        <section className="bg-slate-50">
          <div className="mx-auto max-w-6xl px-4 py-12 lg:px-6">
            <h2 className="font-heading text-2xl font-bold text-jet-black">O que é o SIVA</h2>
            <p className="font-body mt-3 max-w-3xl text-base text-slate-600">
              O SIVA é um sistema empresarial para cadastro de empresas e funcionários,
              provisionamento de sensores com código de uso, acompanhamento de ordens
              de serviço e planos de manutenção preventiva e corretiva.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <div key={p.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p.icon size={22} className="text-sea-green" />
                  <h3 className="font-heading mt-3 text-base font-bold text-jet-black">{p.title}</h3>
                  <p className="font-body mt-2 text-sm text-slate-600">{p.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12 lg:px-6">
          <h2 className="font-heading text-2xl font-bold text-jet-black">Como funciona</h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {steps.map((s) => (
              <div key={s.title} className="rounded-2xl bg-jet-black p-6">
                <s.icon size={22} className="text-sea-green" />
                <h3 className="font-heading mt-3 text-base font-bold text-white">{s.title}</h3>
                <p className="font-body mt-2 text-sm text-sky-blue">{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-deep">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-10 lg:flex-row lg:items-center lg:px-6">
            <div>
              <h2 className="font-heading text-xl font-bold text-white">Acesso restrito a usuários autorizados</h2>
              <p className="font-body mt-1 text-sm text-sky-blue">
                Contas são criadas exclusivamente pelo administrador. Não há cadastro público.
              </p>
            </div>
            <Button onClick={onNavigateToLogin} className="bg-sea-green text-jet-black hover:bg-air-blue hover:text-white">
              Fazer login
            </Button>
          </div>
        </section>
      </main>

      <footer className="bg-jet-black px-4 py-6">
        <p className="mx-auto max-w-6xl font-body text-xs text-sky-blue">
          SIVA — Sistema de monitoramento e gestão industrial. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  )
}
