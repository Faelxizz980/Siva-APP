import type { Periodicidade, PlanoManutencao } from '../types/PlanoManutencao/plano.types'
import type { OrdemServico } from '../types/OrdemServico/ordem.types'
import type { Procedimento } from '../types/Procedimento/procedimento.types'
import type { CreateNotificacaoDTO } from '../types/Notificacao/notificacao.types'

/**
 * Avança data em formato YYYY-MM-DD somando periodicidade.
 * Usa aritmética de calendário real (mês/ano) para não perder dia de referência.
 */
export function avancarProximaGeracao(dataISO: string, periodicidade: Periodicidade): string {
  const d = new Date(dataISO + 'T00:00:00')
  switch (periodicidade) {
    case 'semanal':
      d.setDate(d.getDate() + 7)
      break
    case 'quinzenal':
      d.setDate(d.getDate() + 15)
      break
    case 'mensal':
      d.setMonth(d.getMonth() + 1)
      break
    case 'bimestral':
      d.setMonth(d.getMonth() + 2)
      break
    case 'trimestral':
      d.setMonth(d.getMonth() + 3)
      break
    case 'semestral':
      d.setMonth(d.getMonth() + 6)
      break
    case 'anual':
      d.setFullYear(d.getFullYear() + 1)
      break
  }
  return d.toISOString().slice(0, 10)
}

export function calcularDataLimite(proximaGeracao: string, prazoDias: number): string {
  const d = new Date(proximaGeracao + 'T00:00:00')
  d.setDate(d.getDate() + prazoDias)
  // data_limite como datetime no mesmo horário da geração (08:00 UTC para consistência)
  return d.toISOString()
}

export interface JobResult {
  planosProcessados: number
  ordensGeradas: number
  erros: string[]
  logs: string[]
}

/**
 * DECISÃO DE DESIGN — ciclos perdidos:
 * Se proxima_geracao está muito no passado (job atrasado), geramos **1 OS por plano**
 * (não uma por ciclo perdido) e avançamos proxima_geracao para o **próximo futuro**
 * a partir de HOJE. Motivo: evitar explosão de OS duplicadas e inundar técnicos;
 * plano volta a ficar em dia. Alternativa (gerar N OS) foi documentada mas descartada
 * para MVP. Comportamento é explícito e logado.
 */
export function gerarOrdensAutomatica(
  planos: PlanoManutencao[],
  procedimentos: Procedimento[],
  ordensExistentes: OrdemServico[],
  hojeISO: string, // YYYY-MM-DD
  criarNotificacao: (dto: CreateNotificacaoDTO) => void,
): { novosPlanos: PlanoManutencao[]; novasOrdens: OrdemServico[]; result: JobResult } {
  const hoje = hojeISO
  const nextIdBase = ordensExistentes.length > 0 ? Math.max(...ordensExistentes.map((o) => o.id)) + 1 : 1
  let nextId = nextIdBase
  const novasOrdens: OrdemServico[] = []
  const novosPlanos = planos.map((p) => ({ ...p }))
  const result: JobResult = { planosProcessados: 0, ordensGeradas: 0, erros: [], logs: [] }

  for (const plano of novosPlanos) {
    if (!plano.ativo) continue
    if (plano.proxima_geracao > hoje) continue

    result.planosProcessados++
    const proc = procedimentos.find((pr) => pr.id === plano.procedimento_id)
    if (!proc) {
      const msg = `Plano #${plano.id}: procedimento ${plano.procedimento_id} não encontrado`
      result.erros.push(msg)
      result.logs.push(`[ERRO] ${msg}`)
      continue
    }

    // Detecta atraso multi-ciclo
    const isAtrasado = (() => {
      const expectedNext = avancarProximaGeracao(plano.proxima_geracao, plano.periodicidade)
      return expectedNext <= hoje
    })()
    if (isAtrasado) {
      result.logs.push(`[ATRASO] Plano #${plano.id} proxima_geracao ${plano.proxima_geracao} está atrasado >1 ciclo; gerando 1 OS e pulando para próximo futuro`)
    }

    try {
      const dataLimite = calcularDataLimite(plano.proxima_geracao, plano.prazo_maximo_dias)
      const descricao = `OS gerada por plano: ${proc.nome} — ${plano.sensor_id ? `Sensor #${plano.sensor_id}` : `ESP32 #${plano.esp32_id}`} (${proc.categoria})`

      const novaOS: OrdemServico = {
        id: nextId++,
        solicitacao_id: null,
        plano_manutencao_id: plano.id,
        empresa_id: plano.empresa_id,
        tecnico_id: null,
        sensor_id: plano.sensor_id,
        esp32_id: plano.esp32_id,
        tipo: proc.categoria as OrdemServico['tipo'],
        status: 'aberta',
        descricao,
        observacao_execucao: null,
        data_agendada: new Date(plano.proxima_geracao + 'T08:00:00.000Z').toISOString(),
        data_limite: dataLimite,
        aberto_em: new Date().toISOString(),
        iniciado_em: null,
        concluido_em: null,
        atualizado_em: new Date().toISOString(),
      }
      novasOrdens.push(novaOS)
      result.ordensGeradas++

      // Avança proxima_geracao para próximo futuro (loop até > hoje)
      let proxima = avancarProximaGeracao(plano.proxima_geracao, plano.periodicidade)
      let safety = 0
      while (proxima <= hoje && safety < 100) {
        proxima = avancarProximaGeracao(proxima, plano.periodicidade)
        safety++
      }
      plano.proxima_geracao = proxima
      plano.atualizado_em = new Date().toISOString()

      result.logs.push(`[OK] Plano #${plano.id} -> OS #${novaOS.id} gerada, próxima: ${plano.proxima_geracao}`)

      criarNotificacao({
        tipo: 'info',
        titulo: 'Nova OS gerada por plano',
        mensagem: `${proc.nome} gerou OS #${novaOS.id} (${plano.sensor_id ? `Sensor #${plano.sensor_id}` : `ESP32 #${plano.esp32_id}`})`,
        acaoLabel: 'Ver ordens',
        acaoDestino: 'ordens',
        relacionadoId: novaOS.id,
        relacionadoTipo: 'ordem',
      })
    } catch (e) {
      const msg = `Plano #${plano.id}: ${e instanceof Error ? e.message : String(e)}`
      result.erros.push(msg)
      result.logs.push(`[ERRO] ${msg}`)
    }
  }

  result.logs.unshift(`Job executado em ${new Date().toISOString()}: ${result.planosProcessados} planos, ${result.ordensGeradas} OS geradas`)

  return { novosPlanos, novasOrdens, result }
}
