import { getPrismaClient } from "../../config/prisma.js";

const prisma = getPrismaClient();

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

const FINANCIAL_ENTRY_TYPE_TO_DB = {
  recurring_expense: "ADJUSTMENT",
  operational_expense: "ADJUSTMENT",
  refund: "REFUND",
  payment_fee: "PLATFORM_FEE",
  manual_revenue: "CHARGE",
};

const DB_STATUS_BY_KEY = {
  draft: "PENDING",
  pending: "PENDING",
  scheduled: "PENDING",
  confirmed: "AVAILABLE",
  paid: "SETTLED",
  processing: "PENDING",
  refunded: "CANCELLED",
  failed: "CANCELLED",
  cancelled: "CANCELLED",
  void: "CANCELLED",
};

const STATUS_KEY_BY_DB = {
  PENDING: "pending",
  AVAILABLE: "confirmed",
  SETTLED: "paid",
  CANCELLED: "CANCELLED",
};

export const FINANCIAL_ENTRY_TYPES = {
  recurring_expense: {
    label: "Despesa recorrente",
    direction: "expense",
    categories: [
      { key: "condominio", label: "Condominio" },
      { key: "iptu", label: "IPTU" },
      { key: "agua", label: "Agua" },
      { key: "luz", label: "Luz" },
      { key: "internet", label: "Internet" },
    ],
    defaultStatus: "paid",
  },
  operational_expense: {
    label: "Despesa operacional",
    direction: "expense",
    categories: [
      { key: "limpeza", label: "Limpeza" },
      { key: "manutencao", label: "Manutencao" },
      { key: "reposicao", label: "Reposicao" },
      { key: "outras_despesas", label: "Outras despesas" },
    ],
    defaultStatus: "paid",
  },
  refund: {
    label: "Reembolso",
    direction: "expense",
    categories: [{ key: "reembolso", label: "Reembolso" }],
    defaultStatus: "refunded",
  },
  payment_fee: {
    label: "Taxa de pagamento",
    direction: "expense",
    categories: [{ key: "taxa_pagamento", label: "Taxa de pagamento" }],
    defaultStatus: "paid",
  },
  manual_revenue: {
    label: "Receita manual",
    direction: "income",
    categories: [{ key: "receita_manual", label: "Receita manual" }],
    defaultStatus: "confirmed",
  },
};

export const FINANCIAL_ENTRY_STATUS_OPTIONS = [
  { key: "draft", label: "Rascunho" },
  { key: "pending", label: "Pendente" },
  { key: "scheduled", label: "Agendado" },
  { key: "confirmed", label: "Confirmado" },
  { key: "paid", label: "Pago" },
  { key: "processing", label: "Em processamento" },
  { key: "refunded", label: "Reembolsado" },
  { key: "failed", label: "Falhou" },
  { key: "CANCELLED", label: "Cancelado" },
  { key: "void", label: "Anulado" },
];

