import type { Sensor, StatCardData, Activity, SensorStatusCount } from '../types/dashboard.types'

export const mockStats: StatCardData[] = [
  {
    id: 'consumo-atual',
    label: 'Consumo Atual',
    value: '2.847 m³',
    trend: '+12% vs ontem',
    trendDirection: 'up',
    icon: 'droplets',
  },
  {
    id: 'consumo-diario',
    label: 'Consumo Diário',
    value: '18.320 m³',
    trend: '-3% média semanal',
    trendDirection: 'down',
    icon: 'trending-up',
  },
  {
    id: 'sensores-ativos',
    label: 'Sensores Ativos',
    value: '24/28',
    trend: '86% disponível',
    trendDirection: 'neutral',
    icon: 'radio',
  },
  {
    id: 'alertas',
    label: 'Alertas',
    value: '3',
    trend: '2 urgentes',
    trendDirection: 'up',
    icon: 'alert-triangle',
  },
  {
    id: 'manutencoes',
    label: 'Manutenções Pendentes',
    value: '5',
    trend: '1 atrasada',
    trendDirection: 'up',
    icon: 'wrench',
  },
]

export const mockSensors: Sensor[] = [
  { id: 1, nome: 'S-001', setor: 'Produção', status: 'online', ultima_leitura: '2 min atrás', vazao_atual: 145.2, vazao_meta: 150 },
  { id: 2, nome: 'S-002', setor: 'Produção', status: 'online', ultima_leitura: '1 min atrás', vazao_atual: 132.8, vazao_meta: 150 },
  { id: 3, nome: 'S-003', setor: 'Administrativo', status: 'alerta', ultima_leitura: '5 min atrás', vazao_atual: 89.5, vazao_meta: 80 },
  { id: 4, nome: 'S-004', setor: 'Refeitório', status: 'online', ultima_leitura: '3 min atrás', vazao_atual: 67.3, vazao_meta: 70 },
  { id: 5, nome: 'S-005', setor: 'Jardim', status: 'offline', ultima_leitura: '2h atrás', vazao_atual: 0, vazao_meta: 40 },
  { id: 6, nome: 'S-006', setor: 'Estoque', status: 'manutencao', ultima_leitura: '1 dia atrás', vazao_atual: 0, vazao_meta: 60 },
  { id: 7, nome: 'S-007', setor: 'Produção', status: 'online', ultima_leitura: '1 min atrás', vazao_atual: 128.9, vazao_meta: 150 },
  { id: 8, nome: 'S-008', setor: 'Administrativo', status: 'online', ultima_leitura: '4 min atrás', vazao_atual: 42.1, vazao_meta: 50 },
  { id: 9, nome: 'S-009', setor: 'Refeitório', status: 'alerta', ultima_leitura: '8 min atrás', vazao_atual: 78.2, vazao_meta: 70 },
  { id: 10, nome: 'S-010', setor: 'Estoque', status: 'online', ultima_leitura: '2 min atrás', vazao_atual: 55.0, vazao_meta: 60 },
]

export const mockSensorStatusCounts: SensorStatusCount[] = [
  { status: 'online', count: 18, label: 'Online' },
  { status: 'offline', count: 4, label: 'Offline' },
  { status: 'alerta', count: 3, label: 'Em Alerta' },
  { status: 'manutencao', count: 3, label: 'Em Manutenção' },
]

export const mockActivities: Activity[] = [
  { id: 1, tipo: 'alerta', descricao: 'Vazão acima do limite permitido detectada', timestamp: '10:32', sensor: 'S-003', setor: 'Administrativo' },
  { id: 2, tipo: 'manutencao', descricao: 'Manutenção preventiva agendada para S-006', timestamp: '09:15', sensor: 'S-006', setor: 'Estoque' },
  { id: 3, tipo: 'leitura', descricao: 'Leitura automática concluída com sucesso', timestamp: '09:00', sensor: 'S-001', setor: 'Produção' },
  { id: 4, tipo: 'sistema', descricao: 'Backup dos dados do sistema realizado', timestamp: '08:00' },
  { id: 5, tipo: 'alerta', descricao: 'Sensor S-009 com vazão acima da meta', timestamp: '07:45', sensor: 'S-009', setor: 'Refeitório' },
  { id: 6, tipo: 'manutencao', descricao: 'Calibração do sensor S-010 concluída', timestamp: 'Ontem 16:30', sensor: 'S-010', setor: 'Estoque' },
  { id: 7, tipo: 'leitura', descricao: 'Relatório diário de consumo gerado', timestamp: 'Ontem 18:00' },
  { id: 8, tipo: 'sistema', descricao: 'Novo sensor S-011 cadastrado no setor', timestamp: 'Ontem 14:20', sensor: 'S-011', setor: 'Produção' },
]
