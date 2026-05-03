# AGENTS.md — Projeto DormeAqui

Você está trabalhando no projeto DormeAqui, uma aplicação full stack inspirada em hospedagens estilo Airbnb, com foco em ajudar anfitriões a gerenciar reservas, acomodações, operação, finanças e experiência dos hóspedes.

## Regra principal

Antes de implementar qualquer alteração visual, estrutural ou funcional, entenda o contexto do projeto e siga as regras deste arquivo.

Este projeto deve parecer um produto real, moderno, profissional, minimalista, limpo e pronto para mercado.

A interface não deve parecer template genérico, painel administrativo antigo ou dashboard poluído.

---

# Stack do projeto

Use os padrões existentes do projeto.

Stack principal:

- React
- Tailwind CSS
- Node.js
- Express
- MongoDB
- API REST

Não altere a stack sem necessidade.

Não adicione novas bibliotecas sem justificar.

---

# Documentos obrigatórios de design

Antes de alterar qualquer tela, leia os arquivos:

- `/docs/design/design-direction.md`
- `/docs/design/ui-rules.md`
- `/docs/design/bad-patterns.md`
- `/docs/design/component-patterns.md`
- `/docs/design/dashboard-references.md`

Também analise as imagens da pasta:

- `/docs/references`

As imagens devem ser usadas apenas como referência visual, estrutural e estética.

Não copie literalmente nenhuma interface.

Extraia apenas padrões de qualidade:

- Hierarquia visual
- Espaçamento
- Grid
- Proporção dos cards
- Organização dos blocos
- Estilo dos botões
- Estilo dos inputs
- Aplicar uma transição suave no estado :hover para reforçar a affordance de clique.
- Tratamento de ícones
- Uso de cores
- Estados visuais
- Responsividade
- Aparência de produto SaaS moderno

---

# Direção visual obrigatória

Toda tela deve seguir este estilo:

- Moderna
- Profissional
- Minimalista
- Limpa
- Sofisticada
- Com bastante respiro visual
- Com hierarquia clara
- Com tipografia consistente
- Com cards bem organizados
- Com cores neutras como base
- Com cor principal usada apenas para ações, destaques e estados importantes
- Com aparência de SaaS premium

Evite:

- Excesso de cards coloridos
- Gradientes fortes sem função
- Sombras pesadas
- Ícones grandes demais
- Bordas muito marcadas
- Layout apertado
- Informação competindo com o mesmo peso visual
- Visual genérico de dashboard pronto
- Aparência de painel administrativo antigo
- Elementos decorativos sem função

---

# Regra de UX

Priorize clareza e decisão.

Antes de adicionar qualquer informação na tela, pergunte:

- Isso ajuda o usuário a decidir algo?
- Isso precisa estar nesta tela?
- Isso deveria estar em uma área específica?
- Isso está competindo com algo mais importante?
- Isso melhora a experiência ou só aumenta a densidade visual?

O usuário deve entender a tela principal em poucos segundos.

---

# Central do Anfitrião

A Central do Anfitrião deve ser organizada por áreas.

## Navegação lateral

Agrupe os itens assim:

### Principal

- Visão geral
- Agenda
- Reservas
- Acomodações

### Operação

- Pré-check-in
- Limpeza e vistoria
- Manutenção e danos

### Gestão

- Financeiro
- Relatórios
- Histórico

A sidebar deve ter boa hierarquia visual, labels discretas e espaçamento consistente.

---

# Papel de cada área

## Visão geral

A Visão geral deve funcionar como uma central de decisão rápida.

Ela deve mostrar apenas informações prioritárias e resumidas.

Deve responder:

- O que preciso fazer hoje?
- Existe algum problema urgente?
- Quais são as próximas movimentações?
- Como está o resumo financeiro?
- Como meus imóveis estão performando em alto nível?

Deve conter, no máximo:

- Resumo do dia
- Precisa da sua atenção
- Próximas movimentações
- Resumo financeiro compacto
- Desempenho geral compacto

Não exibir na Visão geral:

- Calendário mensal completo
- Gráficos completos
- Listas longas de reservas
- Relatórios detalhados
- Histórico
- Métricas financeiras muito específicas
- Dados operacionais completos
- Informações repetidas

## Agenda

Deve concentrar:

- Calendário mensal completo
- Reservas por data
- Check-ins e check-outs
- Bloqueios de datas
- Limpezas agendadas
- Vistorias programadas
- Alertas de dias vazios
- Sugestões de ajuste de preço por data

## Reservas

Deve concentrar:

- Todas as reservas
- Reservas pendentes
- Confirmadas
- Em andamento
- Finalizadas
- Canceladas
- Detalhes do hóspede
- Status do pagamento
- Status do check-in
- Histórico da reserva

## Acomodações

Deve concentrar:

- Lista de imóveis
- Status do anúncio
- Imóveis ativos
- Imóveis pausados
- Imóveis com alerta
- Preço base
- Disponibilidade
- Avaliação por imóvel
- Performance resumida por acomodação

## Pré-check-in

Deve concentrar:

