import Booking from "../bookings/model.js";
import Place from "../places/model.js";
import FinancialEntry from "./model.js";

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

export const FINANCIAL_ENTRY_TYPES = {
  recurring_expense: {
    label: "Despesa recorrente",
    direction: "expense",
    categories: [
      { key: "condominio", label: "Condomínio" },
      { key: "iptu", label: "IPTU" },
      { key: "agua", label: "Água" },
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
      { key: "manutencao", label: "Manutenção" },
      { key: "reposicao", label: "Reposição" },
      { key: "outras_despesas", label: "Outras despesas" },
    ],
    defaultStatus: "paid",
  },
  refund: {
    label: "Reembolso",
    direction: "expense",
    categories: [
      { key: "reembolso", label: "Reembolso" },
    ],
    defaultStatus: "refunded",
  },
  payment_fee: {
    label: "Taxa de pagamento",
    direction: "expense",
    categories: [
      { key: "taxa_pagamento", label: "Taxa de pagamento" },
    ],
    defaultStatus: "paid",
  },
  manual_revenue: {
    label: "Receita manual",
    direction: "income",
    categories: [
      { key: "receita_manual", label: "Receita manual" },
    ],
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
  { key: "canceled", label: "Cancelado" },
  { key: "void", label: "Anulado" },
];

const toMonthKey = (value) => {
  if (!value) return null;
  const raw = String(value).trim();
  if (MONTH_PATTERN.test(raw)) return raw;

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;

  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${date.getFullYear()}-${month}`;
};

const getMonthBounds = (monthKey) => {
  const normalized = toMonthKey(monthKey) || toMonthKey(new Date());
  const [year, month] = normalized.split("-").map(Number);
  const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { key: normalized, start, end };
};

const toIso = (date) => new Date(date).toISOString();

const getEntryDirection = (entryType) => FINANCIAL_ENTRY_TYPES[entryType]?.direction || "expense";

const getEntryLabel = (entryType) => FINANCIAL_ENTRY_TYPES[entryType]?.label || entryType;

const getCategoryLabel = (entryType, category) => {
  const config = FINANCIAL_ENTRY_TYPES[entryType];
  return config?.categories?.find((item) => item.key === category)?.label || category || getEntryLabel(entryType);
};

const getDefaultStatus = (entryType) => FINANCIAL_ENTRY_TYPES[entryType]?.defaultStatus || "confirmed";

const isActionableEntry = (entry) => !["draft", "canceled", "void", "failed"].includes(String(entry.status || "").toLowerCase());

const getSignedImpact = (entry) => {
  const amount = Number(entry.amount || 0);
  if (!isActionableEntry(entry)) return 0;
  if (entry.entryType === "manual_revenue") return amount;
  return -amount;
};

const populateEntry = (entry = {}) => ({
  id: String(entry._id),
  host: entry.host ? String(entry.host._id || entry.host) : null,
  place: entry.place
    ? {
        id: String(entry.place._id || entry.place),
        title: entry.place.title || "Acomodação",
        city: entry.place.city || "",
      }
    : null,
  bookingId: entry.bookingId ? String(entry.bookingId._id || entry.bookingId) : null,
  paymentId: entry.paymentId || "",
  recurrenceId: entry.recurrenceId || "",
  source: entry.source || "",
  provider: entry.provider || "",
  competenceMonth: entry.competenceMonth || "",
  competenceDate: entry.competenceDate || null,
  entryDate: entry.entryDate || null,
  entryType: entry.entryType,
  entryTypeLabel: getEntryLabel(entry.entryType),
  category: entry.category,
  categoryLabel: getCategoryLabel(entry.entryType, entry.category),
  title: entry.title,
  description: entry.description || "",
  amount: Number(entry.amount || 0),
  status: entry.status,
  taxDeductible: entry.taxDeductible !== false,
  fiscalCategory: entry.fiscalCategory || "",
  accountingCategory: entry.accountingCategory || "",
  notes: entry.notes || "",
  metadata: entry.metadata || {},
  direction: getEntryDirection(entry.entryType),
  signedImpact: getSignedImpact(entry),
  createdAt: entry.createdAt || null,
  updatedAt: entry.updatedAt || null,
});

const ensureMonth = (value) => {
  const monthKey = toMonthKey(value);
  if (!monthKey) {
    const error = new Error("competenceMonth inválido. Use o formato YYYY-MM.");
    error.statusCode = 400;
    throw error;
  }
  return monthKey;
};

const ensureEntryType = (value) => {
  const entryType = String(value || "").trim();
  if (!FINANCIAL_ENTRY_TYPES[entryType]) {
    const error = new Error("entryType inválido.");
    error.statusCode = 400;
    throw error;
  }
  return entryType;
};

const ensurePositiveAmount = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) {
    const error = new Error("amount deve ser um número válido maior ou igual a zero.");
    error.statusCode = 400;
    throw error;
  }
  return amount;
};

const resolvePlace = async (hostId, placeId) => {
  const place = await Place.findOne({ _id: placeId, owner: hostId }).select("_id title city").lean();
  if (!place) {
    const error = new Error("Acomodação não encontrada para este anfitrião.");
    error.statusCode = 404;
    throw error;
  }
  return place;
};

const resolveBooking = async (hostId, bookingId, placeIds = []) => {
  if (!bookingId) return null;
  const booking = await Booking.findOne({
    _id: bookingId,
    ...(placeIds.length > 0 ? { place: { $in: placeIds } } : {}),
  })
    .select("_id place")
    .lean();
  if (!booking) {
    const error = new Error("Reserva não encontrada para este anfitrião.");
    error.statusCode = 404;
    throw error;
  }
  return booking;
};

const buildMatch = ({ hostId, placeId, competenceMonth, entryType, status }) => {
  const match = { host: hostId };
  if (placeId) match.place = placeId;
  if (competenceMonth) match.competenceMonth = competenceMonth;
  if (entryType) match.entryType = entryType;
  if (status) match.status = status;
  return match;
};

export const listFinancialEntries = async (hostId, filters = {}) => {
  const competenceMonth = filters.competenceMonth ? ensureMonth(filters.competenceMonth) : null;
  const entryType = filters.entryType ? ensureEntryType(filters.entryType) : null;
  const placeId = filters.placeId || filters.place || null;
  const status = filters.status ? String(filters.status).trim() : null;

  const query = buildMatch({ hostId, placeId, competenceMonth, entryType, status });
  const entries = await FinancialEntry.find(query)
    .sort({ entryDate: -1, createdAt: -1 })
    .populate("place", "title city")
    .populate("bookingId", "checkin checkout status paymentStatus priceTotal")
    .lean();

  return entries.map(populateEntry);
};

export const createFinancialEntry = async (hostId, payload = {}) => {
  const placeId = payload.placeId || payload.place;
  if (!placeId) {
    const error = new Error("placeId é obrigatório.");
    error.statusCode = 400;
    throw error;
  }

  const place = await resolvePlace(hostId, placeId);
  const entryType = ensureEntryType(payload.entryType);
  const competenceMonth = ensureMonth(payload.competenceMonth || payload.competence_month);
  const competenceDate = getMonthBounds(competenceMonth).start;
  const entryDate = payload.entryDate || payload.entry_date || competenceDate;
  const amount = ensurePositiveAmount(payload.amount);
  const bookingId = payload.bookingId || payload.booking_id || null;
  const paymentId = String(payload.paymentId || payload.payment_id || "").trim();
  const recurrenceId = String(payload.recurrenceId || payload.recurrence_id || "").trim();
  const source = String(payload.source || "").trim();
  const provider = String(payload.provider || "").trim();
  const status = String(payload.status || getDefaultStatus(entryType)).trim() || getDefaultStatus(entryType);
  const category = String(payload.category || payload.subcategory || "").trim() || getCategoryLabel(entryType);
  const title = String(payload.title || payload.label || category || getEntryLabel(entryType)).trim();
  const description = String(payload.description || "").trim();
  const notes = String(payload.notes || "").trim();
  const fiscalCategory = String(payload.fiscalCategory || payload.fiscal_category || "").trim();
  const accountingCategory = String(payload.accountingCategory || payload.accounting_category || "").trim();
  const taxDeductible = payload.taxDeductible === undefined ? entryType !== "manual_revenue" : Boolean(payload.taxDeductible);

  if (bookingId) {
    await resolveBooking(hostId, bookingId, [place._id]);
  }

  const [entry] = await FinancialEntry.create([
    {
      host: hostId,
      place: place._id,
      bookingId: bookingId || null,
      paymentId,
      recurrenceId,
      source,
      provider,
      competenceMonth,
      competenceDate,
      entryDate: new Date(entryDate),
      entryType,
      category,
      title,
      description,
      amount,
      status,
      taxDeductible,
      fiscalCategory,
      accountingCategory,
      notes,
      metadata: payload.metadata || {},
    },
  ]);

  const populated = await FinancialEntry.findById(entry._id)
    .populate("place", "title city")
    .populate("bookingId", "checkin checkout status paymentStatus priceTotal")
    .lean();

  return populateEntry(populated);
};

export const updateFinancialEntry = async (hostId, entryId, payload = {}) => {
  const existing = await FinancialEntry.findOne({ _id: entryId, host: hostId });
  if (!existing) {
    const error = new Error("Lançamento financeiro não encontrado.");
    error.statusCode = 404;
    throw error;
  }

  if (payload.placeId || payload.place) {
    const placeId = payload.placeId || payload.place;
    const place = await resolvePlace(hostId, placeId);
    existing.place = place._id;
  }

  if (payload.bookingId || payload.booking_id) {
    const bookingId = payload.bookingId || payload.booking_id;
    await resolveBooking(hostId, bookingId, [existing.place]);
    existing.bookingId = bookingId;
  }

  if (payload.entryType) existing.entryType = ensureEntryType(payload.entryType);
  if (payload.competenceMonth || payload.competence_month) {
    existing.competenceMonth = ensureMonth(payload.competenceMonth || payload.competence_month);
    existing.competenceDate = getMonthBounds(existing.competenceMonth).start;
  }
  if (payload.entryDate || payload.entry_date) existing.entryDate = new Date(payload.entryDate || payload.entry_date);
  if (payload.amount !== undefined) existing.amount = ensurePositiveAmount(payload.amount);
  if (payload.status) existing.status = String(payload.status).trim();
  if (payload.category || payload.subcategory) existing.category = String(payload.category || payload.subcategory).trim();
  if (payload.title || payload.label) existing.title = String(payload.title || payload.label).trim();
  if (payload.description !== undefined) existing.description = String(payload.description || "").trim();
  if (payload.paymentId !== undefined || payload.payment_id !== undefined) existing.paymentId = String(payload.paymentId || payload.payment_id || "").trim();
  if (payload.recurrenceId !== undefined || payload.recurrence_id !== undefined) existing.recurrenceId = String(payload.recurrenceId || payload.recurrence_id || "").trim();
  if (payload.source !== undefined) existing.source = String(payload.source || "").trim();
  if (payload.provider !== undefined) existing.provider = String(payload.provider || "").trim();
  if (payload.taxDeductible !== undefined) existing.taxDeductible = Boolean(payload.taxDeductible);
  if (payload.fiscalCategory !== undefined || payload.fiscal_category !== undefined) existing.fiscalCategory = String(payload.fiscalCategory || payload.fiscal_category || "").trim();
  if (payload.accountingCategory !== undefined || payload.accounting_category !== undefined) existing.accountingCategory = String(payload.accountingCategory || payload.accounting_category || "").trim();
  if (payload.notes !== undefined) existing.notes = String(payload.notes || "").trim();
  if (payload.metadata !== undefined) existing.metadata = payload.metadata;

  await existing.save();

  const populated = await FinancialEntry.findById(existing._id)
    .populate("place", "title city")
    .populate("bookingId", "checkin checkout status paymentStatus priceTotal")
    .lean();

  return populateEntry(populated);
};

export const deleteFinancialEntry = async (hostId, entryId) => {
  const result = await FinancialEntry.deleteOne({ _id: entryId, host: hostId });
  if (!result.deletedCount) {
    const error = new Error("Lançamento financeiro não encontrado.");
    error.statusCode = 404;
    throw error;
  }
  return { deleted: true };
};

const buildCategorySummary = (entries = []) => {
  const groups = new Map();

  for (const entry of entries) {
    const groupKey = entry.entryType;
    if (!groups.has(groupKey)) {
      groups.set(groupKey, {
        key: groupKey,
        label: getEntryLabel(groupKey),
        total: 0,
        count: 0,
        items: [],
      });
    }

    const group = groups.get(groupKey);
    group.total += getSignedImpact(entry);
    group.count += 1;
    group.items.push(populateEntry(entry));
  }

  return Array.from(groups.values()).map((group) => ({
    ...group,
    amount: Math.abs(group.total),
    direction: FINANCIAL_ENTRY_TYPES[group.key]?.direction || "expense",
  }));
};

const buildSubcategorySummary = (entries = []) => {
  const groups = new Map();

  for (const entry of entries) {
    const subKey = `${entry.entryType}:${entry.category}`;
    const subLabel = getCategoryLabel(entry.entryType, entry.category);

    if (!groups.has(subKey)) {
      groups.set(subKey, {
        key: subKey,
        entryType: entry.entryType,
        category: entry.category,
        label: subLabel,
        total: 0,
        count: 0,
        items: [],
      });
    }

    const group = groups.get(subKey);
    group.total += getSignedImpact(entry);
    group.count += 1;
    group.items.push(populateEntry(entry));
  }

  return Array.from(groups.values()).map((group) => ({
    ...group,
    amount: Math.abs(group.total),
  }));
};

const buildPropertySummary = (entries = [], places = [], bookings = []) => {
  const placeMap = new Map(places.map((place) => [String(place._id), place]));
  const bookingRevenueByPlace = new Map();
  const bookingCountByPlace = new Map();

  for (const booking of bookings) {
    const placeId = String(booking.place?._id || booking.place || "");
    bookingRevenueByPlace.set(placeId, (bookingRevenueByPlace.get(placeId) || 0) + Number(booking.priceTotal || 0));
    bookingCountByPlace.set(placeId, (bookingCountByPlace.get(placeId) || 0) + 1);
  }

  const entryImpactByPlace = new Map();
  const entryCountByPlace = new Map();
  const entriesByPlace = new Map();

  for (const entry of entries) {
    const placeId = String(entry.place?._id || entry.place || "");
    entryImpactByPlace.set(placeId, (entryImpactByPlace.get(placeId) || 0) + getSignedImpact(entry));
    entryCountByPlace.set(placeId, (entryCountByPlace.get(placeId) || 0) + 1);
    if (!entriesByPlace.has(placeId)) entriesByPlace.set(placeId, []);
    entriesByPlace.get(placeId).push(populateEntry(entry));
  }

  return places
    .map((place) => {
      const placeId = String(place._id);
      const grossRevenue = bookingRevenueByPlace.get(placeId) || 0;
      const netImpact = entryImpactByPlace.get(placeId) || 0;
      return {
        id: placeId,
        title: place.title || "Acomodação",
        city: place.city || "",
        grossRevenue,
        netRevenue: grossRevenue + netImpact,
        entriesImpact: netImpact,
        bookingCount: bookingCountByPlace.get(placeId) || 0,
        entryCount: entryCountByPlace.get(placeId) || 0,
        entries: entriesByPlace.get(placeId) || [],
      };
    })
    .sort((a, b) => b.grossRevenue - a.grossRevenue);
};

export const buildMonthlyFinancialSummary = async ({
  hostId,
  placeId = null,
  competenceMonth = null,
} = {}) => {
  const monthKey = ensureMonth(competenceMonth || new Date());
  const { start: periodStart, end: periodEnd } = getMonthBounds(monthKey);
  const places = await Place.find({
    owner: hostId,
    ...(placeId ? { _id: placeId } : {}),
  })
    .select("title city price averageRating isActive photos owner")
    .lean();

  const placeIds = places.map((place) => place._id);
  const entries = await FinancialEntry.find({
    host: hostId,
    ...(placeIds.length > 0 ? { place: { $in: placeIds } } : {}),
    competenceMonth: monthKey,
  })
    .sort({ entryDate: -1, createdAt: -1 })
    .populate("place", "title city")
    .populate("bookingId", "checkin checkout status paymentStatus priceTotal")
    .lean();

  const bookings = await Booking.find({
    place: { $in: placeIds },
    checkout: { $gte: periodStart, $lte: periodEnd },
  })
    .populate("place", "title city price averageRating isActive photos")
    .lean();

  const approvedBookings = bookings.filter((booking) => {
    const paymentStatus = String(booking.paymentStatus || "").toLowerCase();
    const status = String(booking.status || "").toLowerCase();
    return paymentStatus === "approved" && !["canceled", "rejected"].includes(status);
  });

  const grossRevenue = approvedBookings.reduce((total, booking) => total + Number(booking.priceTotal || 0), 0);
  const manualRevenue = entries
    .filter((entry) => entry.entryType === "manual_revenue" && isActionableEntry(entry))
    .reduce((total, entry) => total + Number(entry.amount || 0), 0);
  const recurringExpenses = entries
    .filter((entry) => entry.entryType === "recurring_expense" && isActionableEntry(entry))
    .reduce((total, entry) => total + Number(entry.amount || 0), 0);
  const operationalExpenses = entries
    .filter((entry) => entry.entryType === "operational_expense" && isActionableEntry(entry))
    .reduce((total, entry) => total + Number(entry.amount || 0), 0);
  const paymentFees = entries
    .filter((entry) => entry.entryType === "payment_fee" && isActionableEntry(entry))
    .reduce((total, entry) => total + Number(entry.amount || 0), 0);
  const refunds = entries
    .filter((entry) => entry.entryType === "refund" && isActionableEntry(entry))
    .reduce((total, entry) => total + Number(entry.amount || 0), 0);
  const nonDeductibleExpenses = entries
    .filter(
      (entry) =>
        entry.entryType !== "manual_revenue" &&
        entry.taxDeductible === false &&
        isActionableEntry(entry)
    )
    .reduce((total, entry) => total + Number(entry.amount || 0), 0);

  const operatingDeductions = recurringExpenses + operationalExpenses + paymentFees + refunds;
  const accountingNetRevenue = grossRevenue + manualRevenue - operatingDeductions;
  const fiscalNetRevenue = accountingNetRevenue - nonDeductibleExpenses;
  const contributionMargin = grossRevenue > 0 ? (accountingNetRevenue / grossRevenue) * 100 : null;
  const totalRevenue = grossRevenue + manualRevenue;
  const totalExpenses = recurringExpenses + operationalExpenses + paymentFees + refunds;

  const byCategory = buildCategorySummary(entries);
  const bySubcategory = buildSubcategorySummary(entries);
  const byProperty = buildPropertySummary(entries, places, approvedBookings);

  const summaryCards = [
    {
      key: "grossRevenue",
      label: "Receita bruta",
      value: grossRevenue,
      format: "currency",
      helper: "Reservas aprovadas no mês de competência",
      tone: "green",
      available: true,
    },
    {
      key: "manualRevenue",
      label: "Receitas manuais",
      value: manualRevenue,
      format: "currency",
      helper: "Lançamentos manuais classificados como receita",
      tone: "blue",
      available: true,
    },
    {
      key: "recurringExpenses",
      label: "Despesas recorrentes",
      value: recurringExpenses,
      format: "currency",
      helper: "Condomínio, IPTU, água, luz e internet",
      tone: "amber",
      available: true,
    },
    {
      key: "operationalExpenses",
      label: "Despesas operacionais",
      value: operationalExpenses,
      format: "currency",
      helper: "Limpeza, manutenção, reposição e outras despesas",
      tone: "amber",
      available: true,
    },
    {
      key: "paymentFees",
      label: "Taxas de pagamento",
      value: paymentFees,
      format: "currency",
      helper: "Taxas reais por transação quando lançadas",
      tone: "slate",
      available: true,
    },
    {
      key: "refunds",
      label: "Reembolsos",
      value: refunds,
      format: "currency",
      helper: "Reembolsos com valor, data e reserva vinculada",
      tone: "red",
      available: true,
    },
    {
      key: "accountingNetRevenue",
      label: "Receita líquida contábil",
      value: accountingNetRevenue,
      format: "currency",
      helper: "Receita bruta menos lançamentos operacionais e ajustes",
      tone: accountingNetRevenue >= 0 ? "green" : "red",
      available: true,
    },
    {
      key: "fiscalNetRevenue",
      label: "Receita líquida fiscal",
      value: fiscalNetRevenue,
      format: "currency",
      helper: "Aplicando as regras fiscais definidas no backend",
      tone: fiscalNetRevenue >= 0 ? "green" : "red",
      available: true,
    },
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
        { key: "current_month", label: "Mês atual", available: true },
        { key: "previous_month", label: "Mês anterior", available: true },
        { key: "last_3_months", label: "Últimos 3 meses", available: true },
        { key: "last_6_months", label: "Últimos 6 meses", available: true },
        { key: "custom", label: "Personalizado", available: true },
      ],
      accommodations: [
        { key: "all", label: "Todas as acomodações", available: true },
        ...places.map((place) => ({
          key: String(place._id),
          label: place.title || "Acomodação",
          available: true,
        })),
      ],
      entryTypes: Object.entries(FINANCIAL_ENTRY_TYPES).map(([key, config]) => ({
        key,
        label: config.label,
        available: true,
      })),
      statuses: FINANCIAL_ENTRY_STATUS_OPTIONS.map((item) => ({ ...item, available: true })),
      categories: Object.entries(FINANCIAL_ENTRY_TYPES).flatMap(([entryType, config]) =>
        config.categories.map((item) => ({
          key: `${entryType}:${item.key}`,
          label: item.label,
          available: true,
        }))
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
    byCategory,
    bySubcategory,
    byProperty,
    entries: entries.map(populateEntry),
    raw: {
      grossRevenue,
      bookings: approvedBookings.length,
      entries: entries.length,
      periodStart: toIso(periodStart),
      periodEnd: toIso(periodEnd),
    },
  };
};
