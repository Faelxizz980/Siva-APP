import type { Esp32 } from '../types/Esp32/esp32.types'
import type { SensorEntity } from '../types/Sensor/sensor.types'
import type { Especialidade } from '../types/Especialidade/especialidade.types'
import type { Procedimento } from '../types/Procedimento/procedimento.types'
import type { PlanoManutencao } from '../types/PlanoManutencao/plano.types'
import type { SolicitacaoServico } from '../types/Solicitacao/solicitacao.types'
import type { OrdemServico } from '../types/OrdemServico/ordem.types'
import type { AuthUser } from '../types/auth/auth.types'
import type { Notificacao } from '../types/Notificacao/notificacao.types'

const now = new Date().toISOString()
const today = new Date().toISOString().slice(0, 10)

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}
function daysFromNow(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString()
}
function dateDaysFromNow(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

// --- Usuários mock (isolados por empresa_id=1) ---
export const mockUsuarios: AuthUser[] = [
  { id: 1, nome: 'Admin SIVA', email: 'admin@siva.com', cpf: '000.000.000-00', empresa_id: 1, nivel: { id: 1, tipo: 'admin', cargo: 'Administrador' }, ativo: true },
  { id: 2, nome: 'Carlos Gestor', email: 'gestor@siva.com', cpf: '111.111.111-11', empresa_id: 1, nivel: { id: 2, tipo: 'gestor', cargo: 'Gestor de Manutenção' }, ativo: true },
  { id: 3, nome: 'Ana Técnica', email: 'ana.tecnica@siva.com', cpf: '222.222.222-22', empresa_id: 1, nivel: { id: 3, tipo: 'tecnico', cargo: 'Técnica Mecânica' }, ativo: true },
  { id: 4, nome: 'Roberto Elétrica', email: 'roberto.tecnico@siva.com', cpf: '333.333.333-33', empresa_id: 1, nivel: { id: 4, tipo: 'tecnico', cargo: 'Técnico Eletricista' }, ativo: true },
  { id: 5, nome: 'Julia Funcionária', email: 'julia@siva.com', cpf: '444.444.444-44', empresa_id: 1, nivel: { id: 5, tipo: 'funcionario', cargo: 'Operadora' }, ativo: true },
  { id: 6, nome: 'Super Admin', email: 'super@siva.com', cpf: '555.555.555-55', empresa_id: null, nivel: { id: 6, tipo: 'super_admin', cargo: 'Super Admin' }, ativo: true },
]

// --- ESP32 ---
export const mockEsp32: Esp32[] = [
  { id: 1, empresa_id: 1, setor_id: 1, esp_id: 'ESP32-001', token: 'tok_esp001', descricao: 'Case Produção Linha 1', ativo: true, ultimo_contato: daysAgo(0), criado_em: now, atualizado_em: now },
  { id: 2, empresa_id: 1, setor_id: 2, esp_id: 'ESP32-002', token: 'tok_esp002', descricao: 'Case Resfriamento Principal', ativo: true, ultimo_contato: daysAgo(1), criado_em: now, atualizado_em: now },
  { id: 3, empresa_id: 1, setor_id: 1, esp_id: 'ESP32-003', token: 'tok_esp003', descricao: 'Case Limpeza Efluentes', ativo: true, ultimo_contato: daysAgo(5), criado_em: now, atualizado_em: now },
  { id: 4, empresa_id: 1, setor_id: 2, esp_id: 'ESP32-004', token: 'tok_esp004', descricao: 'Case Reserva', ativo: false, ultimo_contato: null, criado_em: now, atualizado_em: now },
]

// --- Sensores (entidade) ---
export const mockSensorEntities: SensorEntity[] = [
  { id: 1, empresa_id: 1, ativo_id: 1, esp32_id: 1, sensor_id: 'SENS-001', tag: 'FL-001', descricao: 'Vazão linha 01', ativo: true, criado_em: now, atualizado_em: now },
  { id: 2, empresa_id: 1, ativo_id: 1, esp32_id: 1, sensor_id: 'SENS-002', tag: 'FL-002', descricao: 'Vazão linha 02', ativo: true, criado_em: now, atualizado_em: now },
  { id: 3, empresa_id: 1, ativo_id: 3, esp32_id: 2, sensor_id: 'SENS-003', tag: 'FL-010', descricao: 'Circuito resfriamento', ativo: true, criado_em: now, atualizado_em: now },
  { id: 4, empresa_id: 1, ativo_id: 6, esp32_id: 3, sensor_id: 'SENS-004', tag: 'FL-020', descricao: 'Efluentes saída', ativo: true, criado_em: now, atualizado_em: now },
  { id: 5, empresa_id: 1, ativo_id: 7, esp32_id: 3, sensor_id: 'SENS-005', tag: 'FL-021', descricao: 'Bomba doca', ativo: false, criado_em: now, atualizado_em: now },
]

// --- Especialidades ---
export const mockEspecialidades: Especialidade[] = [
  { id: 1, nome: 'Mecânico', ativo: true },
  { id: 2, nome: 'Eletricista', ativo: true },
  { id: 3, nome: 'Instrumentista', ativo: true },
  { id: 4, nome: 'Hidráulica', ativo: true },
  { id: 5, nome: 'Refrigeração', ativo: true },
]

// --- Procedimentos ---
export const mockProcedimentos: Procedimento[] = [
  { id: 1, empresa_id: 1, nome: 'Preventiva Bomba Principal', supervisor_id: 2, categoria: 'preventiva', descricao: 'Troca de óleo, verificação de vibração e limpeza de filtros.', ativo: true, criado_em: now, atualizado_em: now, especialidade_ids: [1, 2] },
  { id: 2, empresa_id: 1, nome: 'Inspeção Sensores de Vazão', supervisor_id: 3, categoria: 'inspecao', descricao: 'Calibração e verificação de integridade dos sensores.', ativo: true, criado_em: now, atualizado_em: now, especialidade_ids: [3] },
  { id: 3, empresa_id: 1, nome: 'Preventiva Resfriamento', supervisor_id: 2, categoria: 'preventiva', descricao: 'Limpeza de trocadores e verificação de pressão.', ativo: false, criado_em: now, atualizado_em: now, especialidade_ids: [5] },
]

// --- Planos ---
export const mockPlanos: PlanoManutencao[] = [
  { id: 1, empresa_id: 1, procedimento_id: 1, sensor_id: 1, esp32_id: null, periodicidade: 'mensal', data_inicio: today, proxima_geracao: dateDaysFromNow(2), prazo_maximo_dias: 7, ativo: true, criado_em: now, atualizado_em: now },
  { id: 2, empresa_id: 1, procedimento_id: 2, sensor_id: null, esp32_id: 2, periodicidade: 'quinzenal', data_inicio: dateDaysFromNow(-10), proxima_geracao: dateDaysFromNow(-1), prazo_maximo_dias: 5, ativo: true, criado_em: now, atualizado_em: now },
  { id: 3, empresa_id: 1, procedimento_id: 1, sensor_id: 3, esp32_id: null, periodicidade: 'semanal', data_inicio: dateDaysFromNow(-30), proxima_geracao: dateDaysFromNow(7), prazo_maximo_dias: 3, ativo: false, criado_em: now, atualizado_em: now },
]

// --- Solicitações ---
export const mockSolicitacoes: SolicitacaoServico[] = [
  { id: 1, empresa_id: 1, solicitante_id: 5, sensor_id: 1, esp32_id: null, tipo: 'corretiva', status: 'aberta', descricao: 'Sensor FL-001 com vazão oscilando muito, possível entupimento.', data_solicitada: daysAgo(1), data_desejada: daysFromNow(3), atualizado_em: now },
  { id: 2, empresa_id: 1, solicitante_id: 2, sensor_id: null, esp32_id: 2, tipo: 'preventiva', status: 'em_analise', descricao: 'Solicito inspeção preventiva no Case de Resfriamento antes do verão.', data_solicitada: daysAgo(2), data_desejada: null, atualizado_em: now },
  { id: 3, empresa_id: 1, solicitante_id: 5, sensor_id: 4, esp32_id: null, tipo: 'inspecao', status: 'aprovada', descricao: 'Checar vazão de efluentes, valores fora do esperado ontem.', data_solicitada: daysAgo(0), data_desejada: daysFromNow(1), atualizado_em: now },
  { id: 4, empresa_id: 1, solicitante_id: 2, sensor_id: 2, esp32_id: null, tipo: 'corretiva', status: 'agendada', descricao: 'FL-002 com ruído anormal, agendado corretiva.', data_solicitada: daysAgo(5), data_desejada: daysFromNow(0), atualizado_em: now },
]

// --- Ordens ---
export const mockOrdens: OrdemServico[] = [
  { id: 1, solicitacao_id: 4, plano_manutencao_id: null, empresa_id: 1, tecnico_id: 3, sensor_id: 2, esp32_id: null, tipo: 'corretiva', status: 'agendada', descricao: 'Corretiva FL-002 — ruído anormal', observacao_execucao: null, data_agendada: daysFromNow(1), data_limite: daysFromNow(3), aberto_em: daysAgo(1), iniciado_em: null, concluido_em: null, atualizado_em: now },
  { id: 2, solicitacao_id: null, plano_manutencao_id: 1, empresa_id: 1, tecnico_id: null, sensor_id: 1, esp32_id: null, tipo: 'preventiva', status: 'aberta', descricao: 'OS gerada por plano: Preventiva Bomba Principal — FL-001', observacao_execucao: null, data_agendada: dateDaysFromNow(2) + 'T08:00:00.000Z', data_limite: dateDaysFromNow(9) + 'T08:00:00.000Z', aberto_em: daysAgo(0), iniciado_em: null, concluido_em: null, atualizado_em: now },
  { id: 3, solicitacao_id: null, plano_manutencao_id: null, empresa_id: 1, tecnico_id: 4, sensor_id: null, esp32_id: 2, tipo: 'inspecao', status: 'em_andamento', descricao: 'Inspeção avulsa Case Resfriamento', observacao_execucao: 'Iniciada verificação elétrica', data_agendada: daysAgo(0), data_limite: daysFromNow(5), aberto_em: daysAgo(2), iniciado_em: daysAgo(0), concluido_em: null, atualizado_em: now },
  { id: 4, solicitacao_id: null, plano_manutencao_id: 2, empresa_id: 1, tecnico_id: null, sensor_id: null, esp32_id: 2, tipo: 'inspecao', status: 'aberta', descricao: 'OS gerada por plano: Inspeção Sensores de Vazão — ESP32-002', observacao_execucao: null, data_agendada: dateDaysFromNow(-1) + 'T08:00:00.000Z', data_limite: dateDaysFromNow(4) + 'T08:00:00.000Z', aberto_em: daysAgo(1), iniciado_em: null, concluido_em: null, atualizado_em: now },
]

// --- Notificações iniciais ---
export const mockNotificacoes: Notificacao[] = [
  { id: 'n1', tipo: 'alerta', titulo: 'ESP32 sem contato', mensagem: 'ESP32-003 sem contato há 5 dias', timestamp: daysAgo(0), lida: false, relacionadoTipo: 'esp32', relacionadoId: 3 },
  { id: 'n2', tipo: 'sucesso', titulo: 'Solicitação aprovada', mensagem: 'Sua solicitação #3 foi aprovada', timestamp: daysAgo(0), lida: false, acaoLabel: 'Ver solicitação', acaoDestino: 'solicitacoes', relacionadoId: 3, relacionadoTipo: 'solicitacao' },
  { id: 'n3', tipo: 'info', titulo: 'Ordem agendada', mensagem: 'OS #1 agendada para amanhã com Ana Técnica', timestamp: daysAgo(1), lida: true, relacionadoId: 1, relacionadoTipo: 'ordem' },
]
