# Casos de Uso — SIVA

> Migrado de `MEMORY.md:Sessão 2026-09-09`.

## 1. Solicitação de Serviço (`solicitacao_servico`)
- Ator: `funcionario|gestor|admin` (`src/pages/solicitacoes.tsx:1` `shouldFilter?` isolamento `empresa_id`).
- Fluxo: `Tipo*` (preventiva/inspecao/corretiva) + `Tipo equipamento*` (Sensor/ESP32) `EquipamentoTipoToggle` + `Equipamento*` (`EquipamentoSelect` filtra `ativo`) + `Descricao*` 10-500 + `Data desejada >=hoje` → `status='aberta'`, `solicitante_id=user.id`, `data_solicitada=now`, notifica `sucesso`.
- Validação: exatamente um `sensor_id|esp32_id` XOR.
- Filtros `status/tipo`, `userMap`.

## 2. Ordem de Serviço (`ordem_servico`) + Agenda
- Atores: `tecnico|gestor|admin` `canSchedule` (`ordens.tsx:1`).
- Origens: (a) `solicitacaoPrefill` herda `tipo/sensor|esp32/descricao` + `solicitacao_id`, (b) reagendamento `ordemEditing`, (c) avulsa.
- Campos: `Tipo*`, `Equipamento*` (toggle só avulsa), `Tecnico*` (`nivel.tipo='tecnico'` empresa), `Data agendada*` `datetime-local` futura, `Descricao*` → `status='agendada'` se `tecnico_id` else `'aberta'`, atualiza `solicitacao.status='agendada'`.
- Visual: `ordem-card.tsx:1` `Sem técnico` amber, `Plano/Solic./Avulsa`, `data_limite`, conflito `AlertTriangle`, ações `Reagendar/Cancelar/Iniciar/Concluir`.
- Lista/Agenda: `viewMode` `lista|agenda`, agenda agrupa `Map<YYYY-MM-DD, Ordem[]>`, conflito `Map tecnico-dia` → `conflitoIds` Set.

## 3. Procedimento (`procedimento` + `procedimento_equipe`)
- Ator: `gestor|admin|super_admin` `canManage` (`procedimentos.tsx:1`).
- Fluxo: `Nome*` único empresa, `Supervisor*`, `Categoria*`, `Descricao`, `Equipe*` multi-toggle + inline `Nova especialidade` → cria `Especialidade` `max id+1`, `especialidade_ids` N:N.
- Card: `categoria` badge, `equipe` chips `ShieldCheck`, aviso `Em uso por plano ativo` (`especialidadesEmUso` Set).
- Inativação `ativo=false` (`procedimentos.tsx:122`) preserva histórico.

## 4. Plano de Manutenção (`plano_manutencao`)
- Ator: `gestor|admin`.
- Fluxo: `Procedimento*` (só `ativo`), `Tipo equipamento*` + `Equipamento*` (só criação), `Periodicidade*` 7, `Data início* >=hoje`, `Prazo*` 3/5/7/15/30 → `proxima_geracao=data_inicio`, `ativo=true`; edição só `periodicidade/prazo` (`planos.tsx:74`).
- Card ordenado `proxima_geracao` asc, `isAtrasado` amber, `Histórico` lista `ordens.filter(plano_manutencao_id)` (`plano-historico-modal.tsx:1`), `onRunJob`.

## 5. Geração Automática (Job)
- Trigger manual `App.tsx:108` `handleRunJob` (`hojeISO`), `planos.tsx:140` + `dashboard.tsx:44` “Rodar Job (hoje)”.
- `gerarOrdensAutomatica` (`periodicidade.ts:45`) → 1 OS por plano atrasado, avança `proxima_geracao` até > hoje, `data_limite = proxima_geracao+prazo`, `tecnico_id=NULL`, `console.log` auditoria, `Notificacao` tipo `info`.

## 6. Notificações
- `NotificationBell` badge não lidas (`notification-dropdown.tsx:80` `bg-blue-600`), `NotificationDropdown` `role=dialog`, `Escape`, `mousedown` outside, `aria-live=polite`, `Marcar como lida/todas`, `acaoLabel→onNotificationAction` navega `acaoDestino`, `relativeTime`.

## 7. Setores e Ativos (CRUD local)
- Setores: `setores.tsx:1` grid `1→2→3`, `Novo Setor <Plus>`, empty `Nenhum setor cadastrado`, `Toast`.
- Ativos: `ativos.tsx:1` grid `1→2→3`, `setorMap` memoizado, CRUD com validação setor existente, reflexo imediato.

## 8. Auth
- Login `rafael@etec.com`/`123456` (`requisits.ts:2`), Cadastro mock `setSuccess`, `App.tsx:43` `empresa_id=1`.
