# Testing

Este documento descreve a primeira estrutura de testes automatizados do projeto.

## Ferramenta

- Vitest
- Ambiente: Node
- Pasta: `tests/`

Scripts:

```bash
npm run test
npm run test:watch
```

## Estrategia inicial

Os primeiros testes priorizam services, validacoes e seguranca de ownership.

Nesta etapa, os testes usam mocks de repositories em vez de banco real. Isso evita
conectar no Supabase/PostgreSQL de desenvolvimento ou producao e deixa os testes
rapidos para rodar em qualquer maquina.

## O que esta coberto

### Workout service

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

### Exercise e set ownership

- cria exercicio com multiplas series dentro de workout do usuario
- bloqueia criar exercicio em workout de outro usuario
- bloqueia editar/deletar exercicio de outro usuario
- bloqueia editar exercicio fora do workout da rota
- bloqueia editar/deletar set de outro usuario
- bloqueia editar set fora do exercicio da rota

### Goals/streak settings

- bloqueia weekly goal menor que 1 ou maior que 7
- bloqueia monthly goal menor que 1 ou maior que 31
- permite desabilitar streak com `null`
- garante que o service salva metas para o `userId` recebido da sessao/controller

### Auth/session

- retorna o id do usuario autenticado
- falha com `AuthenticationError` quando nao ha usuario
- falha com `AuthenticationError` quando Supabase retorna erro de auth

## Limitacoes

- Ainda nao ha testes com banco isolado.
- Ainda nao ha testes de API routes completos.
- Ainda nao ha testes de componentes React.
- Mocks garantem contrato dos services, mas nao substituem testes de integracao.

## Proximos testes recomendados

- Testes de API para `401` anonimo e isolamento entre usuarios.
- Testes de services de progressao, PRs e consistencia.
- Testes de componente para criacao/edicao de workout.
- Testes de componente para settings sidebar e popups.
- Teste de integracao com banco local/test container antes de producao.
