# AGENTS.md — Projeto DormeAqui

Você está trabalhando no projeto DormeAqui, uma aplicação full stack de hospedagens, inspirada em experiências de reserva, gestão de acomodações, pagamentos, operação de anfitriões e jornada de hóspedes.

Este arquivo define regras globais para qualquer implementação no projeto.

---

## 1. Objetivo do produto

O DormeAqui deve parecer um produto real, moderno, profissional, minimalista e pronto para mercado.

A interface deve transmitir:

- Confiança
- Clareza
- Organização
- Simplicidade
- Profissionalismo
- Boa experiência para hóspedes e anfitriões

Evite interfaces com aparência de:

- Template genérico
- Painel administrativo antigo
- Protótipo sem acabamento
- Tela poluída
- Layout improvisado

---

## 2. Stack principal

Use os padrões existentes do projeto.

Stack provável:

- React
- Tailwind CSS
- Node.js
- Express
- MongoDB
- API REST

Não altere a stack sem necessidade.

Não adicione novas bibliotecas sem justificar claramente.

---

## 3. Documentos obrigatórios de design

Antes de alterar qualquer tela, componente ou fluxo visual, leia:

- `/docs/design/design-direction.md`
- `/docs/design/ui-rules.md`
- `/docs/design/bad-patterns.md`
- `/docs/design/component-patterns.md`
- `/docs/design/dashboard-references.md`, somente se a task envolver dashboards, KPIs, área do anfitrião, relatórios ou gestão

Também analise as imagens da pasta:

- `/docs/references`

Use as imagens apenas como referência visual, estrutural e estética.

Não copie literalmente nenhuma interface.

Extraia apenas padrões de qualidade:

- Hierarquia visual
- Espaçamento
- Aplicar uma transição suave no estado :hover para reforçar a affordance de clique.
- Grid
- Proporção dos elementos
- Organização dos blocos
- Estilo dos botões
- Estilo dos inputs
- Tratamento de ícones
- Uso de cores
- Estados visuais
- Responsividade
- Aparência de produto SaaS moderno

---

## 4. Direção visual global

Toda interface deve seguir este estilo:

- Moderna
- Profissional
- Minimalista
- Limpa
- Sofisticada
- Leve
- Responsiva
- Com bastante respiro visual
- Com hierarquia clara
- Com tipografia consistente
- Com cores neutras como base
- Com cor principal usada apenas para ações, destaques e estados importantes

Evite:

- Excesso de cards coloridos
- Gradientes fortes sem função
- Sombras pesadas
- Ícones grandes demais
- Bordas muito marcadas
- Layout apertado
- Elementos desalinhados
- Textos longos sem necessidade
- Botões competindo entre si
- Componentes com tamanhos inconsistentes
- Informação competindo com o mesmo peso visual

---

## 5. Regra global de UX

Antes de adicionar qualquer elemento na tela, avalie:

- Isso ajuda o usuário a realizar uma ação?
- Isso melhora a clareza?
- Isso precisa aparecer nesta tela?
- Isso deveria estar em uma área mais específica?
- Isso está competindo com algo mais importante?
- Isso aumenta a confiança do usuário?
- Isso reduz fricção ou cria mais ruído?

A interface deve priorizar clareza antes de decoração.

---

## 6. Padrões por tipo de tela

### Páginas públicas

Exemplos:

- Home
- Página de detalhes da acomodação
- Busca
- Listagem de acomodações
- Login
- Cadastro

Devem priorizar:

- Clareza
- Conversão
- Confiança
- Escaneabilidade
- Boa apresentação visual
- CTAs evidentes
- Textos curtos
- Prova visual da acomodação
- Responsividade forte em mobile

Evite:

- Layout muito institucional
- Textos excessivos
- Muitos CTAs competindo
- Falta de destaque para ação principal
- Imagens pequenas demais
- Informações importantes escondidas

---

### Fluxos de reserva

Exemplos:

- Seleção de datas
- Escolha de hóspedes
- Resumo da reserva
- Pagamento
- Confirmação

Devem priorizar:

- Segurança
- Clareza
- Redução de dúvidas
- Transparência de preço
- Estados de erro bem explicados
- Feedback visual claro
- Etapas previsíveis

Evite:

- Mudanças bruscas de layout
- Taxas ou valores escondidos
- Botões ambíguos
- Formulários longos sem organização
- Mensagens de erro genéricas

---

### Área do anfitrião

Exemplos:

- Central do Anfitrião
- Agenda
- Reservas
- Acomodações
- Financeiro
- Relatórios
- Operação

Devem priorizar:

- Decisão rápida
- Organização
- Gestão operacional
- Visual limpo
- Dados com contexto
- Ações claras
- Separação entre resumo e detalhe

Regras específicas da área do anfitrião devem ficar em:

- `/docs/design/host-dashboard-guidelines.md`

---

### Formulários

Devem priorizar:

- Labels claros
- Campos bem agrupados
- Validação visível
- Mensagens de erro úteis
- Estados de foco
- Responsividade
- Ordem lógica dos campos

Evite:

- Placeholder substituindo label
- Erros genéricos
- Campos desalinhados
- Botões distantes demais
- Formulários muito longos sem divisão

