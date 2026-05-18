# UI Redesign Checkpoints

Checkpoints para implementar futuramente o redesign visual do Workout Evolution
Tracker em etapas pequenas, seguras e reversiveis.

Todos os checkpoints abaixo devem preservar:

- arquitetura atual;
- regras de negocio;
- APIs existentes;
- services/repositories/controllers;
- Prisma/schema;
- fluxo funcional de workouts, templates, streaks, PRs, summary e analytics.

Status possiveis:

- `NOT STARTED`
- `IN PROGRESS`
- `COMPLETED`

## 1. Visual foundation tokens

Status: `COMPLETED`

### Objetivo

Atualizar a fundacao visual usando os tokens CSS existentes, aplicando a paleta
principal do produto:

- azul petroleo profundo `#1F3A45`;
- areia quente suave `#D8C3A5`.

Essa etapa deve mudar apenas a base visual, sem mexer na estrutura dos
componentes.

### Arquivos esperados

- `src/app/globals.css`

### Riscos

- Contraste insuficiente em textos ou botoes.
- Cores auxiliares ficando fortes demais.
- Alteracao global afetar telas de login/signup.

### Dependencias

- Nenhuma.

### Estrategia de validacao

- Rodar `npm run typecheck`.
- Rodar `npm run build`.
- Abrir dashboard, login, signup e `/progression`.
- Verificar contraste de texto principal, texto secundario, bordas e botoes.
- Confirmar que nenhum fluxo funcional mudou.

## 2. Typography and global rhythm

Status: `COMPLETED`

### Objetivo

Padronizar tipografia, pesos, tamanhos, line-height e ritmo vertical global.
Melhorar legibilidade de titulos, labels, metricas e textos de apoio sem
adicionar fontes externas.

### Arquivos esperados

- `src/app/globals.css`
- componentes com classes de tipografia muito especificas, se necessario:
  - `src/components/dashboard/*.tsx`
  - `src/components/progression/*.tsx`
  - `src/components/auth/*.tsx`

### Riscos

- Texto deixar de caber em botoes/cards.
- Metric cards ficarem grandes demais em mobile.
- Mudancas globais causarem regressao em modais.

### Dependencias

- Checkpoint 1.

### Estrategia de validacao

- Verificar dashboard desktop/mobile.
- Verificar modais de create/edit/template.
- Verificar `/progression` com grafico e insights.
- Confirmar que labels, inputs e botoes continuam legiveis.

## 3. Button and form controls polish

Status: `COMPLETED`

### Objetivo

Padronizar botoes primary, secondary, ghost, danger, disabled e loading. Ajustar
inputs, selects, searchable select, toggles e campos numericos para parecerem
parte do mesmo produto premium.

### Arquivos esperados

- `src/components/dashboard/create-workout-modal.tsx`
- `src/components/dashboard/edit-workout-modal.tsx`
- `src/components/dashboard/duplicate-workout-modal.tsx`
- `src/components/dashboard/template-editor-modal.tsx`
- `src/components/dashboard/settings-sidebar.tsx`
- `src/components/progression/searchable-select.tsx`
- `src/components/progression/progression-analytics-client.tsx`
- `src/components/auth/auth-form.tsx`

### Riscos

- Botoes de perigo ficarem pouco claros.
- Inputs pequenos demais em mobile.
- Searchable select perder clareza de estado aberto/fechado.

### Dependencias

- Checkpoints 1 e 2.

### Estrategia de validacao

- Testar create workout manual.
- Testar use template dentro do create workout.
- Testar edit workout com sets.
- Testar settings sidebar.
- Testar searchable select em `/progression`.

## 4. Card system

Status: `COMPLETED`

### Objetivo

Criar consistencia visual entre workout cards, template cards, streak cards,
analytics cards, summary cards, PR cards, settings cards e exercise cards.

Essa etapa deve ser feita com classes locais existentes, sem criar nova camada
de design system.

### Arquivos esperados

- `src/components/dashboard/summary-card.tsx`
- `src/components/dashboard/consistency-card.tsx`
- `src/components/dashboard/personal-records-card.tsx`
- `src/components/dashboard/workout-management-card.tsx`
- `src/components/dashboard/template-management-card.tsx`
- `src/components/dashboard/progression-chart.tsx`
- `src/components/dashboard/empty-onboarding.tsx`
- `src/components/progression/progression-analytics-client.tsx`

### Riscos

- Cards ficarem grandes demais.
- Dashboard parecer mais bonito, mas menos escaneavel.
- Cards interativos e nao interativos parecerem iguais.

### Dependencias

- Checkpoints 1, 2 e 3.

### Estrategia de validacao

