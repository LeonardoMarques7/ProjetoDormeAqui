# 📊 Dashboard do Anfitrião — KPIs e Formas de Resultado

> Análise completa de tudo que a dashboard do ProjetoDormeAqui exibe ao anfitrião.

---

## 🏆 1. KPIs Principais (Hero Section)

Os 4 cards de destaque exibidos no topo da dashboard, em grid responsivo (1 coluna mobile → 4 colunas desktop):

| KPI | Cor | Ícone | O que mede | Subtexto |
|---|---|---|---|---|
| **Receita do Mês** | 🟢 Emerald | `DollarSign` | Soma total das reservas com status `completed` no mês | "vs. mês anterior" |
| **Taxa de Ocupação** | 🔵 Blue | `BarChart3` | % de dias ocupados sobre total de dias × propriedades no mês (30 dias base) | "Semana atual" |
| **Total de Reservas** | 🟣 Purple | `Calendar` | Quantidade de reservas confirmadas ou finalizadas | "Confirmadas este mês" |
| **Avaliação Média** | 🟡 Amber | `Star` | Média de `rating` de todas as avaliações recebidas (escala 0–5) | "⭐ de 5.0" ou "Sem avaliações" |

Cada card exibe ainda:
- **Barra de progresso** visual (percentual em relação a uma meta interna)
- **Indicador de tendência** (`↑ TrendingUp` / `↓ TrendingDown`) com variação percentual, quando aplicável

---

## 💰 2. Métricas Financeiras

Calculadas pela função `calculateFinancialMetrics()` e exibidas no `FinanceCard`:

| Métrica | Descrição |
|---|---|
| **Ganhos do mês** | Receita de reservas com status `completed` |
| **Ganhos futuros** | Receita de reservas `confirmed` com check-in posterior a hoje |
| **Total de taxas** | 10% sobre (ganhos do mês + ganhos futuros) — custo da plataforma |
| **Média por diária** | (total de ganhos) ÷ (total de noites confirmadas) |
| **Projeção 30 dias** | Soma das reservas `confirmed` com check-in nos próximos 30 dias |

---

## 📈 3. Gráficos Analíticos

### 3.1 Receita ao Longo do Tempo (Area Chart)
- **Tipo:** `AreaChart` (Recharts) com gradiente verde
- **Dados:** Receita agrupada por mês (`calculateMonthlyRevenue`)
- **Eixos:** Mês (X) × Valor em R$ (Y)
- **Tooltip:** Valor formatado em BRL
- **Período:** Todos os meses com reservas confirmadas/finalizadas

### 3.2 Ocupação Semanal (Bar Chart)
- **Tipo:** `BarChart` (Recharts) com barras azuis arredondadas
- **Dados:** % de ocupação por dia da semana atual (`calculateWeeklyOccupancy`)
- **Eixos:** Dia da semana — Seg a Dom (X) × % (Y)
- **Lógica:** Verifica quais propriedades têm reserva ativa para cada dia e calcula o percentual sobre o total de propriedades

### 3.3 Receita por Propriedade (Donut Chart)
- **Tipo:** `PieChart` com `innerRadius` (rosca) — Recharts
- **Dados:** Top 5 propriedades por receita (`calculateRevenueByProperty`)
- **Legenda:** Abaixo do gráfico — nome da propriedade + valor em R$
- **Cores:** Paleta de 5 cores (`emerald`, `blue`, `amber`, `red`, `purple`)

---

## 📅 4. Calendário Mensal de Reservas

Componente `CalendarGridMonth`:
- Exibe o mês em grade (domingo a sábado)
- Cada reserva aparece como uma **barra colorida** que cobre os dias de check-in até checkout
- **Cores únicas por hóspede** — até 24 cores distintas para diferenciar reservas
- Mostra **nome abreviado** do hóspede (primeiro nome + inicial do sobrenome)
- Navegação entre meses (← →)
- Clique em reserva abre **modal de detalhes** (`ReservationModal`)

### Informações no modal de reserva:
- Nome do hóspede (com avatar/iniciais)
- Propriedade
- Datas de check-in e check-out
- Status da reserva (Confirmada / Pendente / Em andamento / Finalizada / Cancelada / Avaliação)
- Número de noites