- Pré-check-ins pendentes
- Documentos enviados
- Documentos faltando
- Dados do hóspede
- Horário previsto de chegada
- Confirmação das regras da casa
- Placa do veículo
- Observações antes da entrada

## Limpeza e vistoria

Deve concentrar:

- Limpezas pendentes
- Limpezas concluídas
- Vistorias pendentes
- Vistorias concluídas
- Checklist de limpeza
- Checklist de vistoria
- Responsável pela tarefa
- Prazo antes do próximo check-in

## Financeiro

Deve concentrar:

- Receita bruta do mês
- Receita líquida do mês
- Lucro estimado
- Despesas operacionais
- Receita futura
- Ganho por noite disponível
- Diária média
- Pagamentos recebidos
- Reembolsos
- Taxas
- Custos por imóvel
- Comparativo mês atual vs mês anterior

## Manutenção e danos

Deve concentrar:

- Ocorrências abertas
- Danos reportados
- Manutenções pendentes
- Manutenções concluídas
- Custo estimado
- Prioridade
- Fotos/anexos
- Status da resolução
- Imóvel afetado

## Relatórios

Deve concentrar:

- Dinheiro ao longo do tempo
- Ocupação ao longo do tempo
- Como cada imóvel está indo
- Receita por imóvel
- Avaliação por imóvel
- Comparativo mensal
- Relatório de reservas
- Relatório financeiro
- Relatório operacional

## Histórico

Deve concentrar:

- Reservas arquivadas
- Check-ins realizados
- Check-outs realizados
- Limpezas concluídas
- Vistorias concluídas
- Manutenções finalizadas
- Ocorrências resolvidas
- Alterações feitas em acomodações
- Eventos importantes da conta

---

# Regra técnica obrigatória para dados

Todos os cálculos, agregações, filtros de período, classificações, alertas, KPIs e dados derivados devem ser processados no back-end.

O front-end deve apenas:

- Consumir endpoints da API
- Renderizar dados recebidos
- Exibir estados visuais
- Controlar layout e responsividade

O front-end não deve calcular:

- Receita
- Lucro
- Ocupação
- Avaliação média
- Diária média
- Pendências agregadas
- Alertas críticos
- Próximos eventos
- Comparativos
- Projeções financeiras
- Quantidades operacionais derivadas de listas brutas

Se algum dado ainda não existir no back-end:

- Não invente mock permanente.
- Não crie cálculo no front-end.
- Exiba estado vazio, indisponível ou placeholder controlado.
- Liste no resumo final qual campo ou endpoint precisa ser criado futuramente.

---

# Regras de implementação

Ao implementar qualquer task:

1. Leia este arquivo.
2. Leia os documentos de `/docs/design`.
3. Analise as imagens de `/docs/references`.
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
14. Não substitua dados reais por mocks.
15. Não remova funcionalidades existentes.

---

# Componentes recomendados

Quando fizer sentido, crie ou reaproveite componentes como:

- `PageHeader`
- `SectionHeader`
- `DashboardSection`
- `KpiCard`
- `InsightCard`
- `AttentionList`
- `NextEventsCard`
- `FinancialSummaryCard`
- `PropertyCard`
- `ReservationCard`
- `ChartCard`
- `EmptyState`
- `LoadingSkeleton`
- `StatusBadge`
- `AlertBadge`

Use nomes compatíveis com o padrão atual do projeto.

Não crie componentes duplicados se já existir algo equivalente.

---

# Responsividade

Toda tela deve funcionar bem em:

- Desktop
- Tablet
- Mobile

Regras:

- Desktop deve ter grid limpo e hierarquia clara.
- Tablet deve adaptar colunas sem apertar os cards.
- Mobile deve priorizar leitura vertical.
- Nenhum valor financeiro deve aparecer truncado como `R...`.
- Nenhum texto importante deve ficar escondido.
- Cards não devem parecer apertados.
- Tabelas largas devem virar listas ou cards quando necessário.

---

# Estados obrigatórios

Sempre que aplicável, prever:

- Loading
- Empty state
- Erro
- Dados insuficientes
- Dados carregados

Estados vazios devem orientar o usuário.

Não deixe a tela quebrada quando um endpoint não retornar dados.

---

# Checklist final obrigatório

Ao finalizar qualquer task, revise:

- A task foi cumprida?
- A interface ficou mais clara?
- A hierarquia visual melhorou?
- O layout tem respiro?
- Os componentes estão alinhados?
- Os cards têm função real?
- As cores têm propósito?
- A tipografia está consistente?
- A responsividade foi preservada ou melhorada?
- Os dados dinâmicos continuam funcionando?
- Nenhuma funcionalidade existente foi quebrada?
- Nenhum cálculo novo foi criado no front-end?
- O código ficou mais organizado?
- A tela parece um produto profissional?

---

# Resposta final esperada

Ao terminar uma implementação, retorne:

1. Resumo do que foi implementado
2. Arquivos alterados
3. Componentes criados ou refatorados
4. O que foi movido, removido visualmente ou reorganizado
5. Dados que ainda dependem do back-end
6. Confirmação de que nenhum cálculo novo foi criado no front-end
7. Pontos que ainda podem ser refinados depois
