# Current — SIVA (2026-10-07)

> Foco da sprint atual. `MEMORY.md` migrado para `spec/` + `tasks/` em 2026-09-16. Entregas 2026-10-07 movidas para `completed.md`.

## 🎯 Em Andamento
- **Futura Tarefa: Layout, Cores, Fontes, Logo e Novas Páginas** — preparada em `tasks/backlog.md:🔴 Alta Prioridade — Futura Tarefa` e detalhada em `spec/requirements/future-design-system.md`. Escopo: `tailwind.config.js` tokens (`jet-black`/`slate-deep`/`sea-green`/`air-blue`/`sky-blue`), `fontFamily heading/body` (`Inter`/`Manrope` via `@fontsource`), `assets/logo.png` `h-20` em `login.tsx:72`/`cadastro.tsx:89`, inputs `bg-white text-jet-black` com toggle `Eye/EyeOff` (`login.tsx:37`/`cadastro.tsx:50`), e criação de páginas `manutencoes/preventivas/relatorios` — aguardando priorização.
- _Nenhuma task ativa de código no momento_ — próxima ação: mover item de `backlog.md` para cá ao iniciar sprint.

## ✅ Entregue Agora (pronto para QA visual)
- **Navegação agrupada** — `TopNav` com dropdowns `Infraestrutura|Manutenção` + animação de queda, filtro por perfil (técnico sem Dashboard/Relatórios).
- **Sensores** — tabela + filtros + modal (`esp_id — setor`, tag opcional única) (`src/pages/sensores.tsx:1`).
- **ESP32** — tabela + token pós-criação + `Ver token` com confirmação + `src/services/esp32.service.ts:1` (`src/pages/esp32.tsx:1`).
- **Perfil Técnico** — login `ana.tecnica@siva.com` → `Minhas Ordens`, infra read-only, guard de rotas, notificações próprias (`src/utils/permissions.ts:1`, `src/pages/minhas-ordens.tsx:1`).
- **Overlays** — escala z em `src/utils/layers.ts:1` + `:root` (`index.css`), notificações em portal, `api.ts` 401/403 global.

## 🔜 Próximo (candidate para próxima sessão)
- **Microinterações Dashboard** — `CountUp` nos 5 indicadores + `AnimatedList` em Atividades Recentes (sem alterar layout).
- **Setores** — CRUD local completo (`src/pages/setores.tsx:1`) com modais Visualizar/Editar/Excluir + empty state + `Toast`.
- **Ativos** — CRUD local com vínculo `Setor→Ativo` obrigatório via `SectorSelect` (`src/components/ativos/sector-select.tsx:1`), destaque visual do setor e reflexo imediato na listagem.

## 🔜 Próximo (candidate para próxima sessão)
1. **Busca e filtros** em Setores/Ativos (por nome/tag/setor/criticidade) — reaproveitar `DashboardHeader` busca (`src/components/dashboard/header.tsx:23`).
2. **Validação `RESTRICT`** — impedir exclusão de Setor com Ativos vinculados, exibindo modal explicativo (espelha `ON DELETE RESTRICT` do SQL).
3. **Preparar services layer** — criar `src/services/setor.service.ts`/`ativo.service.ts` com interface `list/create/update/remove` mockada, facilitando troca por `fetch` sem alterar páginas.

> Para iniciar: escolher 1 item do `backlog.md` (Alta Prioridade) e mover para cá. Ao concluir, mover para `completed.md` e atualizar `MEMORY.md:Próximos passos`.
