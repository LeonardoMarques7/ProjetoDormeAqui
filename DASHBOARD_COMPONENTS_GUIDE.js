/**
 * DASHBOARD REDESIGN - COMPONENTES COMPLETOS
 * 
 * Este arquivo contém todos os componentes necessários para a nova dashboard.
 * Após criação, organize em subpastas conforme indicado em cada seção.
 */

// ============================================================================
// UTILS: dashboardCalculations.js
// Coloque em: /components/dashboard/utils/dashboardCalculations.js
// ============================================================================

export const calculateMonthlyRevenue = (bookings = []) => {
  const monthlyData = {};

  bookings.forEach((booking) => {
    if (booking.status === "confirmed" || booking.status === "completed") {
      const date = new Date(booking.checkInDate);
      const monthKey = date.toLocaleString("pt-BR", {
        year: "numeric",
        month: "short",
      });

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          value: 0,
          bookings: 0,
        };
      }

      monthlyData[monthKey].value += booking.totalPrice || 0;
      monthlyData[monthKey].bookings += 1;
    }
  });

  return Object.values(monthlyData).sort((a, b) => {
    const months = {
      Jan: 0, Fev: 1, Mar: 2, Abr: 3, Mai: 4, Jun: 5,
      Jul: 6, Ago: 7, Set: 8, Out: 9, Nov: 10, Dez: 11,
    };
    return months[a.month] - months[b.month];
  });
};

export const calculateWeeklyOccupancy = (bookings = [], properties = []) => {
  const weekDays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startOfWeek = new Date(today);
  const dayOfWeek = today.getDay();
  startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

  const occupancyData = weekDays.map((day, idx) => {
    const currentDate = new Date(startOfWeek);
    currentDate.setDate(startOfWeek.getDate() + idx);

    const bookedProperties = new Set();

    bookings.forEach((booking) => {
      const checkIn = new Date(booking.checkInDate);
      const checkOut = new Date(booking.checkOutDate);
      checkIn.setHours(0, 0, 0, 0);
      checkOut.setHours(0, 0, 0, 0);

      if (
        currentDate >= checkIn &&
        currentDate < checkOut &&
        booking.status === "confirmed"
      ) {
        bookedProperties.add(booking.propertyId);
      }
    });

    const occupancyPercent =
      properties.length > 0
        ? (bookedProperties.size / properties.length) * 100
        : 0;

    return {
      day,
      occupancy: Math.round(occupancyPercent),
      date: currentDate.toISOString().split("T")[0],
    };
  });

  return occupancyData;
};

export const calculatePerformanceMetrics = (
  bookings = [],
  properties = [],
  reviews = []
) => {
  const totalDaysInMonth = 30;
  const totalPropertyDays = Math.max(properties.length, 1) * totalDaysInMonth;

  const occupiedDays = bookings
    .filter((b) => b.status === "confirmed" || b.status === "completed")
    .reduce((sum, b) => {
      const checkIn = new Date(b.checkInDate);
      const checkOut = new Date(b.checkOutDate);
      const nights = Math.ceil(
        (checkOut - checkIn) / (1000 * 60 * 60 * 24)
      );
      return sum + nights;
    }, 0);

  const occupancyRate = Math.min(
    100,
    (occupiedDays / totalPropertyDays) * 100
  );

  const confirmedBookings = bookings.filter(
    (b) => b.status === "confirmed" || b.status === "completed"
  );

  const totalRevenue = confirmedBookings.reduce(
    (sum, b) => sum + (b.totalPrice || 0),
    0
  );

  const averageNightPrice =
    confirmedBookings.length > 0 ? totalRevenue / confirmedBookings.length : 0;

  const validReviews = reviews.filter((r) => r.rating > 0);
  const averageRating =
    validReviews.length > 0
      ? validReviews.reduce((sum, r) => sum + r.rating, 0) / validReviews.length
      : 0;

  return {
    occupancyRate: Number(occupancyRate.toFixed(1)),
    averageNightPrice: Number(averageNightPrice.toFixed(2)),
    totalBookings: confirmedBookings.length,
    averageRating: Number(averageRating.toFixed(1)),
  };
};

export const calculateRevenueByProperty = (bookings = [], properties = []) => {
  const propertyRevenue = {};

  properties.forEach((prop) => {
    propertyRevenue[prop.id] = {
      id: prop.id,
      name: prop.title || "Sem título",
      revenue: 0,
      bookings: 0,
    };
  });

  bookings.forEach((booking) => {
    if (booking.status === "confirmed" || booking.status === "completed") {
      if (propertyRevenue[booking.propertyId]) {
        propertyRevenue[booking.propertyId].revenue +=
          booking.totalPrice || 0;
        propertyRevenue[booking.propertyId].bookings += 1;
      }
    }
  });

  return Object.values(propertyRevenue)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
};

