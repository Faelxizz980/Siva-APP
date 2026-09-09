import { useState, useCallback } from 'react'
import LoginScreen from './pages/login'
import CadastroScreen from './pages/cadastro'
import DashboardScreen from './pages/dashboard'
import SetoresScreen from './pages/setores'
import AtivosScreen from './pages/ativos'
import SolicitacoesScreen from './pages/solicitacoes'
import OrdensScreen from './pages/ordens'
import ProcedimentosScreen from './pages/procedimentos'
import PlanosScreen from './pages/planos'
import type { AuthUser } from './types'
import type { Setor } from './types/Setor/setor.types'
import type { Ativo } from './types/Ativo/ativo.types'
import type { SolicitacaoServico } from './types/Solicitacao/solicitacao.types'
import type { OrdemServico } from './types/OrdemServico/ordem.types'
import type { Procedimento } from './types/Procedimento/procedimento.types'
import type { Especialidade } from './types/Especialidade/especialidade.types'
import type { PlanoManutencao } from './types/PlanoManutencao/plano.types'
import type { SensorEntity } from './types/Sensor/sensor.types'
import type { Esp32 } from './types/Esp32/esp32.types'
import type { Notificacao, CreateNotificacaoDTO } from './types/Notificacao/notificacao.types'
import { mockSetores, mockAtivos } from './data/setores.mock'
import {
  mockUsuarios,
  mockEsp32,
  mockSensorEntities,
  mockEspecialidades,
  mockProcedimentos,
  mockPlanos,
  mockSolicitacoes,
  mockOrdens,
  mockNotificacoes,
} from './data/siva-domain.mock'
import { gerarOrdensAutomatica } from './utils/periodicidade'

type Page = 'login' | 'cadastro' | 'dashboard' | 'setores' | 'ativos' | 'solicitacoes' | 'ordens' | 'procedimentos' | 'planos'

