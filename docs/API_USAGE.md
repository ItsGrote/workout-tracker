# API Usage

Todas as rotas abaixo sao privadas. O `userId` vem somente da sessao Supabase autenticada; o frontend nao envia `userId`.

Chamadas feitas pelo frontend para APIs privadas devem usar `credentials: "include"`
para enviar os cookies de sessao do Supabase.

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

Observacao: no dashboard, esta rota e usada pelo botao `Delete workout` dentro
do modal de edicao. A confirmacao acontece no frontend; o backend ainda valida
o usuario autenticado antes de excluir.

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

### `GET /api/progression/analytics`

Retorna opcoes para selects pesquisaveis e pontos prontos para graficos personalizados.

Query params:

- `target`: `workout` ou `exercise`
- `workoutFilter`: `name` ou `category`, usado quando `target=workout`
- `selectedValue`: nome/categoria/exercicio selecionado
- `range`: `7d`, `30d`, `90d`, `1y` ou `all`
- `exerciseMetric`: `volume`, `max-weight` ou `average-reps`

Resposta resumida:

```json
{
  "options": {
    "workoutNames": ["Push A"],
    "workoutCategories": ["Chest"],
    "exerciseNames": ["Bench Press"]
  },
  "points": [
    {
      "date": "2026-05-15T12:00:00.000Z",
      "label": "Bench Press",
      "volume": 1200,
      "maxWeight": 80,
      "averageReps": 8,
      "averageWeight": 70
    }
  ]
}
```

O frontend usa essa rota em `/progression`. O endpoint calcula metricas no service
e filtra por `userId` autenticado.

## Personal Records

### `GET /api/personal-records`

Calcula PRs a partir dos dados existentes.

Filtros opcionais:

- `workoutId`
- `exerciseName`
- `workoutCategory`
- `fromDate`
- `toDate`

Uso no frontend: apos criar ou editar workout, o dashboard chama
`GET /api/personal-records?workoutId=:id` para buscar os novos PRs daquele
workout salvo e exibir um popup consolidado. O endpoint continua calculando no
backend e sempre usa o `userId` da sessao Supabase.

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

Para desabilitar um streak, envie `null` na meta correspondente:

```json
{
  "weeklyGoal": null,
  "monthlyGoal": 12
}
```

Validacoes:

- `weeklyGoal`: inteiro de 1 a 7 ou `null`
- `monthlyGoal`: inteiro de 1 a 31 ou `null`
- o frontend nao envia `userId`
- mais de um workout no mesmo dia conta como apenas 1 dia para consistencia

## Seguranca

- APIs usam Supabase Auth.
- Usuario anonimo recebe `401`.
- O backend sempre filtra recursos por `userId` autenticado.
- Rotas aninhadas validam pertencimento entre workout, exercise e set.
- Payloads sao validados com Zod no backend.
- Erros enviados ao usuario devem ser mensagens seguras, sem stack trace.
- Frontend pode fazer validacao basica para UX, mas nao e fonte de seguranca.
