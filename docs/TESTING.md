# Testing

Este documento descreve a estrutura atual de testes automatizados do projeto.

## Ferramenta

- Vitest
- Ambiente: Node
- Pasta: `tests/`

Scripts:

```bash
npm run test
npm run test:watch
```

## Estrategia atual

Os testes priorizam services, API routes, validacoes e seguranca de ownership.

Nesta etapa, os testes usam mocks de repositories/auth em vez de banco real. Isso
evita conectar no Supabase/PostgreSQL de desenvolvimento ou producao e deixa os
testes rapidos para rodar em qualquer maquina.

## O que esta coberto

### Workout service - mock de repository

Funcionalidade testada: criacao, edicao, exclusao, busca e duplicacao de workouts.

Motivo do teste: o workout e a entidade central do produto e concentra o fluxo
de salvar exercicios e series.

Risco protegido: regressao em validacoes basicas, ownership e duplicacao com data
errada.

- cria workout valido
- bloqueia workout sem nome via Zod
- bloqueia workout sem exercicios via Zod
- atualiza workout do usuario autenticado
- bloqueia update de workout de outro usuario
- deleta workout do usuario autenticado
- bloqueia delete de workout de outro usuario
- bloqueia busca de workout de outro usuario
- duplica workout do usuario autenticado
- duplicacao usa data atual, nao a data antiga
- regressao: substituir todos os exercicios por um novo exercicio valido

### Exercise e set ownership - mock de repository

Funcionalidade testada: operacoes de exercicios e series dentro de workouts.

Motivo do teste: exercicios e series sao recursos aninhados e precisam validar o
pertencimento ao usuario e ao pai da rota.

Risco protegido: usuario editar/deletar exercicios ou series de outro usuario,
ou manipular recurso fora do workout/exercicio informado na URL.

- cria exercicio com multiplas series dentro de workout do usuario
- bloqueia criar exercicio em workout de outro usuario
- bloqueia editar/deletar exercicio de outro usuario
- bloqueia editar exercicio fora do workout da rota
- bloqueia editar/deletar set de outro usuario
- bloqueia editar set fora do exercicio da rota
- garante que delete de set remove apenas o set solicitado

### Goals/streak settings - mock de repository e Zod

Funcionalidade testada: salvar, desabilitar e validar metas semanais/mensais.

Motivo do teste: metas controlam os cards de consistencia e nao podem aceitar
valores impossiveis.

Risco protegido: metas invalidas persistidas e alteracao de metas para usuario
errado.

- bloqueia weekly goal menor que 1 ou maior que 7
- bloqueia monthly goal menor que 1 ou maior que 31
- permite desabilitar streak com `null`
- garante que o service salva metas para o `userId` recebido da sessao/controller

### Auth/session - mock de Supabase server

Funcionalidade testada: extracao segura do usuario autenticado.

Motivo do teste: todas as APIs privadas dependem do `userId` vindo da sessao.

Risco protegido: execucao de services sem usuario autenticado.

- retorna o id do usuario autenticado
- falha com `AuthenticationError` quando nao ha usuario
- falha com `AuthenticationError` quando Supabase retorna erro de auth

### API routes de workouts - handlers reais com auth/repositories mockados

Funcionalidade testada: comportamento HTTP real de `GET /api/workouts`,
`POST /api/workouts`, `PATCH /api/workouts/:id`, `DELETE /api/workouts/:id` e
`POST /api/workouts/:id/duplicate`.

Motivo do teste: validar o contrato Route/Controller/Service sem subir servidor
nem conectar em banco.

Risco protegido: respostas HTTP incorretas, acesso anonimo aceito, vazamento de
stack trace, userA acessando/editando/deletando/duplicando workout de userB e
duplicacao mantendo a data antiga.

### API routes de exercise/set - handlers reais com auth/repositories mockados

Funcionalidade testada: update/delete de exercicios e delete de sets em rotas
aninhadas.

Motivo do teste: recursos aninhados sao o ponto mais sensivel para falhas de
ownership.

Risco protegido: userA editar/deletar exercise ou set pertencente a workout de
userB e delete de set remover algo alem do set solicitado.

### Progression service - mock de repository

Funcionalidade testada: volume por set, exercicio e workout.

Motivo do teste: graficos de evolucao dependem diretamente desses calculos.

Risco protegido: volume incorreto com multiplas series, pesos/repeticoes
diferentes, exercicio sem series e filtros sem `userId` autenticado.

### Personal records service - mock de repository

Funcionalidade testada: deteccao de PR de maior carga, repeticoes e volume.

Motivo do teste: popups de PR e mensagens de conquista dependem do backend para
nao criar falsos positivos.

Risco protegido: empate sendo tratado como novo PR, recordes misturados entre
exercicios, dados de outro usuario interferindo e PR calculado sem workout salvo.

### Consistency service - mock de repositories

Funcionalidade testada: progresso semanal/mensal, historico e streak.

Motivo do teste: metas sao baseadas em dias unicos treinados, nao quantidade de
workouts no mesmo dia.

Risco protegido: dois workouts no mesmo dia contarem duas vezes, historico vazio
quebrar a tela, semana atual quebrar streak antes de terminar e consultas sem
filtro do usuario autenticado.

## Limitacoes

- Ainda nao ha testes com banco isolado.
- Ainda nao ha testes de componentes React.
- API routes sao testadas chamando handlers reais, mas com repositories e auth
  mockados; ainda nao ha servidor HTTP real nem Prisma real nos testes.
- Delete cascade de workout/exercise depende do banco/repository real e ainda
  precisa de teste de integracao com banco isolado.
- Mocks garantem contrato dos services, mas nao substituem testes de integracao.

## Proximos testes recomendados

- Testes de componente para criacao/edicao de workout.
- Testes de componente para settings sidebar e popups.
- Testes de API para `/api/progression/analytics`.
- Testes de controller/API para `/api/goals`, `/api/consistency`,
  `/api/progression` e `/api/personal-records`.
- Teste de integracao com banco local/test container antes de producao.
