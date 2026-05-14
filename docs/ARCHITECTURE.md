# Arquitetura

O projeto segue uma estrutura simples baseada em MVC + Service + Repository, mantendo o backend dentro do Next.js para o MVP.

## Fluxo principal

```txt
Route / Controller
-> Validation (Zod)
-> Service
-> Repository
-> Database
```

## Responsabilidade das pastas

```txt
src/app
```

Rotas do Next.js. Futuramente deve conter paginas, layouts e API routes.

```txt
src/app/api
```

Entrada HTTP da aplicacao. As rotas devem chamar controllers e evitar conter regra de negocio.

```txt
src/server/controllers
```

Recebe requests, chama validacoes e services, e transforma respostas em HTTP.

```txt
src/server/validations
```

Schemas Zod compartilhaveis entre backend e frontend quando fizer sentido.

```txt
src/server/services
```

Regras de negocio: calculo de intensidade, deteccao de PRs, streaks, validacoes de dominio e progresso.

```txt
src/server/repositories
```

Acesso a dados. Deve concentrar chamadas Prisma/Supabase e consultas ao banco.
Repositories devem expor operacoes de persistencia e filtros simples, sem regra de negocio.

```txt
src/server/types
```

Tipos compartilhados do backend que nao pertencem diretamente a um schema Zod ou modelo Prisma.

```txt
src/lib
```

Clientes e utilitarios reutilizaveis, como Prisma, Supabase e helpers pequenos.

```txt
prisma
```

Schema e migrations do banco quando a etapa de persistencia comecar.

## Dominio inicial

O dominio inicial do MVP comeca com tres modelos centrais:

- `Workout`: treino realizado em uma data, com nome, categoria opcional e `userId` para isolamento futuro.
- `Exercise`: exercicio dentro de um treino.
- `ExerciseSet`: serie de um exercicio, com repeticoes, peso em kg, ordem e tipo de serie.

Tipos de serie suportados:

- `warm-up`
- `recognition-activation`
- `working`

## Convencoes

- Rotas e controllers nao devem conter regra de negocio.
- Services podem combinar repositories e executar regras do produto.
- Repositories nao devem saber sobre HTTP, UI ou regras de apresentacao.
- Validacoes de payload devem usar Zod antes de chegar aos services.
- Nomes de arquivos devem ser diretos e por feature quando possivel, por exemplo `workout.service.ts`.
- Evitar camadas extras como use cases, gateways e presenters no MVP.
- Criar abstracoes somente quando removerem duplicacao real ou melhorarem clareza.
- Ate a autenticacao real existir, APIs de workout usam `x-user-id` como contexto temporario de usuario.
- Rotas aninhadas devem validar no service que o recurso pertence ao pai informado no caminho, por exemplo exercicio dentro do workout correto.

## Como adicionar uma feature

1. Criar ou atualizar o schema Zod em `src/server/validations`.
2. Criar o controller em `src/server/controllers`.
3. Criar o service em `src/server/services`.
4. Criar o repository em `src/server/repositories` quando houver persistencia.
5. Expor a entrada em `src/app/api` ou Server Action.
6. Adicionar testes focados quando a regra tiver risco de regressao.

## Decisoes tecnicas

- O backend fica no Next.js no MVP para reduzir complexidade operacional.
- Prisma sera usado para modelagem e migrations quando o banco for iniciado.
- Supabase sera usado para PostgreSQL e Auth.
- Zod sera a fonte principal de validacao de entrada.
- Recharts sera usado apenas quando a camada de dashboard for iniciada.
- A modelagem ja inclui `userId` em `Workout`, mas a autenticacao sera adicionada em um checkpoint futuro.
- Com Prisma 7, `DIRECT_URL` fica em `prisma.config.ts` para CLI/migrations e `DATABASE_URL` e usada no runtime via adapter PostgreSQL.
