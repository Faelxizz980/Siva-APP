# API e Mocks — SIVA

> Migrado de `MEMORY.md: Estrutura atual` + `Mocks tipados`.

## Fonte Atual (Mock em Memória)
- `src/data/mock.ts:3` — dashboard `mockStats`/`mockSensors`/`mockSensorStatusCounts`/`mockActivities`.
- `src/data/setores.mock.ts:1` — `mockSetores` 4 + `mockAtivos` 7 FK `setor_id`.
- `src/data/siva-domain.mock.ts:1` — domínio isolado `empresa_id=1` (`mockUsuarios` 6, `mockEsp32` 4, `mockSensorEntities` 5, `mockEspecialidades` 5, `mockProcedimentos` 3, `mockPlanos` 3, `mockSolicitacoes` 4, `mockOrdens` 4, `mockNotificacoes` 3) — única fonte, facilita troca por `services/*`.
- `db/requisits.ts:2` — `email='rafael@etec.com'`, `senha='123456'` (auth mock `login.tsx:42`).

## Contratos Previstos (Services)
- `src/services/setor.service.ts` `list/create/update/remove` com `empresa_id`, `UNIQUE(empresa_id,nome)`, `fk_setor_empresa RESTRICT`.
- `src/services/ativo.service.ts` com `setor_id` obrigatório, `UNIQUE(empresa_id,tag)`, `fk_ativo_setor CASCADE`, `foto_url/manual_url` upload S3 presigned URL (`ativo-form-modal.tsx:1`).
- `src/services/solicitacao.service.ts`, `ordem.service.ts`, `procedimento.service.ts`, `plano.service.ts` — DTOs em `src/types/*`, `LoginResponse.token` `Authorization: Bearer`.
- `src/utils/periodicidade.ts:1` será movido para backend `node-cron`/`pg_cron`/`BullMQ`; `pushNotificacao` trocado por SSE/WS.

## Parâmetros
- Todos os mocks isolados `empresa_id=1` (`App.tsx:43` filtro), prontos para multi-tenant.
- `periodidade.ts` usa calendário real `setMonth/setFullYear`, não dias fixos.

## Próximos Passos
- Substituir `max id+1` CRUD local (`setores.tsx:1`, `ativos.tsx:1`, `solicitacoes.tsx:1` etc.) por `fetch` com `empresa_id` + `token`.
- Respeitar FKs e `UNIQUE`s já modeladas; `active=true` default.
