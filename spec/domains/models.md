# Domínios e Modelos — SIVA

> Migrado de `MEMORY.md:Estrutura atual` + `Tipos e Mocks` 2026-09-09.

## Tipos (`src/types/`)
- `auth/auth.types.ts:3` — `AuthUser {id,nome,email,cpf,empresa_id,nivel,ativo}`, `LoginDTO`, `LoginResponse {token}`.
- `User/`, `Empresa/`, `Nivel/nivel.types.ts:1` (`tipo: admin|gestor|tecnico|funcionario|super_admin`, `cargo`), `Sensor/sensor.types.ts:1` (`Sensor` dashboard legado + `SensorEntity` `{empresa_id,ativo_id,esp32_id,sensor_id,tag:string|null,descricao}`, `CreateSensorDTO {tag:null se vazia, ativo_status}`, `SENSOR_OFFLINE_THRESHOLD_MINUTES=5`), `Esp32/esp32.types.ts:1` (`{esp_id,token,ultimo_contato}`, `UpdateEsp32DTO.esp_id?`, `Esp32ListItem {setor_nome,sensores_count}`, `ESP32_OFFLINE_THRESHOLD_MINUTES=5`).
- `Setor/setor.types.ts:1` — `Setor {id,empresa_id,nome,descricao,localizacao,ativo,criado_em,atualizado_em}`, `CreateSetorDTO`/`UpdateSetorDTO` com `descricao/localizacao` UI.
- `Ativo/ativo.types.ts:1` — `Ativo {id,empresa_id,setor_id,nome,tag,tipo,criticidade:'baixa'|'media'|'alta',centro_custo,foto_url,manual_url,descricao,ativo,criado_em,atualizado_em}`, `AtivoCriticidade`, `CreateAtivoDTO` com `UNIQUE(tag)`.
- `Solicitacao/solicitacao.types.ts:1` — `SolicitacaoServico {id,empresa_id,solicitante_id,sensor_id|esp32_id,tipo,descricao,data_solicitada,data_desejada,status}`, `EquipamentoTipo`, 7 status.
- `OrdemServico/ordem.types.ts:1` — `OrdemServico {id,empresa_id,solicitacao_id?,plano_manutencao_id?,tecnico_id?,tipo,descricao,data_agendada,data_limite,status}`, `tecnico_id NULL` + `data_limite`.
- `Especialidade/especialidade.types.ts:1` — `Especialidade {id,empresa_id,nome,descricao}`.
- `Procedimento/procedimento.types.ts:1` — `Procedimento {id,empresa_id,nome,descricao,supervisor_id,categoria,especialidade_ids,ativo}`, `categoria preventiva|inspecao`.
- `PlanoManutencao/plano.types.ts:1` — `PlanoManutencao {id,empresa_id,procedimento_id,sensor_id|esp32_id,periodicidade,data_inicio,proxima_geracao,prazo_maximo_dias,ativo}`, `Periodicidade` 7, `PlanoEquipamentoTipo`.
- `Notificacao/notificacao.types.ts:1` — `Notificacao {id,tipo,titulo,mensagem,timestamp,lida,acaoLabel,acaoDestino,relacionadoId,relacionadoTipo}`; técnico vê só próprias (`notificationsForUser` em `permissions.ts:1` filtra por `ordem.tecnico_id` / `solicitacao.solicitante_id`).
- `dashboard.types.ts:1` — `SensorStatus`, `Sensor {vazao_atual/vazao_meta}`, `StatCardData`, `Activity`, `SensorStatusCount`, `PeriodFilter 7d/15d/30d/90d`, `NavigationItem`.
- Barrel `src/types/index.ts:1`.

## Mocks (`src/data/`)
- `mock.ts:3` — `mockStats` 5 (2.847 m³, 24/28 etc.), `mockSensors` 10, `mockSensorStatusCounts` 18/4/3/3, `mockActivities` 8.
- `setores.mock.ts:1` — `mockSetores` 4 (Produção/Resfriamento/Limpeza/Expedição) + `mockAtivos` 7 FK `setor_id`.
- `siva-domain.mock.ts:1` — isolamento `empresa_id=1` completo: `mockUsuarios` 6, `mockEsp32` 4, `mockSensorEntities` 5, `mockEspecialidades` 5, `mockProcedimentos` 3 (2 ativos), `mockPlanos` 3 (2 ativos, ordenados `proxima_geracao`), `mockSolicitacoes` 4, `mockOrdens` 4, `mockNotificacoes` 3.

## Utils
- `src/utils/periodicidade.ts:1` — `avancarProximaGeracao` (`setMonth/setFullYear` calendário real), `calcularDataLimite`, `gerarOrdensAutomatica`.
- `src/utils/format.ts:1` — `formatDateBR`, `relativeTime`; `src/utils/cn.ts:1`.

## Esquema SQL Previsto (pendente)
- FKs `fk_setor_empresa`, `fk_ativo_setor`, `fk_plano_procedimento`, `UNIQUE(empresa_id,nome)` procedimento, `UNIQUE(procedimento_id,especialidade_id)` `procedimento_equipe`.
- `ordem_servico.plano_manutencao_id`, `data_limite`, `tecnico_id NULL`; `plano_manutencao.periodicidade/proxima_geracao/prazo_maximo_dias`.

## Exemplos de IDs
- `Setor` 1..4, `Ativo` 1..7, `Usuario` 1..6 (1 admin, 2 gestor, 3-4 tecnico, 5 funcionario, 6 super_admin), `Procedimento` 1..3, `Plano` 1..3, `SensorEntity` 1..5, `Esp32` 1..4.
- Logins mock: admin `rafael@etec.com`/`123456` → `dashboard`; técnica `ana.tecnica@siva.com`/`123456` → `minhas-ordens` (Ana id 3: OS #1 atribuída, #3 em andamento).

