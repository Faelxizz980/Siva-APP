# Casos de Uso — SIVA

> Migrado de `MEMORY.md:Sessão 2026-09-09`.

## 1. Solicitação de Serviço (`solicitacao_servico`)
- Ator: `funcionario|gestor|admin` (`src/pages/solicitacoes.tsx:1` `shouldFilter?` isolamento `empresa_id`) + `tecnico` (só próprias: `solicitante_id=user.id`, chip `OS #id` via `ordemIdBySolicitacao`).
- Fluxo: `Tipo*` (preventiva/inspecao/corretiva) + `Tipo equipamento*` (Sensor/ESP32) `EquipamentoTipoToggle` + `Equipamento*` (`EquipamentoSelect` filtra `ativo`) + `Descricao*` 10-500 + `Data desejada >=hoje` → `status='aberta'`, `solicitante_id=user.id`, `data_solicitada=now`, notifica `sucesso`.
- Validação: exatamente um `sensor_id|esp32_id` XOR.
- Filtros `status/tipo`, `userMap`.

## 1b. Minhas Ordens — visão do técnico (`minhas-ordens.tsx:1`)
- Ator: `tecnico`; login → `homePage='minhas-ordens'`; guard `canAccessRoute` (`App.tsx:144`).
- Origem: `GET /minhas-ordens` quando `USE_API`, senão `ordens.filter(tecnico_id=user.id)` (mock stand-in).
- Tabela nº/ativo/setor/tipo/prioridade (criticidade)/status/prazo, `Atrasada` (`data_limite<hoje`, não concluída/cancelada), filtros status/prioridade/busca.
- Detalhe (`minha-ordem-details-modal.tsx:1`): descrição, ativo/setor/equipamento, procedimento via `plano_manutencao_id→plano→procedimento`, `Iniciar` (`agendada→em_andamento`, `iniciado_em=now`) / `Concluir` (`em_andamento→concluida`, `observacao_execucao` obrigatória, `concluido_em=now`); sem Reagendar/Cancelar.

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

## 1c. ESP32 (`esp32.tsx:1`)
- Ator: admin/gestor (CRUD); técnico read-only sem token.
- Fluxo: `Setor*` + `ESP ID*` (único, dica firmware; 409 → `Já existe um ESP32 com esse ID`) + `Descricao` 100 → `POST /esp32` retorna `{esp32,token}`, sucesso exibe token + Copiar + aviso `header X-Token`; edição avisa se `esp_id` mudar; sem setores → aviso + `Ir para Setores`.
- `Ver token` (`esp32-token-modal.tsx:1`): confirmação antes de revelar + Copiar.

## 1d. Sensores (`sensores.tsx:1`)
- Fluxo: `Ativo*` + `ESP32*` (`esp_id — setor`, aviso + link se vazio) + `ID sensor*` (dica firmware) + `Tag` opcional única (`null` se vazia) + `Descricao` 100 + switch `Ligado` → tabela com `Último contato` (threshold 5min); técnico read-only (sem Editar/Ativar).

## 6. Notificações
- `NotificationBell` badge não lidas (`notification-dropdown.tsx:80` `bg-blue-600`), `NotificationDropdown` `role=dialog`, `Escape`, `mousedown` outside, `aria-live=polite`, `Marcar como lida/todas`, `acaoLabel→onNotificationAction` navega `acaoDestino`, `relativeTime`.
- Portal `document.body` `fixed` (posição do sino `+8px`, `w-[min(24rem,calc(100vw-16px))]`), animação queda `origin-top-right` 180ms, sempre montado (`invisible` + `tabIndex=-1` fechado); exclusividade via `CLOSE_NAV/TOPBAR_MENUS` (`layers.ts:1`); técnico recebe só próprias.

## 7. Setores e Ativos (CRUD local)
- Setores: `setores.tsx:1` grid `1→2→3`, `Novo Setor <Plus>`, empty `Nenhum setor cadastrado`, `Toast`.
- Ativos: `ativos.tsx:1` grid `1→2→3`, `setorMap` memoizado, CRUD com validação setor existente, reflexo imediato.

## 8. Auth
- Login `rafael@etec.com`/`123456` admin → `dashboard` (`requisits.ts:2`), técnica `ana.tecnica@siva.com`/`123456` → `minhas-ordens`, Cadastro mock `setSuccess`, `App.tsx:43` `empresa_id=1`.
- Guard: `canAccessRoute(user,page)` (`permissions.ts:1`) — rota negada redireciona p/ `homePage`; `minhas-ordens` negada p/ admin; 403 → `PlaceholderScreen` `Acesso negado`.
