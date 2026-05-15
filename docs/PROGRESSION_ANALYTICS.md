# Progression Analytics

Area separada para montar graficos personalizados de evolucao sem sobrecarregar o dashboard principal.

## Acesso

- Pagina: `/progression`
- Navegacao: link `Progression` no dashboard autenticado

## Tipos de grafico

### Workout

Usa workouts salvos pelo usuario autenticado.

Filtros:
- workout name
- workout category
- intervalo de tempo

Eixo X: data do workout.

Eixo Y: volume total do workout.

### Exercise

Usa todos os exercicios salvos com o mesmo nome.

Filtros:
- exercise name
- intervalo de tempo

Eixo X: data do workout em que o exercicio foi feito.

Eixo Y:
- volume
- max weight
- average reps

Opcional:
- mostrar/esconder average weight como serie adicional.

## Intervalos

- 7 days
- 30 days
- 90 days
- 1 year
- all time

## Tipo visual

- bar chart
- line chart

## Select pesquisavel

Os selects usam valores reais vindos do backend. O usuario pode digitar para filtrar recomendacoes, mas nao gera grafico com valor livre inexistente.

## Preferencias

A ultima configuracao escolhida usa `localStorage` no MVP:

- target: workout ou exercise
- filtro selecionado
- intervalo
- tipo visual
- eixo Y de exercise
- mostrar/esconder average weight

Se o valor salvo nao existir mais nos dados atuais, a selecao e resetada de forma segura.

## Endpoint

`GET /api/progression/analytics`

O endpoint retorna:
- opcoes para selects
- pontos prontos para grafico

O `userId` vem somente da sessao Supabase. O frontend nao envia `userId`.

O repository busca dados brutos, o service calcula metricas e o controller retorna HTTP.

## Robustez

- A pagina mostra estado vazio quando nao ha workouts/exercicios.
- Se o usuario ainda nao selecionou um item, nenhum grafico completo e renderizado.
- Arrays vazios retornam mensagem de dados insuficientes.
- Preferencias em `localStorage` sao carregadas com fallback seguro.
- Se uma preferencia salva nao existir mais nos dados atuais, a selecao e resetada.
- A quantidade de pontos renderizados e limitada no service para evitar visual poluido.

## Status

Implementado e compilando. Testes manuais completos ainda precisam ser executados antes de marcar o checkpoint como concluido.