const toMonthKey = (value) => {
  if (!value) return null;
  const raw = String(value).trim();
  if (MONTH_PATTERN.test(raw)) return raw;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

const getMonthBounds = (monthKey) => {
  const normalized = toMonthKey(monthKey) || toMonthKey(new Date());
  const [year, month] = normalized.split("-").map(Number);
  return {
    key: normalized,
    start: new Date(year, month - 1, 1, 0, 0, 0, 0),
    end: new Date(year, month, 0, 23, 59, 59, 999),
  };
};

const toIso = (date) => new Date(date).toISOString();
const toNumber = (value) => Number(value || 0);

const getEntryDirection = (entryType) => FINANCIAL_ENTRY_TYPES[entryType]?.direction || "expense";
const getEntryLabel = (entryType) => FINANCIAL_ENTRY_TYPES[entryType]?.label || entryType;
const getDefaultStatus = (entryType) => FINANCIAL_ENTRY_TYPES[entryType]?.defaultStatus || "confirmed";
const isActionableEntry = (entry) => !["draft", "CANCELLED", "void", "failed"].includes(String(entry.status || "").toLowerCase());

const getCategoryLabel = (entryType, category) => {
  const config = FINANCIAL_ENTRY_TYPES[entryType];
  return config?.categories?.find((item) => item.key === category)?.label || category || getEntryLabel(entryType);
};

const getSignedImpact = (entry) => {
  const amount = Number(entry.amount || 0);
  if (!isActionableEntry(entry)) return 0;
  return entry.entryType === "manual_revenue" ? amount : -amount;
};

const normalizeStatusToDb = (status, entryType) => {
  const normalized = String(status || getDefaultStatus(entryType)).trim().toLowerCase();
  return DB_STATUS_BY_KEY[normalized] || "PENDING";
};

const normalizeDbTypeToUi = (dbType, metadata = {}) => {
  const preferred = metadata?.entryType;
  if (preferred && FINANCIAL_ENTRY_TYPES[preferred]) return preferred;
  if (dbType === "REFUND") return "refund";
  if (dbType === "PLATFORM_FEE") return "payment_fee";
  if (dbType === "CHARGE") return "manual_revenue";
  return "operational_expense";
};

const resolveHostPlace = async (hostId, placeId) => {
  const place = await prisma.place.findFirst({
    where: { id: placeId, ownerId: hostId },
    select: { id: true, title: true, city: true },
  });
  if (!place) {
    const error = new Error("Acomodacao nao encontrada para este anfitriao.");
    error.statusCode = 404;
    throw error;
  }
  return place;
};

const resolveBooking = async (hostId, bookingId, placeId = null) => {
  if (!bookingId) return null;
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      place: {
        ownerId: hostId,
        ...(placeId ? { id: placeId } : {}),
      },
    },
    select: { id: true, placeId: true },
  });
  if (!booking) {
    const error = new Error("Reserva nao encontrada para este anfitriao.");
    error.statusCode = 404;
    throw error;
  }
  return booking;
};

const mapEntry = (entry) => {
  const metadata = entry.metadata || {};
  const entryType = normalizeDbTypeToUi(entry.type, metadata);
  const competenceMonth = metadata.competenceMonth || toMonthKey(entry.availableAt || entry.createdAt);
  return {
    id: String(entry.id),
    _id: String(entry.id),
    host: entry.user ? String(entry.user.id) : null,
    place: entry.place
      ? {
          id: String(entry.place.id),
          title: entry.place.title || "Acomodacao",
          city: entry.place.city || "",
        }
      : null,
    bookingId: entry.booking
      ? {
          id: String(entry.booking.id),
          checkin: entry.booking.checkIn,
          checkout: entry.booking.checkOut,
          status: String(entry.booking.status || "").toLowerCase(),
          paymentStatus: entry.booking.legacyPaymentStatus || "",
          priceTotal: toNumber(entry.booking.totalPrice),
        }
      : null,
    paymentId: entry.payment?.providerPaymentId || metadata.paymentId || "",
    recurrenceId: metadata.recurrenceId || "",
    source: metadata.source || "",
    provider: metadata.provider || "",
    competenceMonth,
    competenceDate: competenceMonth ? `${competenceMonth}-01T00:00:00.000Z` : null,
    entryDate: entry.availableAt || entry.createdAt || null,
    entryType,
    entryTypeLabel: getEntryLabel(entryType),
    category: metadata.category || "",
    categoryLabel: getCategoryLabel(entryType, metadata.category),
    title: entry.description || metadata.title || getCategoryLabel(entryType, metadata.category),
    description: entry.description || "",
    amount: toNumber(entry.amount),
    status: STATUS_KEY_BY_DB[entry.status] || "pending",
    taxDeductible: metadata.taxDeductible !== false,
    fiscalCategory: metadata.fiscalCategory || "",
    accountingCategory: metadata.accountingCategory || "",
    notes: metadata.notes || "",
    metadata,
    direction: getEntryDirection(entryType),
    signedImpact: getSignedImpact({
      amount: toNumber(entry.amount),
      entryType,
      status: STATUS_KEY_BY_DB[entry.status] || "pending",
    }),
    createdAt: entry.createdAt || null,
    updatedAt: entry.updatedAt || null,
  };
};

