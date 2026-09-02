# Memória

## Última sessão
Esqueleto completo do Dashboard SIVA (Sistema de Monitoramento de Vazão). Layout com sidebar fixa (7 itens de navegação com lucide-react), header com busca, notificações e perfil, 5 cards de indicadores, placeholder de gráfico com filtro de período, seção de status dos sensores (online/offline/alerta/manutenção), placeholder de mapa de setores e lista de atividades recentes. Dados mockados centralizados em `src/data/mock.ts`. Dashboard responsivo: sidebar colapsável no mobile, grid adaptável.

## Estrutura atual
- `src/components/ui/` — Input, Button, Modal reutilizáveis
- `src/components/dashboard/` — sidebar, header, stat-card, stat-grid, chart-area, period-filter, sensor-status, sensor-map, recent-activities
- `src/components/profile-modal.tsx` — modal de perfil do usuário
- `src/data/mock.ts` — dados mockados (stats, sensores, atividades)
- `src/hooks/use-form.ts` — hook genérico de formulário com validação
- `src/pages/` — login, cadastro, dashboard
- `src/types/` — AuthUser (com cpf), dashboard.types (StatCard, Activity, Sensor, etc.), User, Empresa, Nivel
- `src/App.tsx` — navegação por estado (login → dashboard, cadastro → login)

## Próximos passos
- Integrar API (services de auth e user)
- Adicionar rotas (react-router ou similar)
- Refinar visual do dashboard (cores, ícones, gráficos reais)
- Implementar gráfico de consumo com biblioteca (recharts, chart.js, etc.)
- Implementar mapa real de sensores