export default function App() {
  const [page, setPage] = useState<Page>('login')
  const [user, setUser] = useState<AuthUser | null>(null)

  const [setores, setSetores] = useState<Setor[]>(() => mockSetores)
  const [ativos, setAtivos] = useState<Ativo[]>(() => mockAtivos)
  const [usuarios] = useState<AuthUser[]>(() => mockUsuarios)
  const [sensores] = useState<SensorEntity[]>(() => mockSensorEntities)
  const [esp32s] = useState<Esp32[]>(() => mockEsp32)
  const [especialidades, setEspecialidades] = useState<Especialidade[]>(() => mockEspecialidades)
  const [procedimentos, setProcedimentos] = useState<Procedimento[]>(() => mockProcedimentos)
  const [planos, setPlanos] = useState<PlanoManutencao[]>(() => mockPlanos)
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoServico[]>(() => mockSolicitacoes)
  const [ordens, setOrdens] = useState<OrdemServico[]>(() => mockOrdens)
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>(() => mockNotificacoes)

  const handleLogin = (loggedUser: AuthUser) => {
    // garante empresa_id 1 para filtros (mock login vinha null)
    const withEmpresa: AuthUser = { ...loggedUser, empresa_id: loggedUser.empresa_id ?? 1 }
    setUser(withEmpresa)
    setPage('dashboard')
  }

  const handleLogout = () => {
    setUser(null)
    setPage('login')
  }

  const pushNotificacao = useCallback((dto: CreateNotificacaoDTO) => {
    const nova: Notificacao = {
      id: `n${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
      tipo: dto.tipo,
      titulo: dto.titulo,
      mensagem: dto.mensagem,
      timestamp: new Date().toISOString(),
      lida: false,
      acaoLabel: dto.acaoLabel,
      acaoDestino: dto.acaoDestino,
      relacionadoId: dto.relacionadoId,
      relacionadoTipo: dto.relacionadoTipo,
    }
    setNotificacoes((prev) => [nova, ...prev])
  }, [])

  const notify = useCallback(
    (tipo: Notificacao['tipo'], titulo: string, mensagem: string, extra?: Partial<CreateNotificacaoDTO>) => {
      pushNotificacao({ tipo, titulo, mensagem, ...extra })
    },
    [pushNotificacao],
  )

  const handleMarkAsRead = useCallback((id: string) => {
    setNotificacoes((prev) => prev.map((n) => (n.id === id ? { ...n, lida: true } : n)))
  }, [])

  const handleMarkAllAsRead = useCallback(() => {
    setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })))
  }, [])

  const handleNotifAction = useCallback(
    (n: Notificacao) => {
      handleMarkAsRead(n.id)
      if (n.acaoDestino) setPage(n.acaoDestino as Page)
    },
    [handleMarkAsRead],
  )

  const handleRunJob = useCallback(() => {
    const hoje = new Date().toISOString().slice(0, 10)
    const { novosPlanos, novasOrdens, result } = gerarOrdensAutomatica(planos, procedimentos, ordens, hoje, pushNotificacao)
    if (result.ordensGeradas > 0) {
      setPlanos(novosPlanos)
      setOrdens((prev) => [...novasOrdens, ...prev])
      notify('info', 'Job geração OS', `${result.ordensGeradas} OS geradas a partir de ${result.planosProcessados} planos`)
    } else {
      notify('info', 'Job geração OS', 'Nenhum plano para gerar hoje')
    }
    // logs ficam disponíveis em console para auditoria
    console.log('[SIVA Job]', result.logs)
    return result
  }, [planos, procedimentos, ordens, pushNotificacao, notify])

  const nav = (id: string) => setPage(id as Page)

  const headerNotifProps = {
    notifications: notificacoes,
    onMarkAsRead: handleMarkAsRead,
    onMarkAllAsRead: handleMarkAllAsRead,
    onNotificationAction: handleNotifAction,
  }

  if (page === 'dashboard' && user) {
    return <DashboardScreen user={user} onLogout={handleLogout} onNavigate={nav} {...headerNotifProps} onRunJob={handleRunJob} />
  }

  if (page === 'setores' && user) {
    return (
      <SetoresScreen
        user={user}
        onLogout={handleLogout}
        onNavigate={nav}
        setores={setores}
        setSetores={setSetores}
        ativos={ativos}
        {...headerNotifProps}
      />
    )
  }

  if (page === 'ativos' && user) {
    return (
      <AtivosScreen
        user={user}
        onLogout={handleLogout}
        onNavigate={nav}
        setores={setores}
        ativos={ativos}
        setAtivos={setAtivos}
        {...headerNotifProps}
      />
    )
  }

  if (page === 'solicitacoes' && user) {
    return (
      <SolicitacoesScreen
        user={user}
        onLogout={handleLogout}
        onNavigate={nav}
        solicitacoes={solicitacoes}
        setSolicitacoes={setSolicitacoes}
        sensores={sensores}
        esp32s={esp32s}
        onNotify={notify}
        usuarios={usuarios}
        {...headerNotifProps}
      />
    )
  }

  if (page === 'ordens' && user) {
    return (
      <OrdensScreen
        user={user}
        onLogout={handleLogout}
        onNavigate={nav}
        ordens={ordens}
        setOrdens={setOrdens}
        solicitacoes={solicitacoes}
        setSolicitacoes={setSolicitacoes}
        sensores={sensores}
        esp32s={esp32s}
        usuarios={usuarios}
        onNotify={notify}
        {...headerNotifProps}
      />
    )
  }

  if (page === 'procedimentos' && user) {
    return (
      <ProcedimentosScreen
        user={user}
        onLogout={handleLogout}
        onNavigate={nav}
        procedimentos={procedimentos}
        setProcedimentos={setProcedimentos}
        especialidades={especialidades}
        setEspecialidades={setEspecialidades}
        planos={planos}
        usuarios={usuarios}
        onNotify={notify}
        {...headerNotifProps}
      />
    )
  }

  if (page === 'planos' && user) {
    return (
      <PlanosScreen
        user={user}
        onLogout={handleLogout}
        onNavigate={nav}
        planos={planos}
        setPlanos={setPlanos}
        procedimentos={procedimentos}
        especialidades={especialidades}
        sensores={sensores}
        esp32s={esp32s}
        ordens={ordens}
        onNotify={notify}
        onRunJob={handleRunJob}
        {...headerNotifProps}
      />
    )
  }

  if (page === 'cadastro') {
    return <CadastroScreen onNavigateToLogin={() => setPage('login')} />
  }

  return <LoginScreen onLogin={handleLogin} onNavigateToCadastro={() => setPage('cadastro')} />
}
