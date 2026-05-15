# Next Steps

## UI/UX

- Melhorar responsividade mobile do editor de workout.
- Criar area dedicada para listagem completa de treinos.
- Melhorar estados vazios com exemplos mais guiados.
- Refinar feedback visual de PRs apos salvar treino.
- Refinar visual do modal de settings de streak.
- Substituir confirmacoes nativas por dialogs consistentes com o design.

## Testes

- Adicionar testes unitarios para services de progressao, PRs e consistencia.
- Adicionar testes de API para isolamento entre usuarios.
- Adicionar testes de componente para criacao/edicao de workout.

## Produto

- Criar filtros visuais para graficos.
- Criar pagina dedicada de evolucao por exercicio.
- Criar pagina dedicada de historico de workouts.
- Permitir historico visual de metas semanais/mensais em calendario.

## Deploy

- Revisar variaveis de ambiente.
- Rodar migrations em ambiente de producao com `npx prisma migrate deploy`.
- Configurar URLs de redirect no Supabase Auth.
- Revisar cookies, HTTPS e politicas de seguranca antes de producao.

## Segurança

- Revisar autorizacao em todos os endpoints privados.
- Evitar expor mensagens internas de erro.
- Considerar testes automatizados para acesso cruzado entre usuarios.
