# Memória

## Última sessão — 2026-09-02 — Dashboard SIVA base concluída

Esqueleto completo do Dashboard SIVA (Sistema de Monitoramento de Vazão) entregue no commit `c68db7b base das telas`. Layout `flex h-screen` em `src/pages/dashboard.tsx:18` com sidebar fixa (7 itens com `lucide-react` em `src/components/dashboard/sidebar.tsx:26`), header sticky com busca/notificações/perfil (`src/components/dashboard/header.tsx:11`), 5 cards de indicadores via `StatGrid`/`StatCard` (`src/components/dashboard/stat-grid.tsx:8`, `src/components/dashboard/stat-card.tsx:28`), `ChartArea` com `PeriodFilter` (`7d/15d/30d/90d` em `src/types/dashboard.types.ts:37` e `src/components/dashboard/period-filter.tsx`) em placeholder, `SensorStatus` com grid 2×2 (`src/components/dashboard/sensor-status.tsx:28`), `SensorMap` placeholder (`src/components/dashboard/sensor-map.tsx:3`) e `RecentActivities` scrollável (`src/components/dashboard/recent-activities.tsx:58`). Dados mockados centralizados em `src/data/mock.ts:3` — `mockStats` (5), `mockSensors` (10 com `vazao_atual/vazao_meta`), `mockSensorStatusCounts` (18/4/3/3) e `mockActivities` (8). Dashboard responsivo: sidebar com `translate-x` + overlay `lg:hidden`, grid `sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5`.

Documentação atualizada em 2026-09-02: `README.md` reescrito (substitui template Vite) com visão geral, funcionalidades por arquivo:linha, estrutura, tipos e roadmap. `MEMORY.md` expandido com referências `arquivo:linha`.

## Estrutura atual
- `src/App.tsx:9` — `type Page = 'login'|'cadastro'|'dashboard'`, `useState<Page>` + `useState<AuthUser|null>`, handlers `handleLogin`/`handleLogout`, sem `react-router`
- `src/pages/` — `login.tsx:33` (useForm + validação email/senha, mock `AuthUser` com `cpf` e `nivel.cargo`), `cadastro.tsx`, `dashboard.tsx:18` (composição dos widgets), `perfil.tsx`
- `src/components/ui/` — `input.tsx`, `button.tsx` (prop `isLoading`), `modal.tsx`
- `src/components/dashboard/` — `sidebar.tsx:36` (navItems fixos, `activeItem='dashboard'`, footer `v1.0.0`), `header.tsx:11` (badge 3 notificações, inicial `user.nome.charAt(0)`, `user.nivel.cargo`), `stat-card.tsx:28` (iconMap `droplets/trending-up/radio/alert-triangle/wrench`, `trendColors`), `stat-grid.tsx:8`, `chart-area.tsx:6` (state `period`, placeholder `BarChart3`), `period-filter.tsx`, `sensor-status.tsx:28` (statusConfig com cores `green/slate/amber/blue`), `sensor-map.tsx:3`, `recent-activities.tsx:58` (activityConfig por `tipo`)
- `src/components/profile-modal.tsx` — modal de perfil com `AuthUser`
- `src/data/mock.ts:3` — única fonte de dados mockados
- `src/hooks/use-form.ts` — hook genérico `useForm<T>` com `initialValues`, `validations`, `onSubmit`, `isSubmitting`
- `src/hooks/use.user.ts` — arquivo vazio (reservado)
- `src/types/` — `auth/auth.types.ts:3` (`AuthUser` com `cpf`, `LoginDTO`, `LoginResponse` com `token`), `dashboard.types.ts:1` (`SensorStatus`, `Sensor`, `StatCardData`, `Activity`, `SensorStatusCount`, `PeriodFilter`, `NavigationItem`), `User/`, `Empresa/`, `Nivel/` (`Nivel.tipo`, `cargo`), `Sensor/` (`sensor.types.ts` revisado), `index.ts` (barrel)
- `src/index.css` — Tailwind 4 via `@tailwindcss/vite`, sem `App.css` (removido em `c68db7b`)
- `package.json:12` — `react@19.2.8`, `tailwindcss@4.3.3`, `@tailwindcss/vite@4.3.3`, `lucide-react@1.39.0`, `motion@13.1.1`, `vite@8.2.2`, `oxlint@1.79.0`, `typescript@6.0.2`
- `vite.config.ts`, `tsconfig.*`, `.oxlintrc.json` — config padrão Vite+Oxlint
- `spec/` (7 subpastas vazias: `api/architecture/business-rules/domains/product/requirements/use-cases`), `decisions/` vazio, `tasks/` (backlog/current/completed vazios), `tests/` vazio, `memory/` (4 arquivos vazios), `public/`, `dist/` (build `index-BkGe2t__.css`/`index-CY_60PWt.js`)

