/**
 * Dashboard Calculations - Processamento de Dados Corrigido
 * Usa os nomes corretos do backend: checkin, checkout, priceTotal, place
 */

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const toLocalDate = (date) => {
  if (typeof date === "string") {
    const dateOnly = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (dateOnly) {
      return new Date(
        Number(dateOnly[1]),
        Number(dateOnly[2]) - 1,
        Number(dateOnly[3]),
      );
    }
  }

  return new Date(date);
};

const toStartOfDay = (date) => {
  const d = toLocalDate(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getBookingCheckin = (booking) => booking.checkin || booking.checkIn;
const getBookingCheckout = (booking) => booking.checkout || booking.checkOut;
const getBookingTotal = (booking) =>
  Number(booking.priceTotal || booking.totalValue || booking.totalPrice || 0);

const hasValidBookingDates = (booking) =>
  Boolean(booking && getBookingCheckin(booking) && getBookingCheckout(booking));

const isCanceledBooking = (booking) => {
  if (!booking) return true;
  const paymentStatus = String(booking.paymentStatus || "").toLowerCase();
  const status = String(booking.status || "").toLowerCase();
  const invalidStatuses = ["canceled", "cancelled", "rejected"];

  return invalidStatuses.includes(paymentStatus) || invalidStatuses.includes(status);
};

const isValidBookingForKPI = (booking) => {
  if (!hasValidBookingDates(booking) || isCanceledBooking(booking)) return false;

  return true;
};

const isValidRevenueBooking = (booking) => {
  if (!booking) return false;
  const paymentStatus = String(booking.paymentStatus || "").toLowerCase();

  if (!hasValidBookingDates(booking) || isCanceledBooking(booking)) return false;

  if (paymentStatus && !["approved", "paid", "completed"].includes(paymentStatus)) {
    return false;
  }

  return getBookingTotal(booking) > 0;
};

export const getCurrentMonthPeriod = (baseDate = new Date()) => {
  const startDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  const endDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 1);
  return { startDate, endDate };
};

export const calculateNightsBetween = (startDate, endDate) => {
  const start = toStartOfDay(startDate);
  const end = toStartOfDay(endDate);
  return Math.max(0, Math.round((end - start) / ONE_DAY_MS));
};

export const calculateBookedNights = (bookings = [], period = getCurrentMonthPeriod()) => {
  const periodStart = toStartOfDay(period.startDate);
  const periodEnd = toStartOfDay(period.endDate);

  return bookings.reduce((total, booking) => {
    if (!isValidBookingForKPI(booking)) return total;

    const checkin = toStartOfDay(getBookingCheckin(booking));
    const checkout = toStartOfDay(getBookingCheckout(booking));
    const overlapStart = new Date(Math.max(checkin, periodStart));
    const overlapEnd = new Date(Math.min(checkout, periodEnd));

    return total + calculateNightsBetween(overlapStart, overlapEnd);
  }, 0);
};

export const calculateRevenueForPeriod = (bookings = [], period = getCurrentMonthPeriod()) => {
  const periodStart = toStartOfDay(period.startDate);
  const periodEnd = toStartOfDay(period.endDate);

  return bookings.reduce((total, booking) => {
    if (!isValidRevenueBooking(booking)) return total;

    const checkin = toStartOfDay(getBookingCheckin(booking));
    const checkout = toStartOfDay(getBookingCheckout(booking));
    const bookedNights = calculateNightsBetween(checkin, checkout);
    const overlapStart = new Date(Math.max(checkin, periodStart));
    const overlapEnd = new Date(Math.min(checkout, periodEnd));
    const overlapNights = calculateNightsBetween(overlapStart, overlapEnd);

    if (bookedNights === 0 || overlapNights === 0) return total;

    return total + (getBookingTotal(booking) / bookedNights) * overlapNights;
  }, 0);
};

export const calculateADR = (bookings = [], period = getCurrentMonthPeriod()) => {
  const revenue = calculateRevenueForPeriod(bookings, period);
  const bookedNights = calculateBookedNights(bookings, period);

  return bookedNights > 0 ? revenue / bookedNights : 0;
};

export const calculateOccupancyRate = (
  bookings = [],
  period = getCurrentMonthPeriod(),
  availableUnits = 1,
) => {
  const bookedNights = calculateBookedNights(bookings, period);
  const periodNights = calculateNightsBetween(period.startDate, period.endDate);
  const availableNights = periodNights * Math.max(Number(availableUnits) || 0, 0);

  return availableNights > 0 ? (bookedNights / availableNights) * 100 : 0;
};

export const calculateRevPAR = (
  bookings = [],
  period = getCurrentMonthPeriod(),
  availableUnits = 1,
) => {
  const revenue = calculateRevenueForPeriod(bookings, period);
  const periodNights = calculateNightsBetween(period.startDate, period.endDate);
  const availableNights = periodNights * Math.max(Number(availableUnits) || 0, 0);

  return availableNights > 0 ? revenue / availableNights : 0;
};

export const calculateRentalKPIs = (
  bookings = [],
  properties = [],
  period = getCurrentMonthPeriod(),
) => {
  const availableUnits = Math.max(properties.length, 1);
  const revenue = calculateRevenueForPeriod(bookings, period);
  const bookedNights = calculateBookedNights(bookings, period);
  const periodNights = calculateNightsBetween(period.startDate, period.endDate);
  const availableNights = periodNights * availableUnits;

  return {
    adr: bookedNights > 0 ? revenue / bookedNights : 0,
    occupancyRate: availableNights > 0 ? (bookedNights / availableNights) * 100 : 0,
    revPAR: availableNights > 0 ? revenue / availableNights : 0,
    revenue,
    bookedNights,
    availableNights,
    period,
  };
};

/**
 * Exemplos de uso:
 *
 * const currentMonth = getCurrentMonthPeriod();
 * const adr = calculateADR(bookings, currentMonth);
 * const occupancyRate = calculateOccupancyRate(bookings, currentMonth, places.length);
 * const revPAR = calculateRevPAR(bookings, currentMonth, places.length);
 *
 * const kpis = calculateRentalKPIs(bookings, places, currentMonth);
 * console.log(kpis.adr, kpis.occupancyRate, kpis.revPAR);
 */

// Calcula receita por mês (últimos 6 meses) e adiciona projeção para o próximo mês
export const calculateMonthlyRevenue = (bookings = []) => {
  const revenueByMonth = {};
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const today = new Date();
  const revenueBookings = bookings
    .filter(isValidRevenueBooking)
    .sort((a, b) => toStartOfDay(getBookingCheckout(a)) - toStartOfDay(getBookingCheckout(b)));
  const lastRevenueDate = revenueBookings.length > 0
    ? toStartOfDay(getBookingCheckout(revenueBookings[revenueBookings.length - 1]))
    : today;

  for (let i = 0; i < 6; i++) {
    const date = new Date(lastRevenueDate);
    date.setMonth(date.getMonth() - i);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    revenueByMonth[key] = {
      key,
      mes: months[date.getMonth()],
      receita: 0,
      projecao: null,
      variacaoPercentual: 0,
      tipo: "real",
    };
  }

  revenueBookings.forEach((booking) => {
    const checkoutDate = toStartOfDay(getBookingCheckout(booking));
    const key = `${checkoutDate.getFullYear()}-${checkoutDate.getMonth()}`;
    if (revenueByMonth[key]) {
      revenueByMonth[key].receita += getBookingTotal(booking);
    }
  });

  const revenueData = Object.values(revenueByMonth).reverse();

  revenueData.forEach((item, index) => {
    const previousRevenue = revenueData[index - 1]?.receita || 0;
    item.receitaAnterior = previousRevenue;
    item.variacaoPercentual = previousRevenue > 0
      ? ((item.receita - previousRevenue) / previousRevenue) * 100
      : 0;
  });

  const lastMonth = revenueData[revenueData.length - 1];
  const previousMonth = revenueData[revenueData.length - 2];
  const projectedDate = new Date(lastRevenueDate.getFullYear(), lastRevenueDate.getMonth() + 1, 1);
  const averageGrowth = previousMonth?.receita > 0
    ? (lastMonth.receita - previousMonth.receita) / previousMonth.receita
    : 0;
  const projectedRevenue = Math.max(0, lastMonth.receita * (1 + averageGrowth));

  lastMonth.projecao = lastMonth.receita;
  revenueData.push({
    key: `${projectedDate.getFullYear()}-${projectedDate.getMonth()}`,
    mes: `${months[projectedDate.getMonth()]} (proj.)`,
    receita: null,
    receitaAnterior: lastMonth.receita,
    projecao: projectedRevenue,
    variacaoPercentual: averageGrowth * 100,
    tipo: "projecao",
  });

  return revenueData;
};

// Calcula taxa de ocupação por dia da semana no período coberto pelas reservas
export const calculateWeeklyOccupancy = (bookings = [], properties = []) => {
  const weekDays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"];
  const validBookings = bookings.filter(isValidBookingForKPI);
  const availableUnits = Math.max(properties.length, 1);
  const occupancyByWeekday = weekDays.map((day) => ({
    dia: day,
    taxaOcupacao: 0,
    acomodacoesOcupadas: 0,
    acomodacoesDisponiveis: availableUnits,
    diasAnalisados: 0,
    baixaOcupacao: true,
  }));

  if (validBookings.length === 0) {
    return occupancyByWeekday;
  }

  const periodStart = validBookings.reduce((earliest, booking) => {
    const checkin = toStartOfDay(getBookingCheckin(booking));
    return checkin < earliest ? checkin : earliest;
  }, toStartOfDay(getBookingCheckin(validBookings[0])));
  const periodEnd = validBookings.reduce((latest, booking) => {
    const checkout = toStartOfDay(getBookingCheckout(booking));
    return checkout > latest ? checkout : latest;
  }, toStartOfDay(getBookingCheckout(validBookings[0])));

  for (
    let currentDate = new Date(periodStart);
    currentDate < periodEnd;
    currentDate.setDate(currentDate.getDate() + 1)
  ) {
    const weekdayIndex = currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1;
    const dayData = occupancyByWeekday[weekdayIndex];
    const bookedCount = validBookings.filter((booking) => {
      const checkin = toStartOfDay(getBookingCheckin(booking));
      const checkout = toStartOfDay(getBookingCheckout(booking));
      return currentDate >= checkin && currentDate < checkout;
    }).length;

    dayData.acomodacoesOcupadas += bookedCount;
    dayData.diasAnalisados += 1;
  }

  return occupancyByWeekday.map((dayData) => {
    const availableNights = dayData.diasAnalisados * availableUnits;
    const occupancy = availableNights > 0
      ? Math.round((dayData.acomodacoesOcupadas / availableNights) * 100)
      : 0;

    return {
      ...dayData,
      taxaOcupacao: occupancy,
      baixaOcupacao: occupancy < 50,
    };
  });
};

// Retorna métricas já calculadas pelo backend
export const calculatePerformanceMetrics = (bookings = [], properties = [], metrics = {}) => {
  void properties;

  if (metrics && Object.keys(metrics).length > 0) {
    return {
      occupancyRate: metrics.occupancyRate || 0,
      averageNightPrice: metrics.averageNightPrice || 0,
      totalBookings: metrics.totalBookings || 0,
      averageRating: metrics.averageRating || null,
    };
  }

  return {
    occupancyRate: 0,
    averageNightPrice: 0,
    totalBookings: bookings.length,
    averageRating: null,
  };
};

// Calcula receita por propriedade
export const calculateRevenueByProperty = (bookings = [], properties = []) => {
  const revenueMap = {};

  properties.forEach((place) => {
    revenueMap[String(place._id)] = {
      id: String(place._id),
      name: place.title || "Sem título",
      revenue: 0,
    };
  });

  bookings.forEach((booking) => {
    if (booking.paymentStatus === "approved" && booking.place) {
      const placeId = String(booking.place._id || booking.place);
      if (revenueMap[placeId]) {
        revenueMap[placeId].revenue += Number(booking.priceTotal || 0);
      }
    }
  });

  return Object.values(revenueMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
};

// Usa finanças já calculadas pelo backend
export const calculateFinancialMetrics = (finance = {}) => {
  return {
    monthlyEarnings: Number(finance.monthlyEarnings || 0),
    futureEarnings: Number(finance.futureEarnings || 0),
    totalFees: Number(finance.totalFees || 0),
    averagePerNight: Number(finance.averagePerNight || 0),
  };
};

// Gera alertas baseado nos dados do backend
export const generateAlerts = (backendAlerts = [], today = {}, metrics = {}) => {
  const alerts = { critical: [], warning: [], info: [] };

  // Função helper para pluralizar
  const pluralize = (count, singular, plural) => count === 1 ? singular : plural;

  // Adicionar alertas do backend
  (backendAlerts || []).forEach((alert) => {
    const severity = alert.severity || "info";
    alerts[severity]?.push({
      id: alert.id,
      title: alert.title || alert.message,
      description: alert.message || "",
      time: null,
      severity,
    });
  });

  // ========== ALERTAS PERSONALIZADOS ==========

  // Entradas do dia
  if (today.checkins > 0) {
    const count = today.checkins;
    const title = count === 1 ? "Entrada hoje" : "Entradas do dia";
    const description = count === 1 
      ? "Você tem 1 hóspede chegando hoje. Prepare a propriedade para receber."
      : `Você tem ${count} hóspedes chegando hoje. Certifique-se de preparar todas as propriedades.`;
    
    alerts.warning.push({
      id: "checkins-today",
      title,
      description,
      time: "Agora",
      footer: [
        { iconName: "users", text: `${count} ${pluralize(count, "hóspede", "hóspedes")} esperando` },
        { iconName: "clock", text: "Prepare as propriedades" }
      ],
      severity: "warning",
    });
  }

  // Saídas do dia
  if (today.checkouts > 0) {
    const count = today.checkouts;
    const title = count === 1 ? "Saída hoje" : "Saídas do dia";
    const description = count === 1
      ? "1 hóspede está partindo hoje. Agende a limpeza da propriedade."
      : `${count} hóspedes estão partindo hoje. Você precisará agendar limpezas múltiplas.`;
    
    alerts.info.push({
      id: "checkouts-today",
      title,
      description,
      time: "Agora",
      footer: [
        { iconName: "sparkles", text: `Limpeza necessária para ${count} ${pluralize(count, "unidade", "unidades")}` },
        { iconName: "calendar", text: "Lembre-se de agendar os prestadores" }
      ],
      severity: "info",
    });
  }

  if (today.pendingBookings > 0) {
    const count = today.pendingBookings;
    alerts.warning.push({
      id: "pending-bookings",
      title: "Reservas Pendentes",
      description:
        count === 1
          ? "Existe 1 reserva aguardando atenção. Responder rápido ajuda a evitar perda de conversão."
          : `Existem ${count} reservas aguardando atenção. Responder rápido ajuda a evitar perda de conversão.`,
      time: "Agora",
      footer: [
        { iconName: "clock", text: "Responder o quanto antes" },
        { iconName: "check-circle", text: "Reduzir risco de perda da reserva" },
      ],
      severity: "warning",
    });
  }

  if ((today.checkins || 0) > 0 && (today.checkouts || 0) > 0) {
    alerts.critical.push({
      id: "same-day-turnover",
      title: "Troca de Hóspedes Hoje",
      description:
        "Você tem chegada e saída no mesmo dia. Confirme horários, limpeza e vistoria para evitar atraso no próximo check-in.",
      time: "Hoje",
      footer: [
        { iconName: "sparkles", text: "Priorize limpeza e reposição" },
        { iconName: "calendar", text: "Confirme janela entre saída e entrada" },
      ],
      severity: "critical",
    });
  }

  // ========== DICAS E INSIGHTS ==========

  // Baixa ocupação
  if (metrics.occupancyRate !== undefined && metrics.occupancyRate < 35) {
    alerts.critical.push({
      id: "low-occupancy",
      title: "Ocupação Baixa",
      description: `Sua taxa de ocupação está em ${metrics.occupancyRate.toFixed(1)}%. Considere revisar seus preços ou melhorar as fotos do anúncio.`,
      time: null,
      footer: [
        { iconName: "currency-dollar", text: "Revisar estratégia de preços" },
        { iconName: "camera", text: "Melhorar fotos do anúncio" }
      ],
      severity: "critical",
    });
  }

  // Avaliação média baixa
  if (metrics.occupancyRate >= 35 && metrics.occupancyRate < 50) {
    alerts.warning.push({
      id: "attention-occupancy",
      title: "Ocupação em Atenção",
      description: `Sua ocupação está em ${metrics.occupancyRate.toFixed(1)}%. Ainda não é crítica, mas vale ajustar preço, calendário ou descrição.`,
      time: null,
      footer: [
        { iconName: "currency-dollar", text: "Teste pequenos ajustes de preço" },
        { iconName: "calendar", text: "Verifique datas bloqueadas" },
      ],
      severity: "warning",
    });
  }

  if (metrics.totalBookings === 0) {
    alerts.critical.push({
      id: "no-bookings",
      title: "Sem Reservas Registradas",
      description:
        "Nenhuma reserva foi registrada ainda. Revise preço inicial, fotos, descrição e disponibilidade para gerar as primeiras conversões.",
      time: null,
      footer: [
        { iconName: "camera", text: "Melhorar apresentação do anúncio" },
        { iconName: "currency-dollar", text: "Avaliar preço de entrada" },
      ],
      severity: "critical",
    });
  }

  if (metrics.averageNightPrice === 0 && metrics.totalBookings > 0) {
    alerts.warning.push({
      id: "missing-night-price",
      title: "Preço Médio Indisponível",
      description:
        "Há reservas, mas o preço médio por noite não foi calculado. Verifique se as reservas possuem valor total e número de noites.",
      time: null,
      footer: [
        { iconName: "currency-dollar", text: "Validar valores das reservas" },
        { iconName: "check-circle", text: "Corrigir dados incompletos" },
      ],
      severity: "warning",
    });
  }

  if (metrics.averageRating && metrics.averageRating < 4 && metrics.averageRating > 0) {
    alerts.critical.push({
      id: "critical-rating",
      title: "Avaliação Crítica",
      description: `Sua avaliação média é ${metrics.averageRating.toFixed(1)}. Isso pode reduzir conversões. Priorize limpeza, comunicação e solução dos comentários recentes.`,
      time: null,
      footer: [
        { iconName: "star", text: "Ler avaliações recentes" },
        { iconName: "check-circle", text: "Resolver pontos recorrentes" },
      ],
      severity: "critical",
    });
  } else if (metrics.averageRating && metrics.averageRating < 4.5 && metrics.averageRating > 0) {
    alerts.warning.push({
      id: "low-rating",
      title: "Avaliação Abaixo da Expectativa",
      description: `Sua avaliação média é ${metrics.averageRating.toFixed(1)}⭐. Verifique os comentários e melhore a qualidade do serviço.`,
      time: null,
      footer: [
        { iconName: "star", text: "Leia os comentários dos hóspedes" },
        { iconName: "check-circle", text: "Implemente melhorias" }
      ],
      severity: "warning",
    });
  }

  // Sem avaliações
  if (metrics.averageRating === 0 && metrics.totalBookings > 0) {
    alerts.warning.push({
      id: "no-reviews",
      title: "Você Ainda Não Tem Avaliações",
      description: "Peça aos seus hóspedes para deixarem avaliações. Isso ajuda a atrair mais reservas.",
      time: null,
      footer: [
        { iconName: "chat-bubble-left", text: "Contate seus hóspedes recentes" },
        { iconName: "arrow-trending-up", text: "Aumente sua visibilidade" }
      ],
      severity: "warning",
    });
  }

  // Dica: Otimize seus preços
  if (metrics.occupancyRate && metrics.occupancyRate > 80) {
    alerts.info.push({
      id: "optimize-pricing",
      title: "Oportunidade de Otimização",
      description: "Sua taxa de ocupação está muito alta! Você pode aumentar seus preços para maximizar a receita.",
      time: null,
      footer: [
        { iconName: "arrow-trending-up", text: "Sua demanda é alta" },
        { iconName: "currency-dollar", text: "Aumente os preços estrategicamente" }
      ],
      severity: "info",
    });
  }

  return alerts;
};
