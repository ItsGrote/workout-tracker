# UI Redesign Plan

Plano profissional e implementavel para evoluir a interface do Workout Evolution
Tracker sem alterar arquitetura, regras de negocio, backend, APIs ou estrutura
de dados.

Este documento e exclusivamente de planejamento. A implementacao futura deve ser
feita em etapas pequenas, sempre preservando o fluxo atual:

Templates -> criar workout -> salvar treino -> workout summary motivacional ->
analytics/progression -> acompanhamento de evolucao.

## 1. Identidade visual

### Direcao do produto

Workout Evolution Tracker deve parecer um produto premium de acompanhamento de
evolucao real. A interface precisa comunicar que progresso acontece antes da
mudanca visual do corpo aparecer.

A sensacao geral deve ser:

- calma;
- precisa;
- motivadora sem gritar;
- organizada;
- analitica;
- humana;
- confiavel;
- feita para uso recorrente.

O app deve evitar qualquer estetica de "fitness neon gamer", painel admin
generico, fintech ou dashboard corporativo pesado. A experiencia deve parecer
uma mistura de diario de treino premium com produto de analytics pessoal.

### Principios visuais

1. Clareza antes de ornamentacao.
   A interface deve deixar obvio o que melhorou, o que falta fazer e qual e o
   proximo passo.

2. Progresso como narrativa.
   Cards, graficos e popups devem reforcar evolucao, consistencia e conquista.
   O foco visual deve destacar diferencas, acumulados e sinais positivos sem
   depender de cores agressivas.

3. Poucas cores, muita hierarquia.
   O app deve usar duas cores dominantes principais e trabalhar contraste,
   superficie, tipografia e espacamento para criar profundidade.

4. Mobile-first real.
   Workout logging e consulta rapida de progresso devem funcionar bem no celular.
   Touch targets, modais e formularios precisam ser confortaveis.

5. Interface de longa duracao.
   O usuario pode olhar graficos e editar treinos por varios minutos. Cores,
   contraste e densidade devem evitar fadiga visual.

### Personalidade visual

- Premium, mas nao luxuosa demais.
- Tecnica, mas nao fria.
- Motivadora, mas nao infantil.
- Minimalista, mas nao vazia.
- Analitica, mas nao corporativa.

## 2. Paleta de cores

### Cores dominantes obrigatorias

| Papel | Cor | Hex |
| --- | --- | --- |
| Principal | Azul petroleo profundo | `#1F3A45` |
| Secundaria | Areia quente suave | `#D8C3A5` |

Essas duas cores devem dominar a identidade. Outras cores existem apenas como
suporte funcional para texto, bordas, sucesso, erro, warning e estados de dados.

### Light mode recomendado

| Uso | Direcao |
| --- | --- |
| Background principal | Branco levemente aquecido ou cinza frio quase branco. Evitar branco puro em toda a tela. |
| Superficies | Branco quente ou off-white com borda suave. |
| Cards principais | Superficie clara, borda areia/petroleo em baixa opacidade. |
| Texto principal | Azul petroleo muito escuro, quase preto. |
| Texto secundario | Azul petroleo dessaturado em opacidade media. |
| Bordas | Areia suave ou cinza azulado claro. |
| Hover | Areia muito clara para itens neutros; petroleo suave para itens ativos. |
| Elementos ativos | Azul petroleo profundo. |
| Destaques motivacionais | Areia quente suave com texto petroleo. |
| Graficos | Petroleo para serie principal; areia para serie secundaria. |
| Sucesso | Verde natural e contido, sem neon. |
| Erro | Vermelho terroso, baixo brilho. |
| Warning | Ambar queimado, usado com parcimonia. |

### Dark mode futuro

Mesmo que dark mode nao seja implementado agora, a paleta deve ser planejada
para suportar:

| Uso | Direcao |
| --- | --- |
| Background principal | Azul petroleo quase preto. |
| Superficies | Petroleo escuro elevado, sem preto puro. |
| Cards | Superficie escura com borda areia em baixa opacidade. |
| Texto principal | Areia muito clara ou off-white. |
| Texto secundario | Areia dessaturada. |
| Elementos ativos | Areia quente para acao primaria em fundo escuro. |
| Graficos | Areia como linha principal; petroleo claro/azulado como suporte. |

### Regras de uso de cor

- Azul petroleo deve conduzir navegacao, acoes principais, titulos fortes e
  graficos primarios.
- Areia deve suavizar estados ativos, badges, fundos de destaque e micro
  recompensas.
- Nao usar gradientes dominantes como base visual.
- Nao usar neon.
- Nao usar varias cores de categoria no MVP; isso prejudicaria a identidade e
  poderia virar ruido.