## Decisões técnicas
- Navegação por estado ao invés de router para MVP rápido — trade-off: sem deep-link/history, migração futura para `react-router` prevista
- Mock centralizado em `src/data/mock.ts` — facilita troca por services/API
- Tailwind 4 + `@tailwindcss/vite` — sem CSS modular, classes utilitárias organizadas por componente
- `lucide-react` como única lib de ícones — consistência visual
- `motion` instalado mas ainda não usado nos widgets (preparado para animações)

## Sessão — 2026-09-03 — Microinterações + Setores + Ativos

### 1) Microinterações Dashboard (CountUp + AnimatedList)
- Preservação integral de estrutura/layout/identidade SIVA. Apenas microinterações adicionadas, sem novas dependências (`motion`/`framer-motion` já existentes).
- `src/components/ui/count-up.tsx:1` — Componente React Bits CountUp local (`parseValue` + `formatNumber` pt-BR, suporte `2.847 m³`, `24/28`, `1.234,56`), animação `easeOutCubic` 900ms + delay 80ms, `requestAnimationFrame`, respeita `prefers-reduced-motion`, exibe valor final idêntico ao mock.
- `src/components/ui/animated-list.tsx:1` — AnimatedList com `framer-motion` (`initial {opacity:0,y:6} → animate {opacity:1,y:0}`, `stagger 0.055s`, `duration 0.32s`, `willChange`), apenas na montagem, sem alterar `max-h-80 overflow-y-auto`.
- Integração mínima: `src/components/dashboard/stat-card.tsx:9` (`CountUp value={data.value}` dentro do `<p className="text-2xl font-bold">`), `src/components/dashboard/recent-activities.tsx:4` (`<AnimatedList>` envolvendo `mockActivities`). Verificado: `tsc -b` 0, `vite build` 2241 módulos, responsividade/scroll intactos.

### 2) Tela de Setores — frontend/visual sem backend
- Conceito: `SETOR → possui vários ATIVOS`. Sem `db.json`/API/services — estado local `useState` em `src/pages/setores.tsx:1`, preparado para futura troca por API.
- Tipos: `src/types/Setor/setor.types.ts:1` (`Setor {id,empresa_id,nome,descricao,localizacao,ativo,criado_em,atualizado_em}` + `CreateSetorDTO`/`UpdateSetorDTO` com campos UI `descricao/localizacao`), `src/types/Ativo/ativo.types.ts:1` (`Ativo {id,empresa_id,setor_id,nome,tag,tipo,criticidade:'baixa'|'media'|'alta',centro_custo,foto_url,manual_url,descricao,ativo,criado_em,atualizado_em}`).
- Mocks tipados separados: `src/data/setores.mock.ts:1` (`mockSetores` 4: Produção/Resfriamento/Limpeza/Expedição + `mockAtivos` 7 equipamentos/sensores com `setor_id` FK).
- UI auxiliares: `src/components/ui/textarea.tsx:1`, `src/components/ui/select.tsx:1`, `src/components/ui/toast.tsx:1` (auto 3s), `src/components/ui/modal.tsx:3` estendido `size='sm'|'md'|'lg'|'xl'` (`sizeClasses`) para forms maiores sem quebrar `ProfileModal`.
- Componentes `src/components/setores/`: `setor-card.tsx:1` (`Building2/MapPin/Activity` + `Eye/Pencil/Trash2`, badge `Ativo/Inativo`, contagem ativos), `setor-form-modal.tsx:1` (Nome* 2-100, Descrição* 5-255, Localização*, Status dropdown, validação inline), `setor-details-modal.tsx:1` (`size="xl"`, destaque setor, grid infos + `Ativos do Setor` filtrando por `setor_id`, empty dashed), `setor-delete-modal.tsx:1` (confirmação exata + `Cancelar/Excluir` vermelho).
- Página `src/pages/setores.tsx:1` — header `Setores` + `Novo Setor <Plus>`, grid `1→2→3` colunas, empty state `Nenhum setor cadastrado` + botão `Novo Setor`, CRUD local (`max id +1`, `criado_em ISO`), `Toast` feedback, `max-h-[70vh]` nos modais, responsivo sem overflow.

