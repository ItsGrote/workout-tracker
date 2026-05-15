# Workout Flow

Este documento descreve o fluxo principal do usuario no dashboard autenticado.

## Criacao

1. Usuario clica em `+ Create workout`.
2. Informa nome, categoria e data do workout.
3. Adiciona um ou mais exercicios com `+ Add exercise`.
4. Em cada exercicio, adiciona uma ou mais series com `+ Add set`.
5. Em cada serie, preenche:
   - weight
   - repetitions
   - set type: `warm-up`, `recognition-activation` ou `working`
6. Ao salvar, o frontend envia o workout completo para `POST /api/workouts`.
7. Dashboard recarrega progressao, consistencia, metas, PRs e lista de workouts.

## Edicao

1. Usuario abre a area `Workouts`.
2. Clica em `Edit workout`.
3. O modal mostra a hierarquia:
   - workout name e category
   - lista de exercicios
   - tipos de sets do exercicio selecionado
   - series daquele tipo
4. O usuario pode editar campos dentro do modal.
5. Alteracoes so sao enviadas ao clicar em `Save edits`.
6. O save usa `PATCH /api/workouts/:id` com o workout completo.
7. O backend substitui a estrutura de exercicios/series conforme o payload validado.

## Exclusao

- Excluir exercicio remove o exercicio e todas as suas series do draft.
- Excluir serie remove apenas aquela serie do draft.
- Antes de remover exercicio ou serie, o usuario recebe confirmacao.
- A exclusao so vira persistente quando o usuario clica em `Save edits`.
- Excluir workout completo fica no final do modal de edicao.
- Antes de excluir workout, o app avisa que exercicios e series tambem serao removidos.
- Ao confirmar, o frontend chama `DELETE /api/workouts/:id`, fecha o modal e recarrega dashboard/graficos.

## Duplicacao

1. Usuario clica em `Duplicate workout`.
2. Seleciona um workout anterior.
3. Frontend chama `POST /api/workouts/:id/duplicate`.
4. Backend cria uma copia para o usuario autenticado, com data atual.
5. A copia abre automaticamente no modal de edicao.
6. Usuario pode ajustar e salvar edits.

## Graficos

Apos criar, editar ou duplicar, o dashboard recarrega:

- `GET /api/progression`
- `GET /api/consistency`
- `GET /api/goals`
- `GET /api/personal-records`
- `GET /api/workouts`

Assim, o grafico de volume x tempo reflete os dados atuais.

## Lista de workouts

- O dashboard mostra inicialmente ate 6 workouts, ordenados pelos mais recentes.
- `View more` mostra mais 6 por vez.
- Quando todos estao visiveis, o botao desaparece.

## Streaks e metas

1. Usuario abre `Settings` na area de consistencia.
2. Pode habilitar/desabilitar weekly streak e monthly streak.
3. Weekly streak aceita meta de 1 a 7 dias treinados por semana.
4. Monthly streak aceita meta de 1 a 31 dias treinados por mes.
5. Mais de um workout no mesmo dia conta como apenas 1 dia treinado.
6. Ao desabilitar streak salvo, o app pede confirmacao e apaga a meta correspondente.
7. Cards de streak aparecem apenas para metas ativas.
8. Clicar em um card de streak abre as mesmas configuracoes.
9. Quando uma meta ativa e atingida, o app mostra um popup de parabens.
10. O popup usa `localStorage` para evitar reaparecer em todo refresh do mesmo periodo/meta.

## Validacoes principais

O frontend faz validacao basica antes de enviar:

- workout precisa de nome, categoria e pelo menos 1 exercicio
- exercicio precisa de nome e pelo menos 1 set
- set precisa de repetitions, weight e set type valido
- repetitions deve ser inteiro positivo
- weight deve ser numero valido e nao negativo

O backend continua sendo a fonte final de validacao com Zod.

## Alteracoes nao salvas

No modal de edicao, se o usuario tentar fechar com alteracoes pendentes, o app mostra uma confirmacao com:

- `Save changes`
- `Discard changes`
- `Cancel`
