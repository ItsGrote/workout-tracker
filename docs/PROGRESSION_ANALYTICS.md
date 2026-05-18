# Progression Analytics

Area separada para montar graficos personalizados de evolucao sem sobrecarregar
o dashboard principal.

## Acesso

- Pagina: `/progression`
- Navegacao: link `Progression` no dashboard autenticado

## Workout Analytics

Analisa workouts reais salvos pelo usuario autenticado.

Filtros:
- workout name ou workout category
- intervalo de tempo
- tipo visual: bar chart ou line chart

Grafico:
- eixo X: datas dos workouts em ordem crescente
- eixo Y: volume total do workout

Insights exibidos, nesta ordem:
1. Evolucao percentual
2. Highest volume
3. Average volume
4. Total accumulated volume
5. Workouts analyzed

A evolucao percentual compara o primeiro workout do intervalo com o workout mais
recente do mesmo conjunto. A ordenacao usa `date`, `createdAt` e `id` como
desempate. Se houver apenas um ponto ou o primeiro volume for zero, o endpoint
retorna mensagem segura em vez de `Infinity%`.

## Exercise Analytics

Analisa exercicios reais salvos com o mesmo nome.

Filtros:
- exercise name
- intervalo de tempo
- metrica: volume, max weight ou average reps
- tipo visual: bar chart ou line chart

Grafico:
- eixo X: datas dos workouts em que o exercicio foi feito
- eixo Y: metrica selecionada

Opcional:
- mostrar/esconder average weight como serie adicional.

Insights exibidos, nesta ordem:
1. Progression percentage
2. Highest weight
3. Average weight
4. Total accumulated volume
5. Sessions analyzed

A progression percentage usa a metrica selecionada. Por exemplo, se o eixo Y for
`max-weight`, a comparacao usa o max weight mais antigo e o mais recente dentro
do intervalo.

## Intervalos

- 7 days
- 30 days
- 90 days
- 1 year
- all time

O padrao e 30 days.

## Select pesquisavel

Os selects usam valores reais vindos do backend. O usuario pode digitar para
filtrar recomendacoes, mas nao gera grafico com valor livre inexistente.

## Preferencias

A ultima configuracao escolhida usa `localStorage` no MVP:

- target: workout ou exercise
- filtro selecionado
- intervalo
- tipo visual
- eixo Y de exercise
- mostrar/esconder average weight

Se o valor salvo nao existir mais nos dados atuais, a selecao e resetada de forma
segura. Nao ha tabela de preferencias no banco nesta etapa.

## Endpoint

`GET /api/progression/analytics`

O endpoint retorna:
- opcoes para selects
- pontos prontos para grafico
- insights automaticos para o tipo de analytics selecionado

O `userId` vem somente da sessao Supabase. O frontend nao envia `userId`.

O repository busca dados brutos, o service calcula metricas/insights e o
controller retorna HTTP.

## Robustez

- A pagina mostra estado vazio quando nao ha workouts/exercicios.
- Se o usuario ainda nao selecionou um item, nenhum grafico completo e renderizado.
- Arrays vazios retornam mensagem de dados insuficientes.
- Preferencias em `localStorage` sao carregadas com fallback seguro.
- Se uma preferencia salva nao existir mais nos dados atuais, a selecao e resetada.
- A quantidade de pontos renderizados e limitada no service para evitar visual poluido.

## Status

Implementado e compilando. Testes automatizados cobrem os calculos principais do
service; testes manuais completos da UI ainda precisam ser executados antes de
marcar o checkpoint como concluido.