export const listFinancialEntries = async (hostId, filters = {}) => {
  const competenceMonth = filters.competenceMonth ? toMonthKey(filters.competenceMonth) : null;
  const placeId = filters.placeId || filters.place || null;
  const status = filters.status ? normalizeStatusToDb(filters.status, "manual_revenue") : null;

  const entries = await prisma.financialEntry.findMany({
    where: {
      place: { ownerId: hostId },
      ...(placeId ? { placeId } : {}),
      ...(status ? { status } : {}),
      ...(competenceMonth
        ? (() => {
            const { start, end } = getMonthBounds(competenceMonth);
            return {
              OR: [
                { availableAt: { gte: start, lte: end } },
                { createdAt: { gte: start, lte: end } },
              ],
            };
          })()
        : {}),
    },
    include: {
      user: { select: { id: true } },
      place: { select: { id: true, title: true, city: true } },
      booking: true,
      payment: true,
    },
    orderBy: [{ availableAt: "desc" }, { createdAt: "desc" }],
  });

  return entries.map(mapEntry);
};

export const createFinancialEntry = async (hostId, payload = {}) => {
  const placeId = payload.placeId || payload.place;
  if (!placeId) {
    const error = new Error("placeId e obrigatorio.");
    error.statusCode = 400;
    throw error;
  }

  const place = await resolveHostPlace(hostId, placeId);
  const entryType = payload.entryType && FINANCIAL_ENTRY_TYPES[payload.entryType]
    ? payload.entryType
    : "operational_expense";
  const competenceMonth = toMonthKey(payload.competenceMonth || payload.competence_month || new Date());
  const amount = Number(payload.amount);

  if (!Number.isFinite(amount) || amount < 0) {
    const error = new Error("amount deve ser um numero valido maior ou igual a zero.");
    error.statusCode = 400;
    throw error;
  }

  const bookingId = payload.bookingId || payload.booking_id || null;
  if (bookingId) {
    await resolveBooking(hostId, bookingId, place.id);
  }

  const created = await prisma.financialEntry.create({
    data: {
      bookingId: bookingId || undefined,
      userId: hostId,
      placeId: place.id,
      type: FINANCIAL_ENTRY_TYPE_TO_DB[entryType] || "ADJUSTMENT",
      status: normalizeStatusToDb(payload.status, entryType),
      amount,
      description: String(payload.title || payload.label || payload.description || "").trim() || getEntryLabel(entryType),
      availableAt: payload.entryDate || payload.entry_date ? new Date(payload.entryDate || payload.entry_date) : getMonthBounds(competenceMonth).start,
      metadata: {
        entryType,
        category: String(payload.category || payload.subcategory || "").trim(),
        competenceMonth,
        source: String(payload.source || "").trim(),
        provider: String(payload.provider || "").trim(),
        paymentId: String(payload.paymentId || payload.payment_id || "").trim(),
        recurrenceId: String(payload.recurrenceId || payload.recurrence_id || "").trim(),
        taxDeductible: payload.taxDeductible === undefined ? entryType !== "manual_revenue" : Boolean(payload.taxDeductible),
        fiscalCategory: String(payload.fiscalCategory || payload.fiscal_category || "").trim(),
        accountingCategory: String(payload.accountingCategory || payload.accounting_category || "").trim(),
        notes: String(payload.notes || "").trim(),
        ...(payload.metadata || {}),
      },
    },
    include: {
      user: { select: { id: true } },
      place: { select: { id: true, title: true, city: true } },
      booking: true,
      payment: true,
    },
  });

  return mapEntry(created);
};