### 3) Tela de Ativos — vínculo obrigatório Setor→Ativo
- Regra principal: ativo sempre pertence a um setor — setor é referência, não texto livre. Dropdown obrigatório, alimentado pelos setores vivos da aplicação.
- DTOs atualizados: `src/types/Ativo/ativo.types.ts:24` (`CreateAtivoDTO` com `centro_custo/foto_url/manual_url`, `criticidade` obrigatória, `setor_id` number).
- Componente reutilizável `src/components/ativos/sector-select.tsx:1` — `SectorSelect({setores,value,onChange})` gera `Select` options `[{''Selecione um setor'}, ...setores.map]`, valida `setor_id` existente, usado tanto no cadastro quanto na edição.
- Componentes `src/components/ativos/`: `ativo-card.tsx:1` (`Cog/Tag/Building2` azul para setor, `AlertTriangle` criticidade `baixa/media/alta`, badges status, `descricao` line-clamp, `Eye/Pencil/Trash2`), `ativo-form-modal.tsx:1` (`size="xl"`, grid 2 col, campos Nome*/Tag* com validação `UNIQUE(tag)` + `Setor*` via `SectorSelect` + Tipo/Criticidade*/CentroCusto/Status/Descrição/FotoURL/ManualURL com `isValidUrl`, permite `Produção→Resfriamento` e reflete imediatamente), `ativo-details-modal.tsx:1` (header `Cog` gradiente `blue-50`, destaque setor `border-2 border-blue-200 bg-blue-50`, `Tag/Tipo/CentroCusto`, `Descrição`, `Foto/Manual` com preview/link, placeholders `Sensores vinculados`/`ESP32` com `Activity/Cpu`), `ativo-delete-modal.tsx:1` (`"Tem certeza que deseja excluir o ativo "Enchedora 01"?"`).
- Página `src/pages/ativos.tsx:1` — header `Ativos` + `Novo Ativo <Plus>`, grid `1→2→3`, empty `Nenhum ativo cadastrado`, `setorMap` memoizado (`Map<id,Setor>`) para resolver `setorNome`/`setor` sem duplicação, CRUD local com validação setor existente.
- Estado compartilhado elevado: `src/App.tsx:14` (`useState<Setor[]>(mockSetores)` + `useState<Ativo[]>(mockAtivos)`) injetado em `SetoresScreen` (`src/pages/setores.tsx:13` agora `setores/setSetores/ativos`) e `AtivosScreen` (`src/pages/ativos.tsx:14`). Garante que `Setores` criado agora aparece no dropdown de `Ativos` sem reload — ligação lógica e visual.
- Navegação: `src/components/dashboard/sidebar.tsx:27` adicionado `{id:'ativos', label:'Ativos', icon:<Cog>}` após Setores; `type Page` estendido `dashboard|setores|ativos` em `src/App.tsx:12`, `DashboardScreen` (`src/pages/dashboard.tsx:13`) agora aceita `onNavigate`.
- Build verificado: `tsc -b` EXIT 0, `vite build` 2256 módulos `391kB`, `oxlint` apenas warnings `set-state-in-effect` esperados, sem `any`, sem novas dependências, `package.json:12` inalterado.

## Estrutura atual (atualizada 2026-09-03)
- `src/App.tsx:12` — `type Page = 'login'|'cadastro'|'dashboard'|'setores'|'ativos'`, `useState<Page>` + `useState<AuthUser|null>` + `useState<Setor[]>`/`useState<Ativo[]>` elevados, handlers `handleLogin`/`handleLogout`, roteamento por estado para `DashboardScreen`/`SetoresScreen`/`AtivosScreen` com `onNavigate`.
- `src/pages/` — `login.tsx:33`, `cadastro.tsx`, `dashboard.tsx:13` (agora com `onNavigate`, CountUp+AnimatedList), `setores.tsx:1` (CRUD local Setores), `ativos.tsx:1` (CRUD local Ativos com SectorSelect), `perfil.tsx`
- `src/components/ui/` — `input.tsx`, `textarea.tsx:1`, `select.tsx:1`, `button.tsx` (`primary/secondary/ghost`), `modal.tsx:3` (`size sm/md/lg/xl`), `toast.tsx:1`, `count-up.tsx:1`, `animated-list.tsx:1`
- `src/components/dashboard/` — `sidebar.tsx:27` (8 itens: Dashboard, Setores, **Ativos**, Sensores, Manutenções, Preventivas, Relatórios, Configurações), `header.tsx:11`, `stat-card.tsx:9` (com CountUp), `stat-grid.tsx:8`, `chart-area.tsx:6`, `sensor-status.tsx:28`, `sensor-map.tsx:3`, `recent-activities.tsx:4` (com AnimatedList)
- `src/components/setores/` — `setor-card.tsx`, `setor-form-modal.tsx`, `setor-details-modal.tsx`, `setor-delete-modal.tsx`
- `src/components/ativos/` — `sector-select.tsx` (reutilizável), `ativo-card.tsx`, `ativo-form-modal.tsx`, `ativo-details-modal.tsx`, `ativo-delete-modal.tsx`
- `src/components/profile-modal.tsx` — modal de perfil com `AuthUser`
- `src/data/` — `mock.ts:3` (dashboard), `setores.mock.ts:1` (`mockSetores` 4 + `mockAtivos` 7 com FK `setor_id`)
- `src/hooks/use-form.ts` — hook genérico
- `src/types/` — `auth/auth.types.ts:3`, `dashboard.types.ts:1`, `Setor/setor.types.ts:1` (com `descricao/localizacao` UI), `Ativo/ativo.types.ts:1` (`AtivoCriticidade`, `foto_url/manual_url`), `User/`, `Empresa/`, `Nivel/`, `Sensor/`, `index.ts` barrel
- `src/index.css` — Tailwind 4, `App.css` vazio
- `package.json:12` — `react@19.2.8`, `tailwindcss@4.3.3`, `@tailwindcss/vite@4.3.3`, `lucide-react@1.39.0`, `motion@13.1.1` (+ `framer-motion` transitivo), `vite@8.2.2`, `oxlint@1.79.0`, `typescript@6.0.2`

