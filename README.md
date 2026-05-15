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

Usuarios anonimos sao redirecionados para `/login`. Depois do login, o
dashboard consome as APIs usando a sessao autenticada do Supabase.

## Scripts

- `npm run dev`: inicia o servidor de desenvolvimento.
- `npm run build`: gera o build de producao.
- `npm run start`: executa o build de producao.
- `npm run typecheck`: valida os tipos TypeScript.

## Ambiente

Copie `.env.example` para `.env` e configure:

- `DATABASE_URL`: URL pooled do PostgreSQL/Supabase usada pela aplicacao.
- `DIRECT_URL`: URL direta usada pelo Prisma CLI para migrations.
- `NEXT_PUBLIC_SUPABASE_URL`: URL publica do projeto Supabase.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: anon key publica do projeto Supabase.

## API atual

As rotas abaixo sao privadas. O usuario deve estar autenticado com Supabase Auth.

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

## Dashboard MVP

O dashboard autenticado mostra volume, consistencia, metas e recordes pessoais.
Ele tambem inclui um fluxo minimo para criar um treino com um exercicio e uma
serie, suficiente para iniciar os graficos e o acompanhamento de consistencia.

## Autenticacao

- `GET /login`: tela simples de login com email e senha.
- `GET /signup`: tela simples de cadastro com email e senha.
- Logout fica disponivel no dashboard autenticado.

O `userId` usado nas APIs vem somente da sessao Supabase. O frontend nao envia
nem escolhe `userId`.

## Migrations

Para aplicar migrations pendentes no banco configurado:

```bash
npx prisma migrate deploy
```
