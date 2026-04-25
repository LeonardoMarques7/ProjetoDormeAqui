/**
 * Dashboard Calculations - Processamento de Dados Corrigido
 * Usa os nomes corretos do backend: checkin, checkout, priceTotal, place
 */

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const toStartOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Calcula receita por mês (últimos 6 meses)
export const calculateMonthlyRevenue = (bookings = []) => {
  const revenueByMonth = {};
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  for (let i = 0; i < 6; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const key = months[date.getMonth()];
    revenueByMonth[key] = { month: key, value: 0 };
  }

  bookings.forEach((booking) => {
    if (booking.paymentStatus === "approved" && booking.checkout) {
      const checkoutDate = new Date(booking.checkout);
      const month = months[checkoutDate.getMonth()];
      if (revenueByMonth[month]) {
        revenueByMonth[month].value += Number(booking.priceTotal || 0);
      }
    }
  });

  return Object.values(revenueByMonth).reverse();
};

// Calcula ocupação semanal
export const calculateWeeklyOccupancy = (bookings = [], properties = []) => {
  const weekDays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"];
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1);

  return weekDays.map((day, idx) => {
    const currentDate = new Date(startOfWeek);
    currentDate.setDate(startOfWeek.getDate() + idx);
    currentDate.setHours(0, 0, 0, 0);

    const bookedCount = bookings.filter((booking) => {
      if (!booking.checkin || !booking.checkout) return false;
      const checkin = toStartOfDay(new Date(booking.checkin));
      const checkout = toStartOfDay(new Date(booking.checkout));
      return currentDate >= checkin && currentDate < checkout;
    }).length;

    const occupancy = properties.length > 0 
      ? Math.round((bookedCount / Math.max(properties.length, 1)) * 100)
      : 0;

    return { day, occupancy };
  });
};

// Retorna métricas já calculadas pelo backend
export const calculatePerformanceMetrics = (bookings = [], properties = [], metrics = {}) => {
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

  // Check-ins do dia
  if (today.checkins > 0) {
    const count = today.checkins;
    const title = count === 1 ? "Check-in Hoje" : "Check-ins do Dia";
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

  // Check-outs do dia
  if (today.checkouts > 0) {
    const count = today.checkouts;
    const title = count === 1 ? "Check-out Hoje" : "Check-outs do Dia";
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

  // ========== DICAS E INSIGHTS ==========

  // Baixa ocupação
  if (metrics.occupancyRate && metrics.occupancyRate < 50) {
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
  if (metrics.averageRating && metrics.averageRating < 4.5 && metrics.averageRating > 0) {
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
    alerts.info.push({
      id: "no-reviews",
      title: "Você Ainda Não Tem Avaliações",
      description: "Peça aos seus hóspedes para deixarem avaliações. Isso ajuda a atrair mais reservas.",
      time: null,
      footer: [
        { iconName: "chat-bubble-left", text: "Contate seus hóspedes recentes" },
        { iconName: "arrow-trending-up", text: "Aumente sua visibilidade" }
      ],
      severity: "info",
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