- Estados funcionais podem usar cores auxiliares, mas devem aparecer em areas
  pequenas: mensagens, bordas, badges e alertas.

### Aplicacao em analytics

- Serie principal: azul petroleo.
- Serie secundaria, como average weight: areia em tom mais escuro para contraste.
- Grid do grafico: borda neutra muito suave.
- Tooltip: superficie clara, borda discreta, titulo em petroleo.
- Valores positivos: usar texto petroleo com badge areia, nao verde chamativo por
  padrao.
- Valores negativos: usar vermelho terroso discreto, focando em informacao e nao
  punicao visual.

## 3. Tipografia

### Familia tipografica

Manter uma familia system/sans moderna na primeira fase para evitar dependencias
novas. A direcao recomendada e:

- system sans como base;
- evitar fontes decorativas;
- manter alta legibilidade em numeros, labels e formularios.

Em uma fase futura, se a equipe aceitar dependencias ou fontes externas, avaliar
Inter, Geist ou similar. Isso nao deve ser parte do primeiro redesign.

### Hierarquia sugerida

| Elemento | Tamanho desktop | Tamanho mobile | Peso | Uso |
| --- | --- | --- | --- | --- |
| Page title | 32-40px | 28-32px | 650-700 | Dashboard, Progression |
| Section title | 20-24px | 18-22px | 650 | Cards grandes e blocos |
| Card title | 16-18px | 16px | 600 | Workouts, templates, summary |
| Metric value | 28-40px | 24-32px | 700 | Volume, streak, PR |
| Body | 14-16px | 14-16px | 400 | Descricoes e conteudo |
| Label | 12-14px | 12-14px | 500-600 | Inputs, filtros |
| Caption | 12-13px | 12px | 400 | Metadados, datas |
| Button | 14-15px | 14px | 600 | Acoes |

### Numeros e dados

- Valores como `12,450kg`, `+28.5%`, `3/4` devem ter peso maior e alinhamento
  consistente.
- Evitar tamanhos gigantes dentro de cards pequenos.
- Usar tabular numerals se a stack futura permitir sem dependencia; caso
  contrario, manter alinhamento visual por layout.

### Espacamento tipografico

- Nao usar letter spacing negativo.
- Uppercase apenas para labels curtos, com tracking discreto.
- Evitar paragrafos longos em cards.
- Titulos devem ser literais e funcionais, nao marketing.

## 4. Espacamento e layout

### Grid geral

O layout deve usar uma largura maxima consistente:

- Dashboard: max-width entre 1180px e 1280px.
- Analytics: max-width entre 1180px e 1320px.
- Modais grandes: max-width entre 720px e 960px, dependendo do conteudo.
- Settings sidebar: largura desktop entre 380px e 440px.

### Sistema de espacamento

Usar escala previsivel:

- 4px: micro ajustes.
- 8px: separacao interna pequena.
- 12px: grupos compactos.
- 16px: padding padrao de itens.
- 20px/24px: padding de cards.
- 32px: separacao entre secoes.
- 48px: respiracao entre blocos maiores.

### Direcao de layout

- Reduzir cards dentro de cards.
- Usar secoes full-width com conteudo centralizado.
- Priorizar grupos claros: overview, action area, workouts, templates,
  analytics.
- Em mobile, cada bloco deve ocupar largura total e preservar touch targets.

### Desktop

- Header/nav no topo com peso visual baixo.
- Dashboard deve priorizar cards de consistencia/metas e acoes de treino.
- Workouts e templates podem aparecer em blocos separados com listagem compacta.
- Analytics deve usar filtros no topo, grafico no centro e insights abaixo.

### Mobile

- Uma coluna principal.
- Botoes primarios largos quando forem acoes principais.
- Listas com spacing maior entre itens clicaveis.
- Evitar toolbars horizontais que quebram texto.
- Graficos com altura fixa responsiva e labels simplificados.

## 5. Sistema de cards

### Base visual

Cards devem parecer superficies calmas e intencionais:

- radius entre 8px e 12px;
- borda sutil;
- sombra minima ou nenhuma;
- background claro com diferenca suave do fundo;
- padding consistente;
- hover discreto apenas quando o card for interativo.

### Hierarquia de cards

1. Cards de metrica principal.
   - Exemplo: consistencia semanal, volume total, PRs.
   - Devem ter numero forte, label curto e micro texto explicativo.

2. Cards de entidade.
   - Exemplo: workout, template, exercise.
   - Devem ser escaneaveis: nome, categoria/data, contagem, acoes.