- Comparar estados com e sem dados.
- Confirmar `View more` continua claro.
- Confirmar templates continuam visualmente diferentes de workouts reais.
- Confirmar cards de streak aparecem corretamente quando weekly/monthly estao
  ativos ou inativos.

## 5. Dashboard layout refinement

Status: `COMPLETED`

### Objetivo

Reorganizar visualmente o dashboard sem alterar fluxo funcional. Melhorar
hierarquia entre consistencia, metas, criar treino, templates, workouts, PRs e
grafico basico.

### Arquivos esperados

- `src/components/dashboard/dashboard-client.tsx`
- `src/components/dashboard/dashboard-nav.tsx`
- `src/components/dashboard/achievement-banner.tsx`
- `src/components/dashboard/dashboard-loading.tsx`
- `src/components/dashboard/dashboard-error.tsx`
- componentes de cards ja ajustados no checkpoint 4

### Riscos

- Alterar ordem visual e esconder CTA principal.
- Criar scroll excessivo em mobile.
- Quebrar expectativa do usuario que ja usa dashboard atual.

### Dependencias

- Checkpoint 4.

### Estrategia de validacao

- Testar carregamento inicial autenticado.
- Testar estado sem workouts.
- Testar estado com muitos workouts/templates.
- Testar create/edit/delete/duplicate apos mudanca visual.
- Confirmar que graficos/cards recarregam apos salvar.

## 6. Modal and editor redesign

Status: `COMPLETED`

### Objetivo

Melhorar create workout, edit workout, duplicate workout, template editor,
confirmacoes e popups sem alterar regras de validacao ou payloads.

Foco:

- header claro;
- footer de acoes acessivel;
- scroll interno previsivel;
- hierarquia workout -> exercises -> sets;
- mobile confortavel.

### Arquivos esperados

- `src/components/dashboard/create-workout-modal.tsx`
- `src/components/dashboard/edit-workout-modal.tsx`
- `src/components/dashboard/duplicate-workout-modal.tsx`
- `src/components/dashboard/template-editor-modal.tsx`
- `src/components/dashboard/personal-record-popup.tsx`
- `src/components/dashboard/goal-achievement-popup.tsx`
- `src/components/dashboard/workout-summary-popup.tsx`

### Riscos

- Modais ficarem grandes ou com scroll ruim.
- Footer de save ficar escondido.
- Delete workout/template ganhar destaque perigoso demais.
- Edicao de muitos exercicios ficar confusa.

### Dependencias

- Checkpoints 1 a 5.

### Estrategia de validacao

- Criar workout com multiplos exercicios e sets.
- Aplicar template no create workout.
- Editar workout existente.
- Remover todos os exercicios, bloquear save, adicionar novo valido e salvar.
- Editar template.
- Confirmar popups de PR e summary.
- Testar mobile estreito.

## 7. Settings sidebar refinement

Status: `COMPLETED`

### Objetivo

Refinar a sidebar de settings mantendo as secoes atuais:

- Streak settings;
- Popup settings.

Melhorar espacamento, estados ativos, toggle/input, mensagens de erro e footer
de save.

### Arquivos esperados

- `src/components/dashboard/settings-sidebar.tsx`
- `src/components/dashboard/consistency-card.tsx`
- `src/components/dashboard/dashboard-client.tsx`, apenas se necessario para
  abrir a secao correta visualmente

### Riscos

- Reintroduzir problema de conteudo cortado.
- Save ficar inacessivel em mobile.
- Confirmacao de desabilitar streak ficar pouco clara.

### Dependencias

- Checkpoints 1, 2, 3 e 6.

### Estrategia de validacao

- Abrir/fechar sidebar.
- Habilitar weekly e monthly.
- Testar valores invalidos.
- Desabilitar streak e cancelar/confirmar.
- Desabilitar/reabilitar PR popup e workout summary popup.
- Testar em mobile.

## 8. Progression Analytics visual redesign

Status: `IN PROGRESS`

### Objetivo

Refinar `/progression` para parecer uma area premium de investigacao de
evolucao, mantendo o endpoint e a logica existentes.

Foco:

- escolha clara entre Workout Analytics e Exercise Analytics;
- filtros organizados;
- grafico com superficie ampla;
- insights abaixo do grafico;
- estados vazios fortes e amigaveis;
- mobile legivel.

### Arquivos esperados

- `src/components/progression/progression-analytics-client.tsx`
- `src/components/progression/searchable-select.tsx`
- `src/components/progression/progression-analytics-state.ts`, apenas se
  necessario para preservar estado visual
- `src/app/progression/page.tsx`, somente se houver ajuste estrutural minimo da
  pagina

### Riscos

- Grafico perder legibilidade.
- Filtros ocuparem espaco demais.
- Insights parecerem dashboard financeiro.
- Searchable select quebrar restauracao de preferencia.