---

### Modais, drawers e popovers

Devem priorizar:

- Objetivo único
- Título claro
- Ação principal evidente
- Ação secundária discreta
- Fechamento fácil
- Conteúdo curto

Evite:

- Modais com muitas responsabilidades
- Múltiplos botões com mesmo peso
- Conteúdo longo demais
- Scroll interno desnecessário

---

## 7. Regras técnicas globais

Ao implementar qualquer task:

1. Entenda a task antes de alterar código.
2. Leia os documentos relevantes de `/docs/design`.
3. Analise as referências visuais em `/docs/references`.
4. Entenda os componentes existentes.
5. Entenda de onde vêm os dados.
6. Preserve dados dinâmicos.
7. Preserve chamadas de API.
8. Preserve hooks, props e contextos existentes.
9. Preserve regras de negócio.
10. Faça alterações incrementais.
11. Crie componentes reutilizáveis quando fizer sentido.
12. Evite duplicação de código.
13. Não reescreva telas inteiras sem necessidade.
14. Não substitua dados reais por mocks permanentes.
15. Não remova funcionalidades existentes.
16. Não altere contratos da API sem necessidade.
17. Não altere autenticação, pagamentos ou reservas sem relação direta com a task.

---

## 8. Dados e regras de negócio

Regra geral:

O front-end deve exibir dados, controlar estados visuais e interações de interface.

Regras de negócio, cálculos, validações críticas, agregações e decisões sensíveis devem ficar no back-end sempre que aplicável.

O front-end não deve calcular dados derivados críticos como:

- Receita
- Lucro
- Ocupação
- Avaliação média
- Diária média
- Disponibilidade real
- Conflito de reserva
- Status financeiro final
- Taxas
- Reembolsos
- Penalidades
- Alertas críticos
- Projeções financeiras

Se algum dado não vier do back-end:

- Não invente mock permanente.
- Não crie cálculo crítico no front-end.
- Exiba estado vazio, indisponível ou placeholder controlado.
- Liste no resumo final qual campo ou endpoint precisaria ser criado futuramente.

---

## 9. Componentes recomendados

Quando fizer sentido, crie ou reaproveite componentes como:

- `PageHeader`
- `SectionHeader`
- `Container`
- `Card`
- `KpiCard`
- `InsightCard`
- `PropertyCard`
- `ReservationCard`
- `ChartCard`
- `EmptyState`
- `LoadingSkeleton`
- `StatusBadge`
- `AlertBadge`
- `Modal`
- `Drawer`
- `Tabs`
- `SearchInput`
- `FilterBar`
- `DatePicker`
- `PriceSummary`
- `ActionButton`

Use nomes compatíveis com o padrão atual do projeto.

Não crie componentes duplicados se já existir algo equivalente.

---

## 10. Responsividade

Toda tela deve funcionar bem em:

- Desktop
- Tablet
- Mobile

Regras:

- Desktop deve ter grid limpo e hierarquia clara.
- Tablet deve adaptar colunas sem apertar componentes.
- Mobile deve priorizar leitura vertical.
- Cards devem empilhar de forma natural.
- Tabelas largas devem virar listas ou cards quando necessário.
- Nenhum texto importante deve ficar escondido.
- Nenhum valor financeiro deve aparecer truncado como `R...`.
- Botões devem ser fáceis de tocar no mobile.
- Inputs devem ser confortáveis em telas pequenas.

---

## 11. Estados obrigatórios

Sempre que aplicável, prever:

- Loading
- Empty state
- Erro
- Dados insuficientes
- Dados carregados
- Sucesso
- Falha de envio
- Ação em andamento

Estados vazios devem orientar o usuário.

Mensagens de erro devem ser claras e úteis.

Não deixe a tela quebrada quando um endpoint não retornar dados.

---

## 12. Acessibilidade básica

Sempre que possível:

- Use textos legíveis.
- Preserve contraste adequado.
- Use foco visível em elementos interativos.
- Use botões para ações e links para navegação.
- Não dependa apenas de cor para comunicar estado.
- Use `aria-label` quando ícones não tiverem texto.
- Mantenha ordem lógica de navegação por teclado.

---

## 13. Checklist final obrigatório

Ao finalizar qualquer task, revise:

- A task foi cumprida?
- A interface ficou mais clara?
- A hierarquia visual melhorou?
- O layout tem respiro?
- Os componentes estão alinhados?
- As cores têm propósito?
- A tipografia está consistente?
- A responsividade foi preservada ou melhorada?
- Os dados dinâmicos continuam funcionando?
- Nenhuma funcionalidade existente foi quebrada?
- Nenhum cálculo crítico novo foi criado no front-end?
- O código ficou mais organizado?
- A tela parece um produto profissional?

---

## 14. Resposta final esperada

Ao terminar uma implementação, retorne:

1. Resumo do que foi implementado
2. Arquivos alterados
3. Componentes criados ou refatorados
4. O que foi reorganizado visualmente
5. Dados que ainda dependem do back-end, se houver
6. Confirmação de que nenhuma regra de negócio foi quebrada
7. Pontos que ainda podem ser refinados depois
