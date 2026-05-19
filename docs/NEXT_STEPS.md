# Next Steps

## UI/UX

- Melhorar responsividade mobile do editor de workout.
- Refinar UX visual da area de templates e substituir prompt/confirm nativos.
- Criar area dedicada para listagem completa de treinos.
- Melhorar estados vazios com exemplos mais guiados.
- Refinar feedback visual de PRs apos salvar treino com animacoes sutis.
- Refinar visual do workout summary popup e adicionar transicoes sutis.
- Refinar visual da sidebar de settings.
- Substituir confirmacoes nativas por dialogs consistentes com o design.
- Refinar responsividade e densidade visual da pagina `/progression`.

## Testes

- Adicionar testes de componente para criacao/edicao de workout.
- Adicionar testes de componente para templates e start workout por template.
- Adicionar testes de componente para popup consolidado de PR.
- Adicionar testes de componente para workout summary popup.
- Adicionar testes de API para `/api/progression/analytics`.
- Adicionar testes de API para `/api/goals`, `/api/consistency`,
  `/api/progression` e `/api/personal-records`.
- Executar e registrar testes manuais dos checkpoints 12, 13 e 14 antes de marcar como concluidos.
- Avaliar banco de teste isolado ou test container para cobrir repository/Prisma sem usar dados reais.

## Produto

- Criar pagina dedicada de historico de workouts.
- Permitir criar template a partir de um workout com modal proprio em vez de `prompt`.
- Permitir historico visual de metas semanais/mensais em calendario.
- Permitir salvar presets nomeados de analytics se o uso da pagina `/progression`
  crescer alem da preferencia local simples.
- Evoluir preferencias de analytics de `localStorage` para persistencia no backend se virar necessidade real.

## Deploy

- Revisar variaveis de ambiente.
- Rodar migrations em ambiente de producao com `npx prisma migrate deploy`.
- Configurar URLs de redirect no Supabase Auth.
- Revisar cookies, HTTPS e politicas de seguranca antes de producao.
- Confirmar que `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` pertencem ao projeto correto.

## Segurança

- Revisar autorizacao em todos os endpoints privados.
- Evitar expor mensagens internas de erro.
- Considerar testes automatizados para acesso cruzado entre usuarios.
- Revisar regras de Row Level Security no Supabase antes de producao.
- Considerar persistir preferencias de notificacao/analytics no backend se precisarem sincronizar entre dispositivos.
- Trocar confirmacoes nativas (`window.confirm`) por dialogs acessiveis antes de polimento final.
- Revisar vulnerabilidades moderadas reportadas por `npm audit` em `next/postcss`
  e `prisma/@prisma/dev/@hono/node-server`. O audit sugere
  `npm audit fix --force`, mas isso envolve mudancas breaking e deve ser
  planejado/testado separadamente.

## Robustez

- Padronizar helper frontend para `fetch` com `credentials: "include"` e leitura segura de erro HTTP.
- Adicionar fallback visual para falhas parciais de analytics/PR sem bloquear o dashboard inteiro.
- Monitorar performance de `/api/progression/analytics` quando usuarios tiverem muitos workouts.