---

## 🔔 5. Painel de Alertas Inteligentes (Insights & Ações)

Gerado por `generateAlerts()` com 3 níveis de prioridade, exibidos paginados (3 por página):

| Nível | Cor | Quando é gerado |
|---|---|---|
| 🔴 **Crítico** | Vermelho | Ocupação < 30% nos próximos 21 dias → sugere ajuste de preços |
| 🟡 **Aviso** | Âmbar | Check-ins hoje (lista de hóspedes) e/ou Check-outs hoje |
| 🔵 **Info** | Azul | Semana excelente! Ocupação > 90% nos próximos 21 dias |

Cada alerta exibe:
- **Título** do evento
- **Descrição** detalhada (ex: nomes dos hóspedes)
- **Ação sugerida** (botão clicável): "Ver calendário", "Preparar propriedade", "Confirmar saída"
- Os alertas são **colapsáveis** (accordion com `Collapsible`)
- Paginação automática quando há mais de 3 alertas
- Estado vazio amigável quando não há alertas: _"Tudo corre bem! Nenhum alerta no momento."_

---

## 📋 6. Resumo do Dia (TodayPanel)

3 cards compactos com informações do dia corrente:

| Card | Cor | Ícone | Valor |
|---|---|---|---|
| **Check-ins hoje** | 🟢 Emerald (destaque) | `CalendarCheck2` | Número de hóspedes chegando hoje |
| **Check-outs hoje** | 🔵 Sky | `CalendarClock` | Número de hóspedes saindo hoje |
| **Reservas pendentes** | 🟡 Amber | `ClipboardList` | Reservas aguardando confirmação |

---

## ✅ 7. Tarefas Operacionais (TasksList)

Lista de tarefas geradas automaticamente ou criadas manualmente:

| Campo | Descrição |
|---|---|
| **Tipo** | `cleaning` (Limpeza), `preparation` (Preparação), `maintenance` (Manutenção) |
| **Título & Descrição** | Detalhe da tarefa |
| **Propriedade** | Nome do imóvel envolvido |
| **Hóspede** | Nome do hóspede relacionado |
| **Prazo** | Data e hora limite (`dueDate`) |
| **Tag automática** | Badge azul "automática" se a tarefa foi gerada pela plataforma |
| **Checkbox** | O anfitrião pode marcar como concluída (estado local) |

---

## 🔄 Fluxo de Dados

```
API: GET /dashboard/host
     ↓
{bookings, properties/places, reviews, today, alerts, calendar}
     ↓
calculateMonthlyRevenue()     → Gráfico de Receita
calculateWeeklyOccupancy()    → Gráfico de Ocupação Semanal
calculatePerformanceMetrics() → KPIs: ocupação, reservas, rating, preço médio
calculateRevenueByProperty()  → Donut Chart por propriedade
calculateFinancialMetrics()   → Cards financeiros (ganhos, taxas, projeção)
generateAlerts()              → Painel de Alertas Inteligentes
     ↓
HostDashboard.jsx (container principal)
```

---

## 📱 Responsividade

| Breakpoint | Layout KPIs | Layout Gráficos |
|---|---|---|
| Mobile (< 640px) | 1 coluna | 1 coluna |
| Tablet (640–1024px) | 2 colunas | 1 coluna |
| Desktop (> 1024px) | 4 colunas | Masonry 2 colunas |

---

## 🧩 Resumo Visual de Todas as Seções

```
┌─────────────────────────────────────────────────┐
│  💰 Receita  │  📊 Ocupação  │  📅 Reservas  │ ⭐ Rating  │  ← KPIs (4 cards)
├─────────────────────────────┬───────────────────┤
│   📈 Receita ao longo       │  🔔 Insights &    │
│      do tempo (Area)        │     Alertas       │
├─────────────────────────────┼───────────────────┤
│   📊 Ocupação semanal       │  🍩 Receita por   │
│      (Bar Chart)            │   Propriedade     │
├─────────────────────────────┴───────────────────┤
│              📅 Calendário Mensal               │
└─────────────────────────────────────────────────┘
```

---

*Gerado em: 2026-04-28 | Projeto: ProjetoDormeAqui*
