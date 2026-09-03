# Current — SIVA (2026-09-03)

> Foco da sprint atual. Atualizado após entregas de Setores/Ativos. Nenhum `db.json`/API criado — tudo em memória.

## 🎯 Em Andamento
- _Nenhuma task ativa no momento_ — aguardando definição de próxima prioridade (ver `backlog.md`).

## ✅ Entregue Agora (pronto para QA visual)
- **Microinterações Dashboard** — `CountUp` nos 5 indicadores + `AnimatedList` em Atividades Recentes (sem alterar layout).
- **Setores** — CRUD local completo (`src/pages/setores.tsx:1`) com modais Visualizar/Editar/Excluir + empty state + `Toast`.
- **Ativos** — CRUD local com vínculo `Setor→Ativo` obrigatório via `SectorSelect` (`src/components/ativos/sector-select.tsx:1`), destaque visual do setor e reflexo imediato na listagem.

## 🔜 Próximo (candidate para próxima sessão)
1. **Busca e filtros** em Setores/Ativos (por nome/tag/setor/criticidade) — reaproveitar `DashboardHeader` busca (`src/components/dashboard/header.tsx:23`).
2. **Validação `RESTRICT`** — impedir exclusão de Setor com Ativos vinculados, exibindo modal explicativo (espelha `ON DELETE RESTRICT` do SQL).
3. **Preparar services layer** — criar `src/services/setor.service.ts`/`ativo.service.ts` com interface `list/create/update/remove` mockada, facilitando troca por `fetch` sem alterar páginas.

> Para iniciar: escolher 1 item do `backlog.md` (Alta Prioridade) e mover para cá. Ao concluir, mover para `completed.md` e atualizar `MEMORY.md:Próximos passos`.