export const updateFinancialEntry = async (hostId, entryId, payload = {}) => {
  const existing = await prisma.financialEntry.findFirst({
    where: { id: entryId, place: { ownerId: hostId } },
    include: { place: true, booking: true, payment: true, user: { select: { id: true } } },
  });

  if (!existing) {
    const error = new Error("Lancamento financeiro nao encontrado.");
    error.statusCode = 404;
    throw error;
  }

  let placeId = existing.placeId;
  if (payload.placeId || payload.place) {
    placeId = (await resolveHostPlace(hostId, payload.placeId || payload.place)).id;
  }

  const bookingId = payload.bookingId || payload.booking_id || existing.bookingId;
  if (bookingId) {
    await resolveBooking(hostId, bookingId, placeId);
  }

  const existingMetadata = existing.metadata || {};
  const entryType = payload.entryType && FINANCIAL_ENTRY_TYPES[payload.entryType]
    ? payload.entryType
    : existingMetadata.entryType || normalizeDbTypeToUi(existing.type, existingMetadata);
  const competenceMonth = toMonthKey(payload.competenceMonth || payload.competence_month || existingMetadata.competenceMonth || existing.availableAt || existing.createdAt);

  const updated = await prisma.financialEntry.update({
    where: { id: entryId },
    data: {
      placeId,
      bookingId: bookingId || null,
      type: FINANCIAL_ENTRY_TYPE_TO_DB[entryType] || existing.type,
      status: payload.status ? normalizeStatusToDb(payload.status, entryType) : existing.status,
      amount: payload.amount !== undefined ? Number(payload.amount) : existing.amount,
      description:
        payload.title !== undefined || payload.label !== undefined || payload.description !== undefined
          ? String(payload.title || payload.label || payload.description || "").trim() || existing.description
          : existing.description,
      availableAt:
        payload.entryDate || payload.entry_date
          ? new Date(payload.entryDate || payload.entry_date)
          : existing.availableAt,
      metadata: {
        ...existingMetadata,
        ...(payload.metadata || {}),
        entryType,
        competenceMonth,
        ...(payload.category !== undefined || payload.subcategory !== undefined
          ? { category: String(payload.category || payload.subcategory || "").trim() }
          : {}),
        ...(payload.source !== undefined ? { source: String(payload.source || "").trim() } : {}),
        ...(payload.provider !== undefined ? { provider: String(payload.provider || "").trim() } : {}),
        ...(payload.paymentId !== undefined || payload.payment_id !== undefined
          ? { paymentId: String(payload.paymentId || payload.payment_id || "").trim() }
          : {}),
        ...(payload.recurrenceId !== undefined || payload.recurrence_id !== undefined
          ? { recurrenceId: String(payload.recurrenceId || payload.recurrence_id || "").trim() }
          : {}),
        ...(payload.taxDeductible !== undefined ? { taxDeductible: Boolean(payload.taxDeductible) } : {}),
        ...(payload.fiscalCategory !== undefined || payload.fiscal_category !== undefined
          ? { fiscalCategory: String(payload.fiscalCategory || payload.fiscal_category || "").trim() }
          : {}),
        ...(payload.accountingCategory !== undefined || payload.accounting_category !== undefined
          ? { accountingCategory: String(payload.accountingCategory || payload.accounting_category || "").trim() }
          : {}),
        ...(payload.notes !== undefined ? { notes: String(payload.notes || "").trim() } : {}),
      },
    },
    include: {
      user: { select: { id: true } },
      place: { select: { id: true, title: true, city: true } },
      booking: true,
      payment: true,
    },
  });

  return mapEntry(updated);
};

export const deleteFinancialEntry = async (hostId, entryId) => {
  const existing = await prisma.financialEntry.findFirst({
    where: { id: entryId, place: { ownerId: hostId } },
    select: { id: true },
  });

  if (!existing) {
    const error = new Error("Lancamento financeiro nao encontrado.");
    error.statusCode = 404;
    throw error;
  }

  await prisma.financialEntry.delete({ where: { id: entryId } });
  return { deleted: true };
};

const buildCategorySummary = (entries = []) =>
  Object.values(
    entries.reduce((acc, entry) => {
      const key = entry.entryType;
      if (!acc[key]) {
        acc[key] = {
          key,
          label: getEntryLabel(key),
          total: 0,
          count: 0,
          items: [],
        };
      }
      acc[key].total += getSignedImpact(entry);
      acc[key].count += 1;
      acc[key].items.push(entry);
      return acc;
    }, {}),
  ).map((group) => ({
    ...group,
    amount: Math.abs(group.total),
    direction: getEntryDirection(group.key),
  }));

