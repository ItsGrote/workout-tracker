# Workout Evolution Tracker

Aplicacao para registrar treinos e mostrar evolucao real de performance antes das mudancas fisicas ficarem visiveis.

Este repositorio deve evoluir de forma incremental. A primeira fase prepara somente a arquitetura base.

## Stack planejada

- Next.js 15
- React + TypeScript
- TailwindCSS + shadcn/ui
- Recharts
- Next.js Server Actions e API Routes
- Zod
- Prisma
- Supabase/PostgreSQL
- Supabase Auth

## Documentacao

- [Arquitetura](docs/ARCHITECTURE.md)
- [Checkpoints do MVP](docs/MVP_CHECKPOINTS.md)

## Desenvolvimento local

```bash
npm install
npx prisma generate
npm run dev
```

Depois acesse `http://localhost:3000`.

O dashboard inicial usa temporariamente `x-user-id: dev-user` no frontend.
Esse valor existe apenas para desenvolvimento local e deve ser removido quando
Supabase Auth for implementado.

## Scripts

- `npm run dev`: inicia o servidor de desenvolvimento.
- `npm run build`: gera o build de producao.
- `npm run start`: executa o build de producao.
- `npm run typecheck`: valida os tipos TypeScript.

## Ambiente

Copie `.env.example` para `.env` e configure:

- `DATABASE_URL`: URL pooled do PostgreSQL/Supabase usada pela aplicacao.
- `DIRECT_URL`: URL direta usada pelo Prisma CLI para migrations.

## API atual

Enquanto a autenticacao real ainda nao foi implementada, as rotas de workout exigem o header `x-user-id`.

- `GET /api/workouts`: lista workouts.
- `POST /api/workouts`: cria workout com exercicios e series.
- `GET /api/workouts/:id`: busca workout por id.
- `PATCH /api/workouts/:id`: edita workout.
- `DELETE /api/workouts/:id`: exclui workout.
- `POST /api/workouts/:id/duplicate`: duplica workout.
- `GET /api/workouts/:id/exercises`: lista exercicios de um workout.
- `POST /api/workouts/:id/exercises`: cria exercicio em um workout.
- `GET /api/workouts/:id/exercises/:exerciseId`: busca exercicio por id.
- `PATCH /api/workouts/:id/exercises/:exerciseId`: edita exercicio.
- `DELETE /api/workouts/:id/exercises/:exerciseId`: exclui exercicio.
- `GET /api/exercises/:exerciseId/sets`: lista series de um exercicio.
- `POST /api/exercises/:exerciseId/sets`: cria serie em um exercicio.
- `PATCH /api/exercises/:exerciseId/sets/:setId`: edita serie.
- `DELETE /api/exercises/:exerciseId/sets/:setId`: exclui serie.
- `GET /api/exercises/history`: consulta historico de exercicios por nome e/ou datas.
- `GET /api/progression`: retorna volume de treino/exercicio pronto para graficos.
- `GET /api/personal-records`: calcula recordes pessoais a partir dos treinos existentes.
- `GET /api/goals`: busca metas semanais/mensais do usuario.
- `PUT /api/goals`: define metas semanais/mensais do usuario.
- `GET /api/consistency`: retorna progresso semanal, mensal, historico e streak.

## Migrations

Para aplicar migrations pendentes no banco configurado:

```bash
npx prisma migrate deploy
```