## Decisões técnicas (adicionais 2026-09-03)
- Microinterações apenas com `motion` existente — evita nova lib React Bits; `CountUp` via `requestAnimationFrame` + `Intl.NumberFormat pt-BR` preserva formatação exata.
- Estado `setores/ativos` elevado para `App.tsx` em vez de isolado por página — trade-off: prop drilling leve vs. dropdown vivo (requisito `SETOR` dropdown refletir criação imediata). Alternativa Context/Zustand adiada para evitar abstração prematura (`ai.md:23`).
- `SectorSelect` desacoplado de lista fixa — consome `setores` prop, valida `setor_id` existente, reutilizável entre `AtivoForm` e futuras telas.
- `Modal` com `size` prop — mantém compatibilidade `max-w-sm` padrão e permite `lg/xl` para forms/detalhes sem duplicar componente.
- Tags `UNIQUE` validada em frontend (`tag.toLowerCase`) — prepara constraint `UNIQUE(empresa_id,tag)` do SQL sem backend.
- `Ativo` mantém `foto_url/manual_url` opcionais como `string|null` — pronto para upload futuro.
- `AtivoDetails` com seções `Sensores vinculados`/`ESP32` placeholders — arquitetura preparada, sem inventar serviços.

## Próximos passos
- Integrar API real (substituir `mockSetores/mockAtivos` por `services/setor` e `services/ativo`, usar `LoginResponse.token` em `src/types/auth/auth.types.ts:18`, respeitar FKs `fk_setor_empresa`/`fk_ativo_setor` e `UNIQUE`s)
- Adicionar `react-router` e substituir `Page` state em `src/App.tsx:12` (deep-link, history, guard de auth)
- Gráfico real em `src/components/dashboard/chart-area.tsx:19` (`recharts` vs `chart.js`) e mapa real em `src/components/dashboard/sensor-map.tsx:11`
- Implementar upload de `foto_url`/`manual_url` (storage S3) e vinculação `Sensor`→`Ativo`/`ESP32`→`Ativo` (hoje placeholders)
- Relacionamento `Ativo → Manutenções/Preventivas` (telas já previstas no sidebar) e dashboard com contadores reais por criticidade
- Testes `Vitest + Testing Library` em `tests/` (unit: `SectorSelect`, `AtivoForm` validação; e2e: `Setores→Ativos` flow), CI e tokens Tailwind/acessibilidade (focus trap nos modais já com `Escape` + `overflow:hidden`)

## Sessão — 2026-09-09 — Telas SIVA: Solicitações, Ordens, Procedimentos, Planos + Job + Notificações

### Contexto
Implementação completa do fluxo **Solicitação → Ordem → Procedimento/Plano → Geração automática** conforme prompt SIVA com schema `siva_db` + extensão (`especialidade`, `procedimento`, `procedimento_equipe`, `plano_manutencao`, `ordem_servico` alterado `tecnico_id NULL` + `plano_manutencao_id` + `data_limite`). Sem novas libs (`react@19.2.8`, `lucide-react@1.39.0`, `motion@13.1.1` apenas) e sem `react-router` — navegação continua por `Page` state (`ai.md:24` preservar padrões).