const buildSubcategorySummary = (entries = []) =>
  Object.values(
    entries.reduce((acc, entry) => {
      const key = `${entry.entryType}:${entry.category || "sem_categoria"}`;
      if (!acc[key]) {
        acc[key] = {
          key,
          entryType: entry.entryType,
          category: entry.category || "",
          label: getCategoryLabel(entry.entryType, entry.category),
          total: 0,
          count: 0,
          items: [],
        };
      }
      acc[key].total += getSignedImpact(entry);
      acc[key].count += 1;
      acc[key].items.push(entry);
      return acc;
    }, {}),
  ).map((group) => ({ ...group, amount: Math.abs(group.total) }));

export const buildMonthlyFinancialSummary = async ({
  hostId,
  placeId = null,
  competenceMonth = null,
} = {}) => {
  const monthKey = toMonthKey(competenceMonth || new Date());
  const { start: periodStart, end: periodEnd } = getMonthBounds(monthKey);

  const entries = await listFinancialEntries(hostId, {
    placeId,
    competenceMonth: monthKey,
  });

  const bookings = await prisma.booking.findMany({
    where: {
      place: {
        ownerId: hostId,
        ...(placeId ? { id: placeId } : {}),
      },
      checkOut: { gte: periodStart, lte: periodEnd },
    },
    include: {
      place: { select: { id: true, title: true, city: true } },
      payments: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  const places = await prisma.place.findMany({
    where: {
      ownerId: hostId,
      ...(placeId ? { id: placeId } : {}),
    },
    select: { id: true, title: true, city: true },
  });

  const approvedBookings = bookings.filter((booking) => {
    const paymentStatus = String(booking.payments?.[0]?.status || booking.legacyPaymentStatus || "").toUpperCase();
    const status = String(booking.status || "").toUpperCase();
    return paymentStatus === "APPROVED" && !["CANCELLED", "REJECTED", "ARCHIVED"].includes(status);
  });

  const grossRevenue = approvedBookings.reduce((total, booking) => total + toNumber(booking.totalPrice), 0);
  const manualRevenue = entries.filter((entry) => entry.entryType === "manual_revenue" && isActionableEntry(entry)).reduce((total, entry) => total + Number(entry.amount || 0), 0);
  const recurringExpenses = entries.filter((entry) => entry.entryType === "recurring_expense" && isActionableEntry(entry)).reduce((total, entry) => total + Number(entry.amount || 0), 0);
  const operationalExpenses = entries.filter((entry) => entry.entryType === "operational_expense" && isActionableEntry(entry)).reduce((total, entry) => total + Number(entry.amount || 0), 0);
  const paymentFees = entries.filter((entry) => entry.entryType === "payment_fee" && isActionableEntry(entry)).reduce((total, entry) => total + Number(entry.amount || 0), 0);
  const refunds = entries.filter((entry) => entry.entryType === "refund" && isActionableEntry(entry)).reduce((total, entry) => total + Number(entry.amount || 0), 0);
  const nonDeductibleExpenses = entries.filter((entry) => entry.entryType !== "manual_revenue" && entry.taxDeductible === false && isActionableEntry(entry)).reduce((total, entry) => total + Number(entry.amount || 0), 0);

  const totalRevenue = grossRevenue + manualRevenue;
  const totalExpenses = recurringExpenses + operationalExpenses + paymentFees + refunds;
  const accountingNetRevenue = totalRevenue - totalExpenses;
  const fiscalNetRevenue = accountingNetRevenue - nonDeductibleExpenses;
  const contributionMargin = grossRevenue > 0 ? (accountingNetRevenue / grossRevenue) * 100 : null;

  const byProperty = places.map((place) => {
    const propertyEntries = entries.filter((entry) => String(entry.place?.id || "") === String(place.id));
    const propertyBookings = approvedBookings.filter((booking) => String(booking.placeId) === String(place.id));
    const gross = propertyBookings.reduce((total, booking) => total + toNumber(booking.totalPrice), 0);
    const impact = propertyEntries.reduce((total, entry) => total + getSignedImpact(entry), 0);
    return {
      id: place.id,
      title: place.title || "Acomodacao",
      city: place.city || "",
      grossRevenue: gross,
      netRevenue: gross + impact,
      entriesImpact: impact,
      bookingCount: propertyBookings.length,
      entryCount: propertyEntries.length,
      entries: propertyEntries,
    };
  });

  const summaryCards = [
    { key: "grossRevenue", label: "Receita bruta", value: grossRevenue, format: "currency", helper: "Reservas aprovadas no mes de competencia", tone: "green", available: true },
    { key: "manualRevenue", label: "Receitas manuais", value: manualRevenue, format: "currency", helper: "Lancamentos manuais classificados como receita", tone: "blue", available: true },
    { key: "recurringExpenses", label: "Despesas recorrentes", value: recurringExpenses, format: "currency", helper: "Condominio, IPTU, agua, luz e internet", tone: "amber", available: true },
    { key: "operationalExpenses", label: "Despesas operacionais", value: operationalExpenses, format: "currency", helper: "Limpeza, manutencao, reposicao e outras despesas", tone: "amber", available: true },
    { key: "paymentFees", label: "Taxas de pagamento", value: paymentFees, format: "currency", helper: "Taxas reais por transacao quando lancadas", tone: "slate", available: true },
    { key: "refunds", label: "Reembolsos", value: refunds, format: "currency", helper: "Reembolsos vinculados aos lancamentos financeiros", tone: "red", available: true },
    { key: "accountingNetRevenue", label: "Receita liquida contabil", value: accountingNetRevenue, format: "currency", helper: "Receita bruta menos lancamentos operacionais e ajustes", tone: accountingNetRevenue >= 0 ? "green" : "red", available: true },
    { key: "fiscalNetRevenue", label: "Receita liquida fiscal", value: fiscalNetRevenue, format: "currency", helper: "Aplicando regras fiscais armazenadas nos metadados", tone: fiscalNetRevenue >= 0 ? "green" : "red", available: true },
  ];

  return {
    period: {
      key: monthKey,
      label: `${monthKey.slice(5, 7)}/${monthKey.slice(0, 4)}`,
      start: toIso(periodStart),
      end: toIso(periodEnd),
    },
    filters: {
      periods: [
        { key: "current_month", label: "Mes atual", available: true },
        { key: "previous_month", label: "Mes anterior", available: true },
        { key: "last_3_months", label: "Ultimos 3 meses", available: true },
        { key: "last_6_months", label: "Ultimos 6 meses", available: true },
        { key: "custom", label: "Personalizado", available: true },
      ],
      accommodations: [
        { key: "all", label: "Todas as acomodacoes", available: true },
        ...places.map((place) => ({ key: String(place.id), label: place.title || "Acomodacao", available: true })),
      ],
      entryTypes: Object.entries(FINANCIAL_ENTRY_TYPES).map(([key, config]) => ({ key, label: config.label, available: true })),
      statuses: FINANCIAL_ENTRY_STATUS_OPTIONS.map((item) => ({ ...item, available: true })),
      categories: Object.entries(FINANCIAL_ENTRY_TYPES).flatMap(([entryType, config]) =>
        config.categories.map((item) => ({
          key: `${entryType}:${item.key}`,
          label: item.label,
          available: true,
        })),
      ),
    },
    summaryCards,
    totals: {
      grossRevenue,
      manualRevenue,
      recurringExpenses,
      operationalExpenses,
      paymentFees,
      refunds,
      totalRevenue,
      totalExpenses,
      accountingNetRevenue,
      fiscalNetRevenue,
      contributionMargin,
      nonDeductibleExpenses,
    },
    byCategory: buildCategorySummary(entries),
    bySubcategory: buildSubcategorySummary(entries),
    byProperty,
    entries,
    raw: {
      grossRevenue,
      bookings: approvedBookings.length,
      entries: entries.length,
      periodStart: toIso(periodStart),
      periodEnd: toIso(periodEnd),
    },
  };
};