export const calculateFinancialMetrics = (bookings = []) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthlyEarnings = bookings
    .filter((b) => b.status === "completed")
    .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  const futureEarnings = bookings
    .filter((b) => {
      const checkIn = new Date(b.checkInDate);
      checkIn.setHours(0, 0, 0, 0);
      return (
        b.status === "confirmed" && checkIn > today
      );
    })
    .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  const totalFees = (monthlyEarnings + futureEarnings) * 0.1;

  const confirmedBookings = bookings.filter(
    (b) => b.status === "confirmed" || b.status === "completed"
  );

  let totalNights = 0;
  confirmedBookings.forEach((b) => {
    const checkIn = new Date(b.checkInDate);
    const checkOut = new Date(b.checkOutDate);
    const nights = Math.ceil(
      (checkOut - checkIn) / (1000 * 60 * 60 * 24)
    );
    totalNights += nights;
  });

  const totalEarnings = monthlyEarnings + futureEarnings;
  const averagePerNight =
    totalNights > 0 ? totalEarnings / totalNights : 0;

  const next30Days = new Date();
  next30Days.setDate(today.getDate() + 30);

  const projectedEarnings30d = bookings
    .filter((b) => {
      const checkIn = new Date(b.checkInDate);
      checkIn.setHours(0, 0, 0, 0);
      return (
        b.status === "confirmed" &&
        checkIn >= today &&
        checkIn <= next30Days
      );
    })
    .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  return {
    monthlyEarnings: Number(monthlyEarnings.toFixed(2)),
    futureEarnings: Number(futureEarnings.toFixed(2)),
    totalFees: Number(totalFees.toFixed(2)),
    averagePerNight: Number(averagePerNight.toFixed(2)),
    projectedEarnings30d: Number(projectedEarnings30d.toFixed(2)),
  };
};

export const generateAlerts = (
  bookings = [],
  metrics = {},
  properties = []
) => {
  const alerts = {
    critical: [],
    warning: [],
    info: [],
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const next21Days = new Date();
  next21Days.setDate(today.getDate() + 21);

  const upcomingBookings = bookings.filter((b) => {
    const checkIn = new Date(b.checkInDate);
    checkIn.setHours(0, 0, 0, 0);
    return (
      checkIn >= today &&
      checkIn <= next21Days &&
      b.status === "confirmed"
    );
  });

  const occupiedDaysUpcoming = new Set();
  upcomingBookings.forEach((b) => {
    for (let i = 0; i < 21; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const checkIn = new Date(b.checkInDate);
      const checkOut = new Date(b.checkOutDate);
      checkIn.setHours(0, 0, 0, 0);
      checkOut.setHours(0, 0, 0, 0);
      if (date >= checkIn && date < checkOut) {
        occupiedDaysUpcoming.add(date.toISOString().split("T")[0]);
      }
    }
  });

  const occupancyUpcoming = (occupiedDaysUpcoming.size / 21) * 100;

  if (occupancyUpcoming < 30 && properties.length > 0) {
    alerts.critical.push({
      id: "low-occupancy",
      title: "Baixa ocupação nos próximos 21 dias",
      description: `Apenas ${Math.round(occupancyUpcoming)}% de ocupação. Considere ajustar preços.`,
      action: "Ver calendário",
      severity: "critical",
    });
  }

  const todayCheckins = bookings.filter((b) => {
    const checkInDate = new Date(b.checkInDate);
    checkInDate.setHours(0, 0, 0, 0);
    return checkInDate.getTime() === today.getTime() && b.status === "confirmed";
  });

  if (todayCheckins.length > 0) {
    alerts.warning.push({
      id: "checkins-today",
      title: `${todayCheckins.length} check-in${
        todayCheckins.length > 1 ? "s" : ""
      } hoje`,
      description: todayCheckins.map((b) => b.guestName).join(", "),
      action: "Preparar propriedade",
      severity: "warning",
    });
  }

  const todayCheckouts = bookings.filter((b) => {
    const checkOutDate = new Date(b.checkOutDate);
    checkOutDate.setHours(0, 0, 0, 0);
    return (
      checkOutDate.getTime() === today.getTime() &&
      (b.status === "confirmed" || b.status === "completed")
    );
  });

  if (todayCheckouts.length > 0) {
    alerts.warning.push({
      id: "checkouts-today",
      title: `${todayCheckouts.length} check-out${
        todayCheckouts.length > 1 ? "s" : ""
      } hoje`,
      description: todayCheckouts.map((b) => b.guestName).join(", "),
      action: "Confirmar saída",
      severity: "warning",
    });
  }

  if (occupancyUpcoming > 90 && properties.length > 0) {
    alerts.info.push({
      id: "high-occupancy",
      title: "Semana excelente! 🎉",
      description: `${Math.round(occupancyUpcoming)}% de ocupação`,
      action: "—",
      severity: "info",
    });
  }

  return alerts;
};