### Tipos e Mocks (domínio isolado por `empresa_id`)
- Tipos criados: `src/types/Esp32/esp32.types.ts:1` (`Esp32 {esp_id,token,ultimo_contato}`), `src/types/Sensor/sensor.types.ts:11` adicionado `SensorEntity {empresa_id,ativo_id,esp32_id,sensor_id,tag}` mantendo `Sensor` dashboard legado, `src/types/Solicitacao/solicitacao.types.ts:1` (`SolicitacaoServico {sensor_id|esp32_id XOR, tipo preventiva/inspecao/corretiva, status 7}` + `EquipamentoTipo`), `src/types/OrdemServico/ordem.types.ts:1` (`OrdemServico {solicitacao_id NULL, plano_manutencao_id NULL, tecnico_id NULL, data_limite}`), `src/types/Especialidade/especialidade.types.ts:1`, `src/types/Procedimento/procedimento.types.ts:1` (`Procedimento {supervisor_id, categoria preventiva/inspecao, especialidade_ids: number[]}` N:N), `src/types/PlanoManutencao/plano.types.ts:1` (`PlanoManutencao {procedimento_id, sensor_id|esp32_id, periodicidade 7, data_inicio, proxima_geracao, prazo_maximo_dias}` + `PlanoEquipamentoTipo` renomeado para evitar colisão `EquipamentoTipo`), `src/types/Notificacao/notificacao.types.ts:1` (`Notificacao {tipo sucesso/alerta/info/erro, lida, acaoLabel/Destino}` — frontend-only, sem tabela DB), `src/types/Nivel/nivel.types.ts:1` estendido `super_admin`, `src/types/index.ts:1` barrel atualizado.
- Mocks centralizados: `src/data/siva-domain.mock.ts:1` (`mockUsuarios` 6 com `admin/gestor/tecnico/funcionario/super_admin`, `mockEsp32` 4, `mockSensorEntities` 5, `mockEspecialidades` 5, `mockProcedimentos` 3 (2 ativos), `mockPlanos` 3 (2 ativos, ordenados por `proxima_geracao`), `mockSolicitacoes` 4 (aberta/em_analise/aprovada/agendada), `mockOrdens` 4 (agendada/aberta sem técnico/em_andamento), `mockNotificacoes` 3). Isolamento `empresa_id=1` em todos (`App.tsx:43` filtra).
- Utils: `src/utils/periodicidade.ts:1` (`avancarProximaGeracao` com `setMonth/setFullYear` calendário real, `calcularDataLimite`, `gerarOrdensAutomatica` com `JobResult {planosProcessados,ordensGeradas,erros,logs}`), `src/utils/format.ts:1` (`formatDateBR`, `relativeTime`), `src/utils/cn.ts:1`.

### JOB — Geração Automática de OS
- `src/utils/periodicidade.ts:45` — `gerarOrdensAutomatica(planos, procedimentos, ordens, hojeISO, criarNotificacao)` seleciona `ativo && proxima_geracao <= hoje`, cria `ordem_servico {tipo=procedimento.categoria, status='aberta', tecnico_id=NULL, data_agendada=proxima_geracao 08:00, data_limite=proxima_geracao+prazo_maximo_dias}`, avança `proxima_geracao` em loop até `>hoje` (safety 100). Decisão explícita ciclos perdidos: **gera 1 OS e pula para próximo futuro** (não N OS), logado `[ATRASO]` — evita explosão. Dispara `createNotificacao` + `console.log` auditoria. Exposto em `src/App.tsx:108` `handleRunJob` e botões `src/pages/planos.tsx:140` + `src/pages/dashboard.tsx:44` "Rodar Job (hoje)".

### Tela 5 — Notificações (reutilizável, acessível)
- `src/components/notificacoes/notification-dropdown.tsx:1` — `NotificationBell` (badge `não lidas`, `aria-label`) + `NotificationDropdown` (`role=dialog aria-modal`, `Escape`, `mousedown` outside, `aria-live=polite`, `max-h-80`, lista empilhada com `iconMap/tipo` `CheckCircle2/AlertTriangle/Info/XCircle`, `relativeTime`, `Marcar como lida` + `Marcar todas`, `acaoLabel` → `onNotificationAction` navega `acaoDestino`). Integrado em `src/components/dashboard/header.tsx:1` (`useState notifOpen`, `notifications` props). Estado elevado `src/App.tsx:43` `useState<Notificacao[]>(mockNotificacoes)` + `pushNotificacao`, `handleMarkAsRead/All`, `handleNotifAction` (marca lida + `setPage`).

### Shared
- `src/components/shared/equipamento-select.tsx:1` — `EquipamentoSelect({tipo, sensores, esp32s})` filtra `ativo`, exibe `tag — descricao`, + `EquipamentoTipoToggle` (Sensor/ESP32) reutilizado Telas 1,2,4.

