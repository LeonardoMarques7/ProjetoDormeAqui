import { getPrismaClient } from "../../config/prisma.js";

const prisma = getPrismaClient();

export const CLEANING_INSPECTION_FILTERS = [
  { key: "all", label: "Todos" },
  { key: "awaiting_cleaning", label: "Aguardando limpeza" },
  { key: "cleaning_in_progress", label: "Em limpeza" },
  { key: "awaiting_inspection", label: "Aguardando vistoria" },
  { key: "approved", label: "Aprovados" },
  { key: "blocked", label: "Bloqueados" },
];

const STATUS_LABELS = {
  AWAITING_CLEANING: "Aguardando limpeza",
  CLEANING_IN_PROGRESS: "Em limpeza",
  AWAITING_INSPECTION: "Aguardando vistoria",
  APPROVED: "Aprovado para entrada",
  BLOCKED: "Bloqueado",
  DONE: "Concluida",
  NOT_REQUIRED: "Nao necessaria",
};

const STATUS_KEYS = {
  AWAITING_CLEANING: "awaiting_cleaning",
  CLEANING_IN_PROGRESS: "cleaning_in_progress",
  AWAITING_INSPECTION: "awaiting_inspection",
  APPROVED: "approved",
  BLOCKED: "blocked",
  DONE: "done",
  NOT_REQUIRED: "not_required",
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
    makeSummaryItem({ key: "pendingCleanings", label: "Limpezas pendentes", value: 0, tone: "amber" }),
    makeSummaryItem({ key: "cleaningInProgress", label: "Limpezas em andamento", value: 0, tone: "blue" }),
    makeSummaryItem({ key: "pendingInspections", label: "Vistorias pendentes", value: 0, tone: "violet" }),
    makeSummaryItem({ key: "approvedForCheckin", label: "Imoveis aprovados para entrada", value: 0, tone: "green" }),
    makeSummaryItem({ key: "blockedProperties", label: "Imoveis bloqueados", value: 0, tone: "red" }),
  ],
});

const normalizeBooking = (booking) => {
  if (!booking) return null;
  return {
    id: booking.id,
    guest: booking.guest?.name || "",
    guestEmail: booking.guest?.email || "",
    checkin: booking.checkIn || null,
    checkout: booking.checkOut || null,
    status: String(booking.status || "").toLowerCase(),
    guests: booking.guests || null,
  };
};

const normalizeChecklistItem = (item) => ({
  id: item.id,
  label: item.label,
  status: String(item.status || "PENDING").toLowerCase(),
  notes: item.notes || "",
  sortOrder: item.sortOrder || 0,
});

const normalizePhoto = (photo) => ({
  id: photo.id,
  url: photo.url,
  label: photo.label || "",
  type: String(photo.type || "INSPECTION").toLowerCase(),
  uploadedAt: photo.uploadedAt,
  sortOrder: photo.sortOrder || 0,
});

const normalizeTask = (task) => ({
  id: task.id,
  place: task.place
    ? {
        id: task.place.id,
        title: task.place.title || "Acomodacao",
        city: task.place.city || "",
        photo: task.place.photos?.[0]?.url || null,
      }
    : null,
  previousBooking: normalizeBooking(task.previousBooking),
  nextBooking: normalizeBooking(task.nextBooking),
  lastCheckout: task.lastCheckout || task.previousBooking?.checkOut || null,
  nextCheckin: task.nextCheckin || task.nextBooking?.checkIn || null,
  cleaningStatus: STATUS_KEYS[task.cleaningStatus] || String(task.cleaningStatus || "").toLowerCase(),
  cleaningStatusLabel: STATUS_LABELS[task.cleaningStatus] || task.cleaningStatus,
  inspectionStatus: STATUS_KEYS[task.inspectionStatus] || String(task.inspectionStatus || "").toLowerCase(),
  inspectionStatusLabel: STATUS_LABELS[task.inspectionStatus] || task.inspectionStatus,
  overallStatus: STATUS_KEYS[task.overallStatus] || String(task.overallStatus || "").toLowerCase(),
  overallStatusLabel: STATUS_LABELS[task.overallStatus] || task.overallStatus,
  assignee: task.assigneeName
    ? {
        name: task.assigneeName,
        contact: task.assigneeContact || "",
      }
    : null,
  deadlineLabel: task.deadlineLabel || "",
  notes: task.notes || "",
  cleaningChecklist: (task.cleaningChecklists || []).map(normalizeChecklistItem),
  inspectionChecklist: (task.inspectionChecklists || []).map(normalizeChecklistItem),
  photosBefore: (task.photos || []).filter((photo) => photo.type === "BEFORE").map(normalizePhoto),
  photosAfter: (task.photos || []).filter((photo) => photo.type === "AFTER").map(normalizePhoto),
});

export const buildCleaningInspectionData = async (hostId) => {
  const tasks = await prisma.cleaningInspection.findMany({
    where: { hostId },
    orderBy: [{ nextCheckin: "asc" }, { updatedAt: "desc" }],
    include: {
      place: {
        select: {
          id: true,
          title: true,
          city: true,
          photos: { select: { url: true }, orderBy: { sortOrder: "asc" }, take: 1 },
        },
      },
      previousBooking: {
        include: {
          guest: { select: { id: true, name: true, email: true } },
        },
      },
      nextBooking: {
        include: {
          guest: { select: { id: true, name: true, email: true } },
        },
      },
      cleaningChecklists: { orderBy: { sortOrder: "asc" } },
      inspectionChecklists: { orderBy: { sortOrder: "asc" } },
      photos: { orderBy: { sortOrder: "asc" } },
    },
  });

  const summary = emptySummary();

  for (const task of tasks) {
    if (task.overallStatus === "AWAITING_CLEANING") summary.pendingCleanings += 1;
    if (task.overallStatus === "CLEANING_IN_PROGRESS") summary.cleaningInProgress += 1;
    if (task.overallStatus === "AWAITING_INSPECTION") summary.pendingInspections += 1;
    if (task.overallStatus === "APPROVED") summary.approvedForCheckin += 1;
    if (task.overallStatus === "BLOCKED") summary.blockedProperties += 1;
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
