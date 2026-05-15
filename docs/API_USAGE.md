# API Usage

Todas as rotas abaixo sao privadas. O `userId` vem somente da sessao Supabase autenticada; o frontend nao envia `userId`.

## Workouts

### `GET /api/workouts`

Lista workouts do usuario autenticado.

Resposta: array de workouts com exercicios e series.

### `POST /api/workouts`

Cria um workout completo.

Payload:

```json
{
  "name": "Push A",
  "category": "Chest",
  "date": "2026-05-15T12:00:00.000Z",
  "exercises": [
    {
      "name": "Bench Press",
      "order": 1,
      "sets": [
        {
          "repetitions": 10,
          "weightKg": 60,
          "setType": "working",
          "order": 1
        }
      ]
    }
  ]
}
```

Resposta: workout criado.

### `GET /api/workouts/:id`

Busca um workout do usuario autenticado por id.

Resposta: workout com exercicios e series.

### `PATCH /api/workouts/:id`

Edita workout. Quando `exercises` e enviado, substitui a estrutura de exercicios e series do workout.

Payload: campos parciais de workout e, opcionalmente, array completo de `exercises`.

Resposta: workout atualizado.

### `DELETE /api/workouts/:id`

Exclui workout do usuario autenticado.

Resposta: `204 No Content`.

### `POST /api/workouts/:id/duplicate`

Duplica workout do usuario autenticado.

Resposta: novo workout duplicado, com data atual.

## Exercises

### `GET /api/workouts/:id/exercises`

Lista exercicios de um workout.

### `POST /api/workouts/:id/exercises`

Cria exercicio dentro de um workout.

### `GET /api/workouts/:id/exercises/:exerciseId`

Busca exercicio por id, validando se pertence ao workout informado.

### `PATCH /api/workouts/:id/exercises/:exerciseId`

Edita campos basicos do exercicio.

### `DELETE /api/workouts/:id/exercises/:exerciseId`

Exclui exercicio e suas series.

## Sets

### `GET /api/exercises/:exerciseId/sets`

Lista series de um exercicio.

### `POST /api/exercises/:exerciseId/sets`

Cria serie em um exercicio.

Payload:

```json
{
  "repetitions": 8,
  "weightKg": 80,
  "setType": "working",
  "order": 1
}
```

### `PATCH /api/exercises/:exerciseId/sets/:setId`

Edita serie, validando se ela pertence ao exercicio informado.

### `DELETE /api/exercises/:exerciseId/sets/:setId`

Exclui uma serie.

## Progression

### `GET /api/progression`

Retorna pontos prontos para grafico de volume.

Filtros opcionais:

- `exerciseName`
- `category`
- `fromDate`
- `toDate`

## Personal Records

### `GET /api/personal-records`

Calcula PRs a partir dos dados existentes.

Filtros opcionais:

- `exerciseName`
- `workoutCategory`
- `fromDate`
- `toDate`

## Consistency

### `GET /api/consistency`

Retorna progresso semanal, mensal, historico e streak.

### `GET /api/goals`

Busca metas semanais/mensais.

### `PUT /api/goals`

Atualiza metas.

Payload:

```json
{
  "weeklyGoal": 4,
  "monthlyGoal": 16
}
```

## Seguranca

- APIs usam Supabase Auth.
- Usuario anonimo recebe `401`.
- O backend sempre filtra recursos por `userId` autenticado.
- Rotas aninhadas validam pertencimento entre workout, exercise e set.