### Tela 1 — Solicitações (`solicitacao_servico`)
- `src/components/solicitacoes/solicitacao-form-modal.tsx:1` — campos `Tipo*` select, `Tipo equipamento*` toggle, `Equipamento*` dependente, `Descricao*` textarea 10-500, `Data desejada` date `>=hoje`; validação `exatamente um sensor/esp32`. `onSubmit` cria `status='aberta'`, `solicitante_id=user.id`, `empresa_id=user.empresa_id`, `data_solicitada=now`.
- `src/components/solicitacoes/solicitacao-card.tsx:1` — `statusStyles` 7 + `tipoStyles` 3, ícone `Radio/Cpu`, sanitiza `sensor_id|null` XOR.
- `src/pages/solicitacoes.tsx:1` — CRUD local `max id+1`, filtros `status/tipo`, isolamento empresa, `userMap`. Notifica `sucesso` ao criar. Empty `ClipboardList`.

### Tela 3 — Procedimentos (`procedimento` + `procedimento_equipe`)
- `src/components/procedimentos/procedimento-card.tsx:1` — `categoria` badge, `equipe` chips `ShieldCheck`, supervisor nome, `ativo` toggle, aviso `Em uso por plano ativo`.
- `src/components/procedimentos/procedimento-form-modal.tsx:1` — `Nome*` único por empresa (valida `procedimentos.some` case-insensitive), `Supervisor*` filtra `gestor/admin/tecnico/super_admin`, `Categoria*`, `Descricao`, `Equipe*` multi-toggle + inline `Nova especialidade` (valida duplicado, cria `Especialidade` local `max id+1`), ao remover especialidade em uso confirma `window.confirm` com `planosUsandoIds`. Cria `procedimento_equipe` via `especialidade_ids`.
- `src/pages/procedimentos.tsx:1` — listagem busca por nome + filtro categoria, `especialidadesEmUso` Set de planos ativos, `canManage` `gestor|admin|super_admin`, inativação `ativo=false` (procedimento inativo não aparece em `Planos`).

### Tela 4 — Planos (`plano_manutencao`)
- `src/components/planos/plano-form-modal.tsx:1` — `Procedimento*` select só `ativo=true` (mostra categoria/equipe read-only), `Tipo equipamento*` + `Equipamento*` (apenas criação, edição bloqueia equipamento), `Periodicidade*` 7, `Data início*` `>=hoje` (só criação), `Prazo*` select 3/5/7/15/30. Validação `periodicidade/data_inicio/prazo>0`. Criação `proxima_geracao=data_inicio`, `ativo=true`. Edição só `periodicidade/prazo` sem recalcular `proxima_geracao` retroativo (`src/pages/planos.tsx:74`).
- `src/components/planos/plano-card.tsx:1` — ordenado `proxima_geracao` asc, `isAtrasado` amber, `prazo_maximo_dias`, ações `Histórico/Editar/Inativar`.
- `src/components/planos/plano-historico-modal.tsx:1` — lista `ordens.filter(plano_manutencao_id)` com `status` e `data_limite`.
- `src/pages/planos.tsx:1` — `canManage` gestor/admin, `handleRunJob` prop, inativação interrompe geração sem apagar histórico.

### Tela 2 — Ordens (`ordem_servico` + agenda)
- `src/components/ordens/ordem-form-modal.tsx:1` — 2 origens: `solicitacaoPrefill` (herda `tipo/sensor|esp32/descricao`, `solicitacao_id` vinculado) + `ordemEditing` (reagendamento) + avulsa (branco). Campos `Tipo*`, `Equipamento*` (toggle só avulsa, prefill mostra read-only box), `Tecnico*` select só `nivel.tipo='tecnico'`, `Data agendada*` `datetime-local` futura, `Descricao*`. `onSubmit` cria `status='agendada'` se `tecnico_id` else `'aberta'`, atualiza `solicitacao.status='agendada'` se origem.
- `src/components/ordens/ordem-card.tsx:1` — equipLabel, técnico nome ou `Sem técnico` amber, origem `Plano/Solic./Avulsa`, `data_limite`, conflito visual `AlertTriangle`, ações `Reagendar/Cancelar/Iniciar/Concluir` (pontos extensão claros, disabled `cancelada|concluida`).
- `src/pages/ordens.tsx:1` — `canSchedule` `tecnico|gestor|admin`, faixa `Solicitações aguardando` (`status IN aberta/em_analise/aprovada`) com botão `Agendar`, filtros `status/tecnico`, `viewMode lista|agenda` (agenda agrupa `Map<YYYY-MM-DD, Ordem[]>`, ordena por `data_agendada`), detecção conflito `Map tecnico-dia` marca `conflitoIds` Set (aviso não bloqueio), inclui OS de plano `aberta sem técnico` para atribuir.