3. Cards de analytics.
   - Devem destacar valor e significado.
   - Nao devem parecer caixas iguais sem prioridade.

4. Cards de estado vazio.
   - Devem ser intencionais, com borda dashed discreta e chamada de acao clara.

### Padrões por tipo

| Tipo | Direcao visual |
| --- | --- |
| Workout card | Nome forte, categoria/date como metadata, acoes alinhadas e discretas. |
| Template card | Diferenciar de workout real com badge `Template`, areia suave e copy clara. |
| Streak card | Mostrar progresso como `3/4`, barra discreta e status textual. |
| Analytics card | Numero principal, label curto, explicacao opcional pequena. |
| Summary card | Destaque para evolucao percentual e volume. |
| PR card | Badge de conquista sem exagero visual. |
| Settings card | Formulario limpo, labels claros, grupos separados. |
| Exercise card | Estrutura compacta, sets como linhas ou grupos visuais. |

### Estados

- Hover: borda levemente mais forte ou background sutil.
- Active: borda petroleo e fundo areia muito leve.
- Disabled: opacidade reduzida, sem remover legibilidade.
- Loading: skeleton simples ou bloco com mensagem curta.
- Empty: borda dashed, iconografia opcional futura, CTA evidente.

## 6. Botoes

### Tipos

| Tipo | Uso | Direcao visual |
| --- | --- | --- |
| Primary | Criar workout, salvar, iniciar treino | Fundo petroleo, texto claro. |
| Secondary | Duplicar, editar, filtros importantes | Borda petroleo/neutral, fundo claro. |
| Ghost | Navegacao e acoes secundarias leves | Sem borda forte, hover suave. |
| Danger | Delete workout/template/set | Texto vermelho terroso, borda discreta. |
| Disabled | Requests ou estados invalidos | Baixa opacidade, cursor claro. |
| Loading | Save em andamento | Label estavel, spinner discreto se houver. |

### Regras

- Acao primaria por bloco deve ser clara e unica.
- Evitar muitos botoes com mesmo peso visual na mesma linha.
- Em mobile, botoes criticos devem ter altura minima de 44px.
- Texto de botao deve ser curto e direto.
- Botoes de perigo devem exigir confirmacao, mas visualmente nao devem dominar a
  tela ate que o usuario esteja no contexto da acao.

### Acoes mobile

- Preferir botao primario full-width em rodape de modal.
- Acoes secundarias podem ficar empilhadas ou em menu simples se houver muitas.
- Evitar que botoes fiquem pequenos demais em cards de workout/template.

## 7. Modais

### Base

Modais atuais incluem create workout, edit workout, duplicate workout, template
editor, popups de PR, goal achievement e workout summary. O redesign deve
padronizar:

- backdrop escuro suave;
- superficie clara com radius consistente;
- header fixo quando o conteudo for longo;
- footer de acoes sempre acessivel;
- scroll interno previsivel;
- padding generoso;
- largura adaptada ao conteudo.

### Create workout

- Deve separar claramente:
  1. dados do workout;
  2. `Use template`;
  3. exercicios;
  4. sets;
  5. salvar.
- O template aplicado deve parecer um ponto de partida editavel.
- Sets precisam ser legiveis em mobile.

### Edit workout

- Manter a hierarquia atual de workout -> exercise -> set type -> sets.
- Usar visual de editor, nao lista solta.
- Destacar alteracoes pendentes com feedback discreto.
- Footer deve deixar `Save edits` sempre acessivel.
- `Delete workout` deve ficar visualmente separado das acoes principais.

### Template editor

- Parecido com workout editor, mas com sinais visuais de que nao e treino real.
- Nao sugerir reps/weight no template.
- Mostrar contagem de exercises e set slots.

### Settings

- Continuar como sidebar, nao modal central.
- Se houver confirmacoes, elas podem futuramente usar dialog pequeno consistente.

### Workout summary e PR

- Devem parecer recompensa tranquila, nao popup promocional.
- Destaque principal: evolucao percentual/volume.
- PRs e streaks aparecem como conquistas menores.
- Fechar deve ser facil e nao bloquear permanentemente a aplicacao.

### Mobile

- Modais longos devem ocupar quase a tela inteira.
- Header e footer fixos sao recomendados para editores.
- Evitar modais dentro de modais.
- Confirmacoes devem ser simples e nao esconder contexto.

## 8. Sidebar / Settings

### Organizacao

Settings deve continuar como painel lateral com secoes:

- Streak settings;
- Popup settings.

Futuras secoes podem existir, mas nao devem ser adicionadas no redesign visual.

### Direcao visual

