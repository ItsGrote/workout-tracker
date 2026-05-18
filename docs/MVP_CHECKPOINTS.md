# Checkpoints do MVP

## 1. Base do projeto Next.js

Status: concluido.

Objetivo: configurar Next.js 15, TypeScript, TailwindCSS e estrutura inicial.

Arquivos provaveis:
- `package.json`
- `next.config.*`
- `tsconfig.json`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/globals.css`

Pronto quando:
- Aplicacao inicia localmente.
- TypeScript compila.
- Tailwind esta funcionando.
- Estrutura arquitetural permanece separada.

## 2. Modelagem inicial do dominio

Status: concluido.

Objetivo: definir os dados centrais: Workout, Exercise e ExerciseSet.

Arquivos provaveis:
- `prisma/schema.prisma`
- `src/server/types/workout.types.ts`
- `src/server/validations/workout.validation.ts`

Pronto quando:
- Campos principais estao definidos.
- Set types suportam warm-up, recognition/activation e working set.
- Validacoes impedem dados claramente invalidos.

## 3. Persistencia com Prisma

Status: concluido.

Objetivo: conectar Prisma ao PostgreSQL/Supabase e criar repositories basicos.

Arquivos provaveis:
- `prisma/schema.prisma`
- `src/lib/prisma.ts`
- `src/server/repositories/workout.repository.ts`
- `.env.example`

Pronto quando:
- Migration inicial roda.
- Repository cria, busca, atualiza e remove treinos.
- Nenhuma regra de negocio fica no repository.

## 4. CRUD de workouts no backend

Status: concluido.

Objetivo: implementar criacao, edicao, exclusao, duplicacao, busca e filtros de workouts.

Arquivos provaveis:
- `src/app/api/workouts/route.ts`
- `src/app/api/workouts/[id]/route.ts`
- `src/server/controllers/workout.controller.ts`
- `src/server/services/workout.service.ts`
- `src/server/validations/workout.validation.ts`

Pronto quando:
- Endpoints validam payloads.
- Treinos sem nome ou sem exercicios sao bloqueados.
- Filtros essenciais funcionam.

## 5. CRUD de exercicios e sets

Status: concluido.

Objetivo: registrar exercicios, sets, repeticoes, pesos e categorias de set.

Arquivos provaveis:
- `src/server/controllers/exercise.controller.ts`
- `src/server/services/exercise.service.ts`
- `src/server/repositories/exercise.repository.ts`
- `src/server/validations/exercise.validation.ts`

Pronto quando:
- Cada set aceita peso, repeticoes, ordem e tipo.
- Valores impossiveis sao bloqueados.
- Exercicios podem ser consultados historicamente.

## 6. Calculos de progressao

Status: concluido.

Objetivo: calcular intensidade e volume por treino, exercicio e categoria.

Arquivos provaveis:
- `src/server/services/progression.service.ts`
- `src/server/types/progression.types.ts`
- `src/server/repositories/progression.repository.ts`

Pronto quando:
- Intensidade usa peso x repeticoes x sets.
- Sets com pesos/repeticoes diferentes sao calculados corretamente.
- Resultados podem alimentar graficos.

## 7. Personal records

Status: concluido.

Objetivo: detectar maiores cargas, volumes, repeticoes e novos recordes.

Arquivos provaveis:
- `src/server/services/personal-record.service.ts`
- `src/server/repositories/personal-record.repository.ts`
- `src/server/types/personal-record.types.ts`

Pronto quando:
- Novos PRs sao detectados apos salvar treino.
- Recordes sao calculados por exercicio e categoria quando aplicavel.
- Mensagens de PR podem ser exibidas pela UI futuramente.

## 8. Streaks e consistencia

Status: concluido.

Objetivo: rastrear frequencia semanal, mensal, streaks e porcentagem de conclusao.

Arquivos provaveis:
- `src/server/services/consistency.service.ts`
- `src/server/repositories/consistency.repository.ts`
- `src/server/validations/goal.validation.ts`

Pronto quando:
- Usuario pode ter metas semanais e mensais.
- Streaks sao calculados de forma previsivel.
- Historico de consistencia esta disponivel para dashboard.

## 9. Dashboard inicial

Status: concluido.

Objetivo: criar uma interface minima para visualizar progresso, volume e consistencia.

Arquivos provaveis:
- `src/app/page.tsx`
- `src/components/*`
- `src/server/services/progression.service.ts`

Pronto quando:
- Usuario enxerga progresso geral.
- Graficos basicos mostram evolucao por tempo.
- Layout funciona bem em mobile.

## 10. Autenticacao e isolamento de usuario

Status: concluido.

Objetivo: adicionar Supabase Auth e garantir que cada usuario veja apenas seus dados.

Arquivos provaveis:
- `src/lib/supabase.ts`
- `src/middleware.ts`
- `src/server/repositories/*`
- `src/app/(auth)/*`

Pronto quando:
- Login e sessao funcionam.
- Queries filtram por `userId`.
- Rotas protegidas bloqueiam acesso anonimo.

## 11. Polimento do MVP

Status: concluido.

Objetivo: revisar UX, mensagens de erro, estados vazios, loading e responsividade.

Arquivos provaveis:
- `src/app/*`
- `src/components/*`
- `src/server/validations/*`

Pronto quando:
- Fluxo principal de registrar treino e ver evolucao esta completo.
- Erros sao compreensiveis.
- O produto esta usavel em desktop e mobile.

## 12. Workout management polish and configurable streaks

Status: implementado; testes manuais pendentes.

Objetivo: completar o fluxo principal do frontend para criar, editar, excluir, duplicar workouts e configurar streaks/metas.

Arquivos provaveis:
- `src/components/dashboard/create-workout-modal.tsx`
- `src/components/dashboard/edit-workout-modal.tsx`
- `src/components/dashboard/duplicate-workout-modal.tsx`
- `src/components/dashboard/workout-management-card.tsx`
- `src/components/dashboard/settings-sidebar.tsx`
- `src/components/dashboard/goal-achievement-popup.tsx`

Pronto quando:
- Usuario cria workout com varios exercicios e varias series.
- Usuario edita workout, exercicios e series em uma unica interface.
- Usuario remove exercicios e series antes de salvar edits.
- Usuario exclui workout completo pelo modal com confirmacao.
- Usuario duplica workout existente e abre a copia para edicao.
- Graficos e cards sao recarregados apos salvar ou duplicar.
- Lista de workouts mostra 6 itens inicialmente e expande com `View more`.
- Usuario configura weekly/monthly streak com validacoes.
- Cards de streak aparecem apenas quando a meta correspondente esta ativa.
- Popup de conquista aparece quando uma meta ativa e atingida sem repetir em todo refresh.

## 13. Personal record pop-ups

Status: implementado; testes manuais pendentes.

Objetivo: mostrar um popup consolidado quando um workout salvo gera novos recordes pessoais.

Arquivos provaveis:
- `src/components/dashboard/dashboard-client.tsx`
- `src/components/dashboard/personal-record-popup.tsx`
- `src/components/dashboard/settings-sidebar.tsx`
- `src/server/services/personal-record.service.ts`
- `src/server/validations/personal-record.validation.ts`

Pronto quando:
- Popup aparece apos criar workout que gera PR.
- Popup aparece apos editar workout que gera PR.
- Varios PRs do mesmo workout aparecem em um unico popup.
- Popup nao aparece ao apenas abrir/recarregar dashboard.
- Usuario pode desabilitar/reabilitar popups de PR em `Settings > Popup settings`.
- Preferencia temporaria fica documentada como `localStorage`.

## 14. Custom progression analytics

Status: implementado; testes manuais pendentes.

Objetivo: criar uma area separada para o usuario montar graficos personalizados de evolucao.

Arquivos provaveis:
- `src/app/progression/page.tsx`
- `src/components/progression/progression-analytics-client.tsx`
- `src/components/progression/searchable-select.tsx`
- `src/app/api/progression/analytics/route.ts`
- `src/server/controllers/progression-analytics.controller.ts`
- `src/server/services/progression-analytics.service.ts`
- `src/server/repositories/progression-analytics.repository.ts`
- `src/server/validations/progression-analytics.validation.ts`

Pronto quando:
- Usuario acessa `/progression` pelo dashboard.
- Pagina exige escolha antes de renderizar grafico.
- Usuario alterna entre grafico de workout e exercise.
- Workout permite filtro por nome ou categoria.
- Workout mostra insights de evolucao percentual, maior volume, media, total
  acumulado e workouts analisados.
- Exercise permite eixo Y de volume, max weight e average reps.
- Average weight pode ser mostrado/escondido.
- Exercise mostra insights de progressao, maior carga, carga media, volume
  acumulado e sessoes analisadas.
- Intervalos permitidos sao 7d, 30d, 90d, 1y e all time.
- Tipo visual alterna entre bar chart e line chart.
- Preferencias sao restauradas via `localStorage`.

## 15. Settings sidebar

Status: implementado; testes manuais pendentes.

Objetivo: substituir o modal antigo de settings por uma sidebar lateral que nao corta o formulario.

Arquivos provaveis:
- `src/components/dashboard/settings-sidebar.tsx`
- `src/components/dashboard/dashboard-client.tsx`
- `src/components/dashboard/consistency-card.tsx`

Pronto quando:
- Botao `Settings` abre uma sidebar lateral.
- Sidebar possui `Streak settings` e `Popup settings`.
- Streak settings salva metas semanais/mensais com validacao.
- Popup settings controla popups de PR via `localStorage`.
- Cards de streak abrem a sidebar diretamente em `Streak settings`.
- Botao de salvar fica acessivel e a sidebar possui scroll interno.

## 16. Estrutura inicial de testes automatizados

Status: concluido.

Objetivo: adicionar Vitest e cobrir services criticos, validacoes e seguranca de ownership sem conectar em banco real.

Arquivos provaveis:
- `vitest.config.ts`
- `tests/services/workout.service.test.ts`
- `tests/services/exercise-ownership.service.test.ts`
- `tests/services/goal.service.test.ts`
- `tests/auth/session.test.ts`
- `docs/TESTING.md`

Pronto quando:
- `npm run test` executa com sucesso.
- Services de workout cobrem criacao, update, delete e duplicacao.
- Ownership bloqueia acesso cruzado em workout, exercise e set.
- Validacoes de metas bloqueiam valores invalidos.
- Sessao autenticada falha de forma segura sem usuario.

## 17. Segunda etapa de testes automatizados

Status: concluido.

Objetivo: ampliar cobertura para API routes reais, isolamento entre usuarios e
services de progressao, PRs e consistencia sem conectar em banco real.

Arquivos provaveis:
- `tests/api/workout-routes.test.ts`
- `tests/api/exercise-set-routes.test.ts`
- `tests/services/progression.service.test.ts`
- `tests/services/personal-record.service.test.ts`
- `tests/services/consistency.service.test.ts`
- `tests/helpers/api-request.ts`
- `docs/TESTING.md`

Pronto quando:
- API routes respondem `401` para usuario anonimo.
- API routes bloqueiam acesso cruzado entre `userA` e `userB`.
- Criacao, validacao, delete e duplicacao de workouts sao testados por HTTP handler.
- Duplicacao usa data atual.
- Progressao calcula volumes corretamente.
- PRs detectam carga, repeticoes e volume sem falso positivo em empate.
- Consistencia conta dias unicos e nao quebra com historico vazio.
- `npm run test` passa com a suite anterior e a nova.

## 18. Workout templates and faster workout logging

Status: implementado; testes automatizados passando; testes manuais pendentes.

Objetivo: permitir que o usuario salve estruturas de treino como templates e
inicie workouts reais mais rapidamente sem contar templates como progresso.

Arquivos provaveis:
- `prisma/schema.prisma`
- `src/app/api/templates/*`
- `src/server/controllers/template.controller.ts`
- `src/server/services/template.service.ts`
- `src/server/repositories/template.repository.ts`
- `src/server/validations/template.validation.ts`
- `src/components/dashboard/template-management-card.tsx`
- `src/components/dashboard/template-editor-modal.tsx`
- `tests/services/template.service.test.ts`
- `tests/api/template-routes.test.ts`

Pronto quando:
- Usuario cria, edita e exclui templates.
- Usuario salva workout existente como template.
- Usuario inicia workout a partir de template sem criar workout automaticamente.
- Usuario usa template diretamente no modal `Create workout`.
- Template nao exige reps/peso.
- Template nao entra em progressao, streak, PR ou graficos.
- APIs de template usam `userId` da sessao autenticada e bloqueiam ownership cruzado.
- `npm run test`, `npm run typecheck` e `npm run build` passam.

## 19. Workout summary and comparison insights

Status: implementado; testes automatizados passando; testes manuais pendentes.

Objetivo: mostrar um popup pos-workout com comparacao de volume, volume total,
PRs e streaks ativos apos salvar um workout real.

Arquivos provaveis:
- `src/app/api/workouts/[id]/summary/route.ts`
- `src/server/controllers/workout-summary.controller.ts`
- `src/server/services/workout-summary.service.ts`
- `src/server/repositories/workout-summary.repository.ts`
- `src/components/dashboard/workout-summary-popup.tsx`
- `src/components/dashboard/settings-sidebar.tsx`
- `tests/services/workout-summary.service.test.ts`
- `tests/api/workout-summary-route.test.ts`

Pronto quando:
- Summary aparece somente apos salvar workout real.
- Comparacao usa workout anterior de mesmo nome ou mesma categoria.
- Volume anterior zero nao gera `Infinity%`.
- Summary lista volume total, PRs e streaks ativos.
- PR popup, quando exibido, aparece antes do summary.
- Usuario pode desativar summary popup em `Settings > Popup settings`.
- API usa `userId` da sessao e bloqueia ownership cruzado.
