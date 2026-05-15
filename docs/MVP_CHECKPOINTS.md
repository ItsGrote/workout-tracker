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

Status: implementado; testes manuais pendentes.

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
- `src/components/dashboard/streak-settings-modal.tsx`
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