- Header claro com titulo `Settings` e botao de fechar.
- Navegacao interna simples, em tabs ou lista vertical compacta.
- Secao ativa com fundo areia suave e texto petroleo.
- Formulario com grupos bem separados.
- Footer fixo para salvar quando a secao tiver formulario.

### Desktop

- Sidebar entra pela direita.
- Backdrop suave.
- Largura suficiente para campos e mensagens sem quebrar.

### Mobile

- Painel full-width ou quase full-width.
- Scroll interno.
- Save sempre acessivel.
- Toggle e inputs com touch target confortavel.

## 9. Dashboard principal

### Objetivo

O dashboard deve responder rapidamente:

- Estou consistente?
- Estou evoluindo?
- Qual meu proximo treino/acao?
- Quais conquistas recentes aconteceram?
- Onde registro o treino?

### Organizacao sugerida

1. Top nav simples.
   - Brand/nome do app.
   - Link para Progression.
   - Settings.
   - Logout.

2. Hero operacional pequeno.
   - Saudacao ou frase curta de progresso.
   - CTA `Create workout`.
   - CTA secundario `Use template` pode continuar dentro do modal, nao precisa
     virar nova feature.

3. Consistencia e metas.
   - Streak weekly/monthly ativos.
   - Prioridade alta porque disciplina e progresso sao centrais.

4. Summary/progression snapshot.
   - Volume recente.
   - Grafico basico atual.
   - PRs recentes.

5. Templates.
   - Card compacto para acelerar treino.
   - Estado vazio orientado.

6. Workouts.
   - Lista limitada com `View more`.
   - Acoes claras: edit, save as template.

### Regras visuais

- Evitar densidade de painel administrativo.
- Evitar muitos cards do mesmo tamanho competindo.
- Usar hierarchy por tamanho, spacing e peso tipografico.
- CTA principal deve estar sempre facil de achar.

### Componentes envolvidos

- `src/components/dashboard/dashboard-client.tsx`
- `src/components/dashboard/dashboard-nav.tsx`
- `src/components/dashboard/summary-card.tsx`
- `src/components/dashboard/consistency-card.tsx`
- `src/components/dashboard/progression-chart.tsx`
- `src/components/dashboard/personal-records-card.tsx`
- `src/components/dashboard/template-management-card.tsx`
- `src/components/dashboard/workout-management-card.tsx`
- `src/components/dashboard/empty-onboarding.tsx`

## 10. Progression Analytics

### Objetivo

A pagina `/progression` deve parecer uma area premium para investigar evolucao,
sem virar dashboard financeiro ou painel corporativo.

### Estrutura visual sugerida

1. Header.
   - Titulo curto: `Progression Analytics`.
   - Descricao clara: escolha workout/exercise e veja tendencia.
   - Link de volta ao dashboard.

2. Tipo de analytics.
   - Segmented control entre `Workout Analytics` e `Exercise Analytics`.
   - Deve parecer uma escolha central, nao apenas um select comum.

3. Filtros.
   - Searchable select.
   - Range.
   - Chart style.
   - Metric somente em Exercise.
   - Show average weight somente em Exercise.

4. Grafico.
   - Superficie ampla.
   - Grid suave.
   - Tooltip legivel.
   - Titulo com filtro selecionado e metrica.

5. Insights.
   - Cards abaixo do grafico.
   - Workout: evolucao percentual, highest volume, average volume, total
     accumulated volume, workouts analyzed.
   - Exercise: progression percentage, highest weight, average weight, total
     accumulated volume, sessions analyzed.

### Estados vazios

- Sem workouts: `No workouts found yet`.
- Sem exercicios: `No exercises found yet`.
- Sem selecao: orientar a escolher um tipo e item.
- Dados insuficientes: `Complete more workouts to unlock progression insights`.

### Componentes envolvidos

- `src/app/progression/page.tsx`
- `src/components/progression/progression-analytics-client.tsx`
- `src/components/progression/searchable-select.tsx`
- `src/components/progression/progression-analytics-state.ts`

### Regras

- Nao recalcular regra pesada no frontend.
- Continuar consumindo `GET /api/progression/analytics`.
- Manter `localStorage` para preferencias.
- Nao criar novos endpoints por causa do redesign visual.

## 11. Templates

### Listagem

Templates devem ser visualmente diferentes de workouts reais:

- badge `Template`;
- cor de apoio areia;
- copy explicando que nao conta progresso ate salvar workout real;
- contagem de exercises e set slots.

### Criacao e edicao

- Editor deve parecer estrutura reutilizavel.
- Sets como slots, nao performance.
- Nao mostrar campos de reps/weight no template.
- Acoes: create, edit, delete, start workout.

### Integracao com create workout