### Dependencias

- Checkpoints 1, 2, 3 e 4.

### Estrategia de validacao

- Abrir `/progression` sem preferencia.
- Restaurar preferencia salva.
- Testar Workout Analytics por nome e categoria.
- Testar Exercise Analytics com volume, max weight e average reps.
- Alternar bar/line.
- Testar intervalos 7d, 30d, 90d, 1y e all.
- Testar item inexistente/resetado.
- Verificar mobile.

## 9. Template experience polish

Status: `NOT STARTED`

### Objetivo

Deixar templates visualmente claros como atalhos de estrutura, nao workouts
realizados. Melhorar listagem, editor e integracao com create workout.

### Arquivos esperados

- `src/components/dashboard/template-management-card.tsx`
- `src/components/dashboard/template-editor-modal.tsx`
- `src/components/dashboard/create-workout-modal.tsx`

### Riscos

- Usuario confundir template com treino salvo.
- Start workout parecer que ja criou workout real.
- Estado vazio nao orientar bem.

### Dependencias

- Checkpoints 4 e 6.

### Estrategia de validacao

- Criar template.
- Editar template.
- Deletar template.
- Start workout por template.
- Use template dentro do create workout.
- Confirmar que reps/weight continuam vazios ate salvar workout real.

## 10. Empty, loading and error states

Status: `NOT STARTED`

### Objetivo

Padronizar estados vazios, loading e erro em dashboard, workouts, templates,
settings e analytics.

### Arquivos esperados

- `src/components/dashboard/dashboard-loading.tsx`
- `src/components/dashboard/dashboard-error.tsx`
- `src/components/dashboard/empty-onboarding.tsx`
- `src/components/dashboard/workout-management-card.tsx`
- `src/components/dashboard/template-management-card.tsx`
- `src/components/progression/progression-analytics-client.tsx`

### Riscos

- Estados vazios virarem texto demais.
- Loading parecer travamento.
- Erros esconderem informacao util.

### Dependencias

- Checkpoints 1 a 8.

### Estrategia de validacao

- Simular usuario sem workouts/templates.
- Simular erro de fetch quando possivel.
- Validar loading inicial do dashboard.
- Validar dados insuficientes em analytics.

## 11. Mobile polish pass

Status: `NOT STARTED`

### Objetivo

Fazer uma passada dedicada em mobile apos todos os blocos visuais principais.
Corrigir touch targets, scroll, overflow, textos quebrados e densidade.

### Arquivos esperados

- `src/components/dashboard/*.tsx`
- `src/components/progression/*.tsx`
- `src/components/auth/*.tsx`
- `src/app/globals.css`

### Riscos

- Ajustes mobile afetarem desktop.
- Modais longos ficarem desconfortaveis.
- Graficos ficarem baixos ou com labels sobrepostos.

### Dependencias

- Checkpoints 1 a 10.

### Estrategia de validacao

- Testar viewport mobile estreito.
- Criar workout completo no mobile.
- Editar workout no mobile.
- Abrir settings no mobile.
- Usar `/progression` no mobile.
- Verificar que nenhum texto importante sobrepoe outro.

## 12. Final visual QA and accessibility pass

Status: `NOT STARTED`

### Objetivo

Revisar consistencia final, contraste, foco, estados disabled, labels,
responsividade e polish visual.

### Arquivos esperados

- Ajustes pontuais nos arquivos tocados nos checkpoints anteriores.

### Riscos

- Polimento final virar refatoracao.
- Ajustes pequenos introduzirem inconsistencias.

### Dependencias

- Checkpoints 1 a 11.

### Estrategia de validacao

- Rodar `npm run typecheck`.
- Rodar `npm run build`.
- Rodar `npm run test`.
- Testar manualmente:
  - login/logout;
  - dashboard com dados;
  - dashboard vazio;
  - create workout;
  - edit workout;
  - delete workout;
  - templates;
  - settings;
  - PR popup;
  - workout summary popup;
  - `/progression`.
- Verificar contraste visual em light mode.
- Verificar foco de teclado em inputs e botoes principais.

## Ordem segura resumida

1. Visual foundation tokens.
2. Typography and global rhythm.
3. Button and form controls polish.
4. Card system.
5. Dashboard layout refinement.
6. Modal and editor redesign.
7. Settings sidebar refinement.
8. Progression Analytics visual redesign.
9. Template experience polish.
10. Empty, loading and error states.
11. Mobile polish pass.
12. Final visual QA and accessibility pass.

Essa ordem reduz risco porque comeca por fundacao visual, avanca para componentes
reutilizados e so depois entra nas telas e fluxos mais sensiveis.
