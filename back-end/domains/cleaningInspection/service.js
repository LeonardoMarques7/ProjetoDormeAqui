import CleaningInspection from "./model.js";

export const CLEANING_INSPECTION_FILTERS = [
  { key: "all", label: "Todos" },
  { key: "awaiting_cleaning", label: "Aguardando limpeza" },
  { key: "cleaning_in_progress", label: "Em limpeza" },
  { key: "awaiting_inspection", label: "Aguardando vistoria" },
  { key: "approved", label: "Aprovados" },
  { key: "blocked", label: "Bloqueados" },
];

const STATUS_LABELS = {
  awaiting_cleaning: "Aguardando limpeza",
  cleaning_in_progress: "Em limpeza",
  awaiting_inspection: "Aguardando vistoria",
  approved: "Aprovado para entrada",
  blocked: "Bloqueado",
  done: "Concluída",
  not_required: "Não necessária",
};

const makeSummaryItem = ({ key, label, value, tone = "slate" }) => ({
  key,
  label,
  value,
  format: "number",
  tone,
  available: true,
});

const emptySummary = () => ({
  pendingCleanings: 0,
  cleaningInProgress: 0,
  pendingInspections: 0,
  approvedForCheckin: 0,
  blockedProperties: 0,
  items: [
    makeSummaryItem({
      key: "pendingCleanings",
      label: "Limpezas pendentes",
      value: 0,
      tone: "amber",
    }),
    makeSummaryItem({
      key: "cleaningInProgress",
      label: "Limpezas em andamento",
      value: 0,
      tone: "blue",
    }),
    makeSummaryItem({
      key: "pendingInspections",
      label: "Vistorias pendentes",
      value: 0,
      tone: "violet",
    }),
    makeSummaryItem({
      key: "approvedForCheckin",
      label: "Imóveis aprovados para entrada",
      value: 0,
      tone: "green",
    }),
    makeSummaryItem({
      key: "blockedProperties",
      label: "Imóveis bloqueados",
      value: 0,
      tone: "red",
    }),
  ],
});

const getPopulatedId = (value) => {
  if (!value) return null;
  return String(value._id || value);
};

const normalizeBooking = (booking) => {
  if (!booking) return null;
  return {
    id: getPopulatedId(booking),
    guest: booking.user?.name || "",
    guestEmail: booking.user?.email || "",
    checkin: booking.checkin || null,
    checkout: booking.checkout || null,
    status: booking.status || "",
    paymentStatus: booking.paymentStatus || "",
    guests: booking.guests || null,
  };
};

const normalizeTask = (task) => ({
  id: String(task._id),
  place: task.place
    ? {
        id: getPopulatedId(task.place),
        title: task.place.title || "Acomodação",
        city: task.place.city || "",
        photo: task.place.photos?.[0] || null,
      }
    : null,
  previousBooking: normalizeBooking(task.previousBooking),
  nextBooking: normalizeBooking(task.nextBooking),
  lastCheckout: task.lastCheckout || task.previousBooking?.checkout || null,
  nextCheckin: task.nextCheckin || task.nextBooking?.checkin || null,
  cleaningStatus: task.cleaningStatus,
  cleaningStatusLabel: STATUS_LABELS[task.cleaningStatus] || task.cleaningStatus,
  inspectionStatus: task.inspectionStatus,
  inspectionStatusLabel: STATUS_LABELS[task.inspectionStatus] || task.inspectionStatus,
  overallStatus: task.overallStatus,
  overallStatusLabel: STATUS_LABELS[task.overallStatus] || task.overallStatus,
  assignee: task.assignee || null,
  deadlineLabel: task.deadlineLabel || "",
  notes: task.notes || "",
  cleaningChecklist: task.cleaningChecklist || [],
  inspectionChecklist: task.inspectionChecklist || [],
  photosBefore: task.photosBefore || [],
  photosAfter: task.photosAfter || [],
});

export const buildCleaningInspectionData = async (hostId) => {
  const tasks = await CleaningInspection.find({ host: hostId })
    .sort({ nextCheckin: 1, updatedAt: -1 })
    .populate("place", "title city photos")
    .populate({
      path: "previousBooking",
      select: "checkin checkout status paymentStatus guests user",
      populate: { path: "user", select: "name email" },
    })
    .populate({
      path: "nextBooking",
      select: "checkin checkout status paymentStatus guests user",
      populate: { path: "user", select: "name email" },
    })
    .lean();

  const summary = emptySummary();
  for (const task of tasks) {
    if (task.overallStatus === "awaiting_cleaning") summary.pendingCleanings += 1;
    if (task.overallStatus === "cleaning_in_progress") summary.cleaningInProgress += 1;
    if (task.overallStatus === "awaiting_inspection") summary.pendingInspections += 1;
    if (task.overallStatus === "approved") summary.approvedForCheckin += 1;
    if (task.overallStatus === "blocked") summary.blockedProperties += 1;
  }

  summary.items = summary.items.map((item) => ({
    ...item,
    value: summary[item.key] ?? 0,
  }));

  return {
    summary,
    filters: CLEANING_INSPECTION_FILTERS,
    items: tasks.map(normalizeTask),
  };
};