- `Use template` dentro do create workout deve parecer atalho, nao fluxo
  separado.
- Depois de aplicar template, deixar claro que reps/weight ainda precisam ser
  preenchidos.

### Estados vazios

- Estado vazio deve sugerir: criar do zero ou salvar workout existente como
  template.

## 12. Workout Summary

### Objetivo emocional

O summary e a recompensa pos-treino. Deve fazer o usuario sentir que o treino
gerou dado, progresso e continuidade.

### Hierarquia recomendada

1. Comparacao percentual.
   - Maior destaque.
   - Sinal positivo/negativo claro.
   - Mensagem amigavel quando for primeiro treino comparavel.

2. Volume total.
   - Numero forte, unidade clara.

3. PRs.
   - Lista curta.
   - Se zero PRs, mostrar mesmo assim como informacao neutra.

4. Streaks ativos.
   - Weekly e monthly somente se ativos.
   - Mostrar `3/4`, `12/20` com barra discreta.

### Visual

- Fundo claro premium.
- Destaque em petroleo e areia.
- Celebracao discreta: micro animacao `rise` ou transicao suave, sem confete.
- Botao de fechar claro.

## 13. Estados vazios

### Principio

Estado vazio nao e erro. E uma oportunidade de orientar.

### Padroes

| Estado | Mensagem | Acao |
| --- | --- | --- |
| Sem workouts | `No workouts yet. Start with a simple session.` | `Create workout` |
| Sem templates | `No templates yet. Save a structure to log faster next time.` | `Create template` |
| Sem analytics | `Choose a workout or exercise to build your progression chart.` | Selecionar filtro |
| Sem historico suficiente | `Complete more workouts to unlock progression insights.` | Registrar novo treino |
| Sem exercicios | `No exercises found yet.` | Criar workout com exercicio |

### Visual

- Borda dashed discreta.
- Fundo levemente diferente da superficie.
- Texto curto.
- CTA unico.
- Evitar iconografia grande demais.

## 14. Responsividade mobile

### Breakpoints orientativos

- Mobile: ate 640px.
- Tablet: 641px a 1024px.
- Desktop: acima de 1024px.

### Touch targets

- Altura minima de botoes e inputs: 44px.
- Espaco minimo entre acoes: 8px.
- Evitar grupos de 4+ botoes na mesma linha em mobile.

### Dashboard mobile

- Uma coluna.
- CTA principal perto do topo.
- Cards de streak com largura total se houver apenas um ativo.
- Workouts/templates como listas verticais.
- `View more` full-width.

### Analytics mobile

- Filtros empilhados.
- Grafico com altura suficiente.
- Insights em uma coluna.
- Tooltip nao deve ocultar dados importantes.

### Modais mobile

- Editores quase full-screen.
- Header e footer fixos quando possivel.
- Scroll interno previsivel.
- Botoes de salvar sempre acessiveis.

### Sidebar mobile

- Full-width ou 92-96vw.
- Fechar sempre visivel.
- Save fixo no rodape.

## 15. Ordem segura de implementacao

### Estrategia geral

1. Criar fundacao visual por tokens existentes.
2. Ajustar tipografia e espacamento globais.
3. Padronizar cards e botoes.
4. Aplicar aos blocos do dashboard.
5. Aplicar aos modais e sidebar.
6. Aplicar a analytics.
7. Revisar mobile.
8. Fazer polimento fino.

### Riscos principais

- Alterar muitas classes de uma vez e quebrar layout mobile.
- Tornar modais mais bonitos, mas menos usaveis por scroll ruim.
- Melhorar analytics visualmente, mas reduzir legibilidade dos graficos.
- Criar discrepancia entre dashboard e `/progression`.
- Introduzir cores auxiliares demais e perder identidade.

### Rollback

- Implementar por arquivo/componente.
- Validar uma tela por vez.
- Evitar mudancas globais grandes depois dos componentes.
- Manter commits pequenos quando a implementacao futura acontecer.
- Se um checkpoint quebrar UX, reverter apenas aquele grupo visual.

### Validacao visual por etapa

- Desktop: dashboard, create workout, edit workout, settings, progression.
- Mobile: dashboard, create workout, edit workout, settings, progression.
- Estados: loading, empty, error, disabled, success.
- Fluxos: criar workout, usar template, editar workout, abrir summary, abrir
  analytics.

## Nao objetivos

Este plano nao inclui:

- mudanca de arquitetura;
- novas features;
- novas APIs;
- mudanca em Prisma;
- instalacao de bibliotecas;
- novo design system formal separado;
- dark mode implementado;
- refatoracao estrutural de componentes;
- alteracao de regras de negocio.
