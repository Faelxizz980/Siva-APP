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
import SensoresScreen from './pages/sensores'
import Esp32Screen from './pages/esp32'
import MinhasOrdensScreen from './pages/minhas-ordens'
import PlaceholderScreen from './pages/placeholder'
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
import { can, canAccessRoute, homePage, notificationsForUser } from './utils/permissions'

type Page = 'login' | 'cadastro' | 'dashboard' | 'setores' | 'ativos' | 'esp32' | 'sensores' | 'minhas-ordens' | 'solicitacoes' | 'ordens' | 'procedimentos' | 'planos' | 'preventivas' | 'relatorios' | 'configuracoes'

export default function App() {
  const [page, setPage] = useState<Page>('login')
  const [user, setUser] = useState<AuthUser | null>(null)

  const [setores, setSetores] = useState<Setor[]>(() => mockSetores)
  const [ativos, setAtivos] = useState<Ativo[]>(() => mockAtivos)
  const [usuarios] = useState<AuthUser[]>(() => mockUsuarios)
  const [sensores, setSensores] = useState<SensorEntity[]>(() => mockSensorEntities)
  const [esp32s, setEsp32s] = useState<Esp32[]>(() => mockEsp32)
  const [especialidades, setEspecialidades] = useState<Especialidade[]>(() => mockEspecialidades)
  const [procedimentos, setProcedimentos] = useState<Procedimento[]>(() => mockProcedimentos)
  const [planos, setPlanos] = useState<PlanoManutencao[]>(() => mockPlanos)
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoServico[]>(() => mockSolicitacoes)
  const [ordens, setOrdens] = useState<OrdemServico[]>(() => mockOrdens)
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>(() => mockNotificacoes)
  const [forbidden, setForbidden] = useState(false)

  const handleLogin = (loggedUser: AuthUser) => {
    // garante empresa_id 1 para filtros (mock login vinha null)
    const withEmpresa: AuthUser = { ...loggedUser, empresa_id: loggedUser.empresa_id ?? 1 }
    setUser(withEmpresa)
    setForbidden(false)
    setPage(homePage(withEmpresa) as Page)
  }

  const handleLogout = () => {
    setUser(null)
    setForbidden(false)
    setPage('login')
  }

  const handleUnauthorized = useCallback(() => {
    setUser(null)
    setForbidden(false)
    setPage('login')
  }, [])

  const handleForbidden = useCallback(() => {
    setForbidden(true)
  }, [])

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

  const nav = (id: string) => {
    setForbidden(false)
    setPage(id as Page)
  }

  // Guard de rota: perfil sem acesso cai na página inicial do perfil.
  const currentPage: Page = user && !canAccessRoute(user, page) ? (homePage(user) as Page) : page

  const headerNotifProps = user
    ? {
        notifications: notificationsForUser(notificacoes, ordens, solicitacoes, user),
        onMarkAsRead: handleMarkAsRead,
        onMarkAllAsRead: handleMarkAllAsRead,
        onNotificationAction: handleNotifAction,
      }
    : {
        notifications: notificacoes,
        onMarkAsRead: handleMarkAsRead,
        onMarkAllAsRead: handleMarkAllAsRead,
        onNotificationAction: handleNotifAction,
      }

  if (forbidden && user) {
    return (
      <PlaceholderScreen
        user={user}
        onLogout={handleLogout}
        onNavigate={nav}
        activeItem={currentPage}
        title="Acesso negado"
        description="Seu perfil não tem permissão para acessar este recurso (erro 403)."
        {...headerNotifProps}
      />
    )
  }

  if (currentPage === 'minhas-ordens' && user) {
    return (
      <MinhasOrdensScreen
        user={user}
        onLogout={handleLogout}
        onNavigate={nav}
        ordens={ordens}
        setOrdens={setOrdens}
        sensores={sensores}
        esp32s={esp32s}
        ativos={ativos}
        setores={setores}
        planos={planos}
        procedimentos={procedimentos}
        onNotify={notify}
        onUnauthorized={handleUnauthorized}
        onForbidden={handleForbidden}
        {...headerNotifProps}
      />
    )
  }

  if (currentPage === 'dashboard' && user) {
    return (
      <DashboardScreen
        user={user}
        onLogout={handleLogout}
        onNavigate={nav}
        {...headerNotifProps}
        onRunJob={can(user, 'job:run') ? handleRunJob : undefined}
      />
    )
  }

  if (currentPage === 'setores' && user) {
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

  if (currentPage === 'ativos' && user) {
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

  if (currentPage === 'solicitacoes' && user) {
    return (
      <SolicitacoesScreen
        user={user}
        onLogout={handleLogout}
        onNavigate={nav}
        solicitacoes={solicitacoes}
        setSolicitacoes={setSolicitacoes}
        sensores={sensores}
        esp32s={esp32s}
        ordens={ordens}
        onNotify={notify}
        usuarios={usuarios}
        {...headerNotifProps}
      />
    )
  }

  if (currentPage === 'ordens' && user) {
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

  if (currentPage === 'procedimentos' && user) {
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

  if (currentPage === 'planos' && user) {
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
        onRunJob={can(user, 'job:run') ? handleRunJob : undefined}
        {...headerNotifProps}
      />
    )
  }

  if (currentPage === 'esp32' && user) {
    return (
      <Esp32Screen
        user={user}
        onLogout={handleLogout}
        onNavigate={nav}
        setores={setores}
        esp32s={esp32s}
        setEsp32s={setEsp32s}
        sensores={sensores}
        {...headerNotifProps}
      />
    )
  }

  if (currentPage === 'sensores' && user) {
    return (
      <SensoresScreen
        user={user}
        onLogout={handleLogout}
        onNavigate={nav}
        setores={setores}
        ativos={ativos}
        sensores={sensores}
        setSensores={setSensores}
        esp32s={esp32s}
        {...headerNotifProps}
      />
    )
  }

  if ((page === 'preventivas' || page === 'relatorios' || page === 'configuracoes') && user) {
    return (
      <PlaceholderScreen
        user={user}
        onLogout={handleLogout}
        onNavigate={nav}
        activeItem={currentPage}
        {...headerNotifProps}
      />
    )
  }

  if (currentPage === 'cadastro') {
    return <CadastroScreen onNavigateToLogin={() => setPage('login')} />
  }

  return <LoginScreen onLogin={handleLogin} onNavigateToCadastro={() => setPage('cadastro')} />
}