### Integração `App` + `Sidebar` + `Header`
- `src/App.tsx:1` — `type Page` expandido `dashboard|setores|ativos|solicitacoes|ordens|procedimentos|planos` (8), estados elevados (`setores/ativos/usuarios/sensores/esp32/especialidades/procedimentos/planos/solicitacoes/ordens/notificacoes`), `handleLogin` força `empresa_id=1`, `pushNotificacao/handleMarkAsRead/handleNotifAction/handleRunJob`, `nav` + `headerNotifProps` injetados em todas as páginas. `src/components/dashboard/sidebar.tsx:27` 11 itens (novos `Solicitações ClipboardList`, `Ordens Wrench`, `Procedimentos ScrollText`, `Planos CalendarDays`). `src/pages/dashboard.tsx:18` + `setores.tsx:16` + `ativos.tsx:16` atualizados para `notifications` props. `src/pages/login.tsx:18` fix validação `email` (removido `MOCK_EMAIL` check quebrado).
- Build: `tsc -b` OK, `vite build` 2275 módulos `466kB` gzip 131kB, `oxlint` apenas `set-state-in-effect` warnings esperados, `package.json:12` inalterado (sem novas deps).

### Pendência — Mudanças estruturais previstas (AVISO)
Conforme solicitação, **haverá mudanças na estrutura de `ordem_servico`, `plano_manutencao` e `procedimento`** — telas acima foram implementadas desacopladas (DTOs + mocks + utils) para absorver migração sem rewrite total:
- `ordem_servico`: colunas `plano_manutencao_id`, `data_limite`, `tecnico_id NULL` já tipadas em `src/types/OrdemServico/ordem.types.ts:1` e usadas em `src/utils/periodicidade.ts:1` e `src/pages/ordens.tsx:1`; qualquer nova coluna (ex `prioridade`, `anexos`, `checklist`) entra no `OrdemServico` + `CreateOrdemDTO` sem quebrar grid/agenda.
- `plano_manutencao`: `periodicidade/proxima_geracao/prazo_maximo_dias` centralizados em `src/types/PlanoManutencao/plano.types.ts:1` e `src/utils/periodicidade.ts:1`; mudanças de enum (ex `anual_custom`) só exigem atualizar `Periodicidade` + `avancarProximaGeracao`.
- `procedimento`/`procedimento_equipe`: `especialidade_ids` array em `src/types/Procedimento/procedimento.types.ts:1` abstrai tabela N:N; se `procedimento` ganhar `versao`/`anexo`/`checklist`, estender `Procedimento` + `ProcedimentoFormModal` mantendo `procedimento_equipe` sync.
- Notificações: hoje `src/types/Notificacao/notificacao.types.ts:1` é mock em memória; migração para tabela `notificacao` ou push (SSE/WS) só troca `pushNotificacao` em `src/App.tsx:43` por service/API, `NotificationDropdown` permanece.
- Telas marcadas com `TODO restructure` implícito: `src/pages/ordens.tsx:1`, `src/pages/planos.tsx:1`, `src/pages/procedimentos.tsx:1` — CRUD local `max id+1` preparado para ser substituído por `services/*` sem alterar UI.

## Estrutura atual (atualizada 2026-09-09)
- `src/App.tsx:12` — `type Page = 'login'|'cadastro'|'dashboard'|'setores'|'ativos'|'solicitacoes'|'ordens'|'procedimentos'|'planos'`, estados elevados `Setor/Ativo/Usuario/SensorEntity/Esp32/Especialidade/Procedimento/PlanoManutencao/SolicitacaoServico/OrdemServico/Notificacao` + handlers `handleLogin` (força `empresa_id=1`) + `pushNotificacao/handleRunJob`, roteamento por estado.
- `src/pages/` — `login.tsx:18` (fix validação), `cadastro.tsx`, `dashboard.tsx:18` (+ `onRunJob`, `notifications`), `setores.tsx:16` (+ `notifications`), `ativos.tsx:16` (+ `notifications`), `solicitacoes.tsx:1` (form condicional sensor/esp32), `ordens.tsx:1` (2 origens + agenda + conflitos), `procedimentos.tsx:1` (multi especialidade inline), `planos.tsx:1` (vincula procedimento+equipamento, `onRunJob`, histórico OS), `perfil.tsx`.
- `src/components/ui/` — `input.tsx`, `textarea.tsx`, `select.tsx`, `button.tsx`, `modal.tsx:3` (`sm/md/lg/xl`), `toast.tsx:1`, `count-up.tsx:1`, `animated-list.tsx:1`
- `src/components/dashboard/` — `sidebar.tsx:27` (11 itens), `header.tsx:1` (integrado `NotificationBell/Dropdown`, `relativeTime`, badge não-lidas), `stat-*`, `chart-area`, `sensor-*`, `recent-activities`
- `src/components/setores/` — 4 cards/modais, `src/components/ativos/` — 5 (incl `sector-select`)
- `src/components/solicitacoes/` — `solicitacao-card.tsx:1`, `solicitacao-form-modal.tsx:1`
- `src/components/ordens/` — `ordem-card.tsx:1`, `ordem-form-modal.tsx:1`
- `src/components/procedimentos/` — `procedimento-card.tsx:1`, `procedimento-form-modal.tsx:1`
- `src/components/planos/` — `plano-card.tsx:1`, `plano-form-modal.tsx:1`, `plano-historico-modal.tsx:1`
- `src/components/notificacoes/` — `notification-dropdown.tsx:1` (reutilizável, `aria-live`, focus trap)
- `src/components/shared/` — `equipamento-select.tsx:1` (`EquipamentoSelect` + `EquipamentoTipoToggle`)
- `src/data/` — `mock.ts:3` (dashboard), `setores.mock.ts:1`, `siva-domain.mock.ts:1` (domínio completo isolado `empresa_id=1`)
- `src/utils/` — `periodicidade.ts:1` (job + avanço calendário real), `format.ts:1`, `cn.ts:1`
- `src/types/` — `auth/`, `Empresa/`, `Nivel/` (+ `super_admin`), `User/`, `Setor/`, `Ativo/`, `Sensor/` (+ `SensorEntity`), `Esp32/`, `Solicitacao/`, `OrdemServico/`, `Especialidade/`, `Procedimento/`, `PlanoManutencao/`, `Notificacao/`, `dashboard.types.ts:1`, `index.ts` barrel
- `src/hooks/use-form.ts`, `src/index.css` Tailwind 4, `package.json:12` inalterado (`react@19.2.8`, `tailwindcss@4.3.3`, `lucide-react@1.39.0`, `motion@13.1.1`)

