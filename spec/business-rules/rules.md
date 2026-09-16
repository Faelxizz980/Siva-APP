# Regras de Negócio — SIVA

> Migrado de `MEMORY.md:Decisões técnicas` e sessões 2026-09-03/09.

## Setor → Ativo
- `SETOR possui vários ATIVOS` — `ativo.setor_id` FK obrigatória, `SectorSelect` valida existente (`src/components/ativos/sector-select.tsx:1`), `CreateAtivoDTO` exige `setor_id` `src/types/Ativo/ativo.types.ts:24`.
- `UNIQUE(empresa_id,nome)` setor e `UNIQUE(empresa_id,tag)` ativo — validado frontend `tag.toLowerCase()` `ativo-form-modal.tsx:1`, prepara `UNIQUE` SQL, `ON DELETE RESTRICT` (impedir exclusão setor com ativos).
- `criticidade: 'baixa'|'media'|'alta'` (`AtivoCriticidade`), `centro_custo`, `foto_url/manual_url` `string|null`, `ativo BOOLEAN DEFAULT TRUE`.

## Solicitação → Ordem
- `SolicitacaoServico` `src/types/Solicitacao/solicitacao.types.ts:1` — `sensor_id|esp32_id` XOR (nunca ambos/nulo), `tipo: preventiva|inspecao|corretiva`, `status 7` (`aberta|em_analise|aprovada|agendada|...`), `solicitante_id`, `empresa_id`, `data_solicitada=now`.
- Validação `EquipamentoTipoToggle` limpa `equipId` ao trocar tipo, garante XOR (`ai.md:7` tipagem forte).
- `OrdemServico` `src/types/OrdemServico/ordem.types.ts:1` — `solicitacao_id NULL` (avulsa), `plano_manutencao_id NULL`, `tecnico_id NULL`, `data_limite`, `tipo` herdado de `procedimento.categoria` ou `solicitacao.tipo`, `status 'aberta'` sem técnico else `'agendada'`, `data_agendada` `datetime-local` futura.
- Agendamento (`ordens.tsx:1`): faixa `Solicitações aguardando` (`status IN aberta/em_analise/aprovada`) com `Agendar`, `canSchedule` `tecnico|gestor|admin`, detecção conflito `Map tecnico-dia` (`conflitoIds` Set, aviso não bloqueio), `viewMode lista|agenda` agrupa `Map<YYYY-MM-DD, Ordem[]>`.
- Origens: `solicitacaoPrefill` (vincula `solicitacao_id` e atualiza `solicitacao.status='agendada'`), `ordemEditing` (reagendamento), avulsa.

## Procedimento ↔ Especialidade
- `Procedimento` `src/types/Procedimento/procedimento.types.ts:1` — `supervisor_id`, `categoria preventiva|inspecao`, `especialidade_ids: number[]` abstrai N:N `procedimento_equipe`, `ativo`.
- `Nome` único por empresa (`procedimentos.some` case-insensitive), `Supervisor` filtra `gestor/admin/tecnico/super_admin`, `Equipe` multi-toggle + inline `Nova especialidade` (duplicado check, `max id+1`), remoção com `window.confirm` se `planosUsandoIds`.
- Inativação `ativo=false` (`procedimentos.tsx:122`) não apaga histórico; procedimento inativo não aparece em `Planos`.
- `Especialidade` `src/types/Especialidade/especialidade.types.ts:1` — 5 mocks, criação inline.

## Plano de Manutenção e Job
- `PlanoManutencao` `src/types/PlanoManutencao/plano.types.ts:1` — `procedimento_id` (só `ativo=true`), `sensor_id|esp32_id`, `PlanoEquipamentoTipo` (renomeado para evitar colisão), `periodicidade 7` (`diaria|semanal|quinzenal|mensal|bimestral|semestral|anual`), `data_inicio >=hoje`, `proxima_geracao`, `prazo_maximo_dias` `3/5/7/15/30`, `ativo`.
- Criação `proxima_geracao=data_inicio`, edição só `periodicidade/prazo` sem recalcular retroativo (`planos.tsx:74`), ordenado `proxima_geracao` asc, `isAtrasado` amber.
- `gerarOrdensAutomatica` `src/utils/periodicidade.ts:45` — seleciona `ativo && proxima_geracao <= hoje`, cria `ordem {tipo=procedimento.categoria, status='aberta', tecnico_id=NULL, data_agendada=proxima_geracao 08:00, data_limite=proxima_geracao+prazo}`, avança `proxima_geracao` em loop até `>hoje` (safety 100), **gera 1 OS e pula ciclos perdidos** (não N OS) log `[ATRASO]`, `JobResult {planosProcessados,ordensGeradas,erros,logs}`, `pushNotificacao` + `console.log`.

## Equipamento
- `SensorEntity` `src/types/Sensor/sensor.types.ts:11` `{empresa_id,ativo_id,esp32_id,sensor_id,tag}` + `Esp32` `esp32.types.ts:1` `{esp_id,token,ultimo_contato}` — filtro `ativo` em `EquipamentoSelect` `src/components/shared/equipamento-select.tsx:1`.

## Notificação e Auth
- `Notificacao` `src/types/Notificacao/notificacao.types.ts:1` — `tipo sucesso/alerta/info/erro`, `lida`, `acaoLabel/Destino`, `relacionadoId/Tipo` — frontend-only, sem tabela.
- `Nivel.tipo` estendido `super_admin` `src/types/Nivel/nivel.types.ts:1`, `AuthUser` `cpf`, `empresa_id`, `nivel.cargo` (`auth.types.ts:3`), `handleLogin` força `empresa_id=1` `App.tsx:43`.