## Decisões técnicas (adicionais 2026-09-09)
- `EquipamentoTipo` duplicado resolvido renomeando `PlanoManutencao` para `PlanoEquipamentoTipo` (`src/types/PlanoManutencao/plano.types.ts:10`) — evita colisão barrel `index.ts`.
- `Tecnico` filtrado apenas por `nivel.tipo='tecnico'` da empresa (`src/pages/ordens.tsx:19`) — confirmar se técnicos são da empresa cliente ou fornecedora; hoje usa `mockUsuarios` isolados.
- `gerarOrdensAutomatica` roda em memória `App.tsx:108` (botão manual) — trade-off MVP sem cron/worker; migração para `node-cron`/`pg_cron`/`BullMQ` só move `src/utils/periodicidade.ts:1` para backend, interface permanece.
- `Notificacao` frontend-only (`src/types/Notificacao/notificacao.types.ts:1`) — sem `CREATE TABLE notificacao`; decisão explícita `ai.md:24` não inventar tabela sem confirmar; `NotificationDropdown` recebe `props` e logs vão para `console.log`.
- Validação condicional `sensor_id XOR esp32_id` feita no `EquipamentoTipoToggle` + `EquipamentoSelect` (toggle limpa `equipId`) — garante nunca ambos/nulo (`ai.md:7` tipagem forte).
- Inativação lógica `ativo=false` para `procedimento/plano` (`src/pages/procedimentos.tsx:122`, `src/pages/planos.tsx:119`) preserva histórico `ordem_servico` já geradas — alinhado ao schema original `ativo BOOLEAN DEFAULT TRUE`.
- Prop drilling elevado em `App.tsx` (9 estados) mantido por simplicidade (`ai.md:23` evitar abstração prematura); próxima etapa Context/Zustand se escalar.

## Próximos passos (atualizado — com mudanças pendentes)
- **REFATORAR estruturas** `ordem_servico`/`plano_manutencao`/`procedimento` conforme novo schema a ser definido — telas desacopladas via DTOs, migração pontual em `src/types/*`, `src/utils/periodicidade.ts:1` e `src/data/siva-domain.mock.ts:1`.
- Integrar API real (substituir mocks por `services/*` com `empresa_id` + `token` `LoginResponse`, respeitar FKs `fk_plano_procedimento`, `UNIQUE(empresa_id,nome)` procedimento, `UNIQUE(procedimento_id,especialidade_id)`).
- Adicionar `react-router` e substituir `Page` state `src/App.tsx:12` (deep-link, guards por `NivelTipo`).
- Implementar upload `foto_url/manual_url` e vinculação real `Sensor→Ativo/ESP32` (hoje `SensorEntity` mock).
- Gráfico/mapa reais (`recharts`/`leaflet`) e dashboard contadores por `criticidade`/`periodicidade`.
- Testes `Vitest` cobrindo `periodicidade` (ciclos perdidos), validação `solicitacao/ordem/plano/procedimento` e fluxos `Solicitação→Ordem`/`Plano→Job→Ordem` + `Notificação`; CI e `focus trap` já com `Escape`/`overflow:hidden`.
