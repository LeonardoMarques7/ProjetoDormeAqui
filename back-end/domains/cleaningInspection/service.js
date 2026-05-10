import { getPrismaClient } from "../../config/prisma.js";
import {
  getHostCleaningInspectionMetrics,
  getHostCleaningInspectionProblemPlaces,
  getHostCleaningInspectionResponsibles,
  getHostCleaningInspectionTaskById,
  getHostCleaningInspectionTasks,
} from "../../prisma/queries/index.js";
import { isUuid } from "../../prisma/repositories/helpers.js";
import {
  createCleaningInspectionError,
  isCleaningInspectionError,
} from "./errors.js";
import {
  normalizeAssigneeRole,
  normalizeChecklistScope,
  normalizeChecklistStatus,
  normalizeCleaningArea,
  normalizeEvidenceType,
  normalizePublicStatus,
  validateNotesPayload,
  validateOptionalReason,
  validateTaskId,
  validateUrlPayload,
} from "./validators.js";

const CLEANING_INSPECTION_FILTERS = [
  { key: "all", label: "Todos" },
  { key: "awaiting_cleaning", label: "Aguardando limpeza" },
  { key: "cleaning_in_progress", label: "Em limpeza" },
  { key: "awaiting_inspection", label: "Aguardando vistoria" },
  { key: "approved", label: "Aprovados" },
  { key: "rejected", label: "Reprovados" },
  { key: "blocked", label: "Bloqueados" },
  { key: "overdue", label: "Atrasados" },
];

const RISK_LEVEL_FILTERS = [
  { key: "all", label: "Todos" },
  { key: "at_risk", label: "Próximo check-in em risco" },
  { key: "stable", label: "Sem risco imediato" },
];

const AREA_LABELS = {
  bathroom: "Banheiro",
  kitchen: "Cozinha",
  bedroom: "Quarto",
  common_area: "Áreas comuns",
  contact_surfaces: "Superfícies de contato",
  linens: "Enxoval",
  supplies: "Insumos",
  basic_safety: "Segurança básica",
  outdoor: "Área externa",
  other: "Outros",
};

const STATUS_TRANSITIONS = {
  awaiting_cleaning: new Set(["cleaning_in_progress", "blocked"]),
  cleaning_in_progress: new Set(["awaiting_inspection", "blocked"]),
  awaiting_inspection: new Set(["approved", "rejected", "blocked"]),
  rejected: new Set(["cleaning_in_progress", "blocked"]),
};

const emptyMetrics = () => ({
  hostId: null,
  hostName: "",
  tasksCount: 0,
  pendingTasksCount: 0,
  tasksInCleaningCount: 0,
  tasksAwaitingInspectionCount: 0,
  tasksApprovedCount: 0,
  tasksBlockedCount: 0,
  tasksRejectedCount: 0,
  tasksOverdueCount: 0,
  tasksNextCheckinAtRiskCount: 0,
  averageCleaningDurationMinutes: null,
  inspectionApprovalRate: null,
  tasksWithIncompleteChecklistCount: 0,
  incompleteChecklistItemsCount: 0,
  tasksWithoutEvidenceCount: 0,
  recurringProblemEventsCount: 0,
});

const makeSummaryItem = ({ key, label, value, tone = "slate", helper = "" }) => ({
  key,
  label,
  value,
  format: "number",
  tone,
  helper,
  available: true,
});

const toNumber = (value) => {
  if (value === null || value === undefined || value === "") return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "bigint") return Number(value);
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toNullableNumber = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeMetricsRow = (row = {}) => ({
  hostId: row.host_id || null,
  hostName: row.host_name || "",
  tasksCount: toNumber(row.tasks_count),
  pendingTasksCount: toNumber(row.pending_tasks_count),
  tasksInCleaningCount: toNumber(row.tasks_in_cleaning_count),
  tasksAwaitingInspectionCount: toNumber(row.tasks_awaiting_inspection_count),
  tasksApprovedCount: toNumber(row.tasks_approved_count),
  tasksBlockedCount: toNumber(row.tasks_blocked_count),
  tasksRejectedCount: toNumber(row.tasks_rejected_count),
  tasksOverdueCount: toNumber(row.tasks_overdue_count),
  tasksNextCheckinAtRiskCount: toNumber(row.tasks_next_checkin_at_risk_count),
  averageCleaningDurationMinutes: toNullableNumber(
    row.average_cleaning_duration_minutes,
  ),
  inspectionApprovalRate: toNullableNumber(row.inspection_approval_rate),
  tasksWithIncompleteChecklistCount: toNumber(
    row.tasks_with_incomplete_checklist_count,
  ),
  incompleteChecklistItemsCount: toNumber(row.incomplete_checklist_items_count),
  tasksWithoutEvidenceCount: toNumber(row.tasks_without_evidence_count),
  recurringProblemEventsCount: toNumber(row.recurring_problem_events_count),
});

const buildSummary = (metrics) => ({
  totalPending: metrics.pendingTasksCount,
  inCleaning: metrics.tasksInCleaningCount,
  awaitingInspection: metrics.tasksAwaitingInspectionCount,
  approved: metrics.tasksApprovedCount,
  blocked: metrics.tasksBlockedCount,
  overdue: metrics.tasksOverdueCount,
  nextCheckInRisk: metrics.tasksNextCheckinAtRiskCount,
  averageCleaningTime: metrics.averageCleaningDurationMinutes,
  approvalRate: metrics.inspectionApprovalRate,
  missingEvidenceCount: metrics.tasksWithoutEvidenceCount,
  pendingCleanings: metrics.pendingTasksCount,
  cleaningInProgress: metrics.tasksInCleaningCount,
  pendingInspections: metrics.tasksAwaitingInspectionCount,
  approvedForCheckin: metrics.tasksApprovedCount,
  blockedProperties: metrics.tasksBlockedCount,
  overdueTasks: metrics.tasksOverdueCount,
  tasksAtRisk: metrics.tasksNextCheckinAtRiskCount,
  averageCleaningDurationMinutes: metrics.averageCleaningDurationMinutes,
  inspectionApprovalRate: metrics.inspectionApprovalRate,
  incompleteChecklists: metrics.tasksWithIncompleteChecklistCount,
  tasksWithoutEvidence: metrics.tasksWithoutEvidenceCount,
  items: [
    makeSummaryItem({
      key: "pendingCleanings",
      label: "Limpezas pendentes",
      value: metrics.pendingTasksCount,
      tone: "amber",
      helper: "Tarefas que ainda não foram liberadas para a próxima etapa.",
    }),
    makeSummaryItem({
      key: "cleaningInProgress",
      label: "Em limpeza",
      value: metrics.tasksInCleaningCount,
      tone: "blue",
      helper: "Acomodações em preparação neste momento.",
    }),
    makeSummaryItem({
      key: "pendingInspections",
      label: "Aguardando vistoria",
      value: metrics.tasksAwaitingInspectionCount,
      tone: "violet",
      helper: "Limpezas concluídas que precisam de validação final.",
    }),
    makeSummaryItem({
      key: "approvedForCheckin",
      label: "Aprovados para entrada",
      value: metrics.tasksApprovedCount,
      tone: "green",
      helper: "Imóveis liberados para receber o próximo hóspede.",
    }),
    makeSummaryItem({
      key: "blockedProperties",
      label: "Bloqueados",
      value: metrics.tasksBlockedCount,
      tone: "red",
      helper: "Tarefas impedidas por problema operacional ou vistoria.",
    }),
  ],
});

const mapResponsibleRow = (row = {}) => ({
  responsibleId: row.responsible_id || null,
  responsibleName: row.responsible_name || "Sem responsável",
  tasksCount: toNumber(row.tasks_count),
  awaitingCleaningCount: toNumber(row.awaiting_cleaning_count),
  cleaningInProgressCount: toNumber(row.cleaning_in_progress_count),
  awaitingInspectionCount: toNumber(row.awaiting_inspection_count),
  approvedCount: toNumber(row.approved_count),
  blockedCount: toNumber(row.blocked_count),
  rejectedCount: toNumber(row.rejected_count),
  overdueCount: toNumber(row.overdue_count),
  nextCheckinAtRiskCount: toNumber(row.next_checkin_at_risk_count),
});

const mapProblemPlaceRow = (row = {}) => ({
  placeId: row.place_id,
  placeTitle: row.place_title || "",
  placeCity: row.place_city || "",
  tasksCount: toNumber(row.tasks_count),
  recurringProblemCount: toNumber(row.recurring_problem_count),
  blockedTasksCount: toNumber(row.blocked_tasks_count),
  rejectedTasksCount: toNumber(row.rejected_tasks_count),
  overdueTasksCount: toNumber(row.overdue_tasks_count),
  nextCheckinAtRiskCount: toNumber(row.next_checkin_at_risk_count),
});

const mapChecklistItem = (item = {}, scope = "cleaning") => ({
  ...item,
  scope,
  required: Boolean(item.required),
  sortOrder: toNumber(item.sortOrder),
});

const mapEvidenceItem = (item = {}) => ({
  ...item,
  uploadedAt: item.uploadedAt || null,
});

const mapTaskRow = (row = {}) => {
  const currentStatus = row.effective_overall_status || "";
  const normalizedCurrentStatus = String(currentStatus || "").toLowerCase();
  const checklistItemsCount = toNumber(row.checklist_items_count);
  const requiredChecklistItemsCount = toNumber(row.required_checklist_items_count);
  const incompleteRequiredChecklistItemsCount = toNumber(
    row.incomplete_required_checklist_items_count,
  );
  const totalEvidenceCount = toNumber(row.total_evidence_count);
  const minimumRequiredEvidenceCount = toNumber(
    row.minimum_required_evidence_count,
  );

  return {
    id: row.task_id,
    place: row.place || null,
    previousBooking: row.previous_booking || null,
    nextBooking: row.next_booking || null,
    currentStatus: normalizedCurrentStatus,
    currentStatusLabel: row.effective_overall_status_label || "",
    cleaningStatus: row.cleaning_status || "",
    cleaningStatusLabel: row.cleaning_status_label || "",
    inspectionStatus: row.inspection_status || "",
    inspectionStatusLabel: row.inspection_status_label || "",
    responsible: row.assignee || null,
    dueDate: row.deadline_at || null,
    lastCheckoutAt: row.last_checkout || null,
    nextCheckInAt: row.next_checkin || null,
    isOverdue: normalizedCurrentStatus === "overdue",
    isNextCheckInRisk: Boolean(row.next_checkin_at_risk),
    checklistProgress: {
      total: checklistItemsCount,
      required: requiredChecklistItemsCount,
      completedRequired:
        requiredChecklistItemsCount - incompleteRequiredChecklistItemsCount,
      incompleteRequired: incompleteRequiredChecklistItemsCount,
      failed: toNumber(row.failed_checklist_items_count),
      isRequiredChecklistComplete: Boolean(row.is_required_checklist_complete),
    },
    evidenceProgress: {
      total: totalEvidenceCount,
      minimumRequired: minimumRequiredEvidenceCount,
      missingRequired: toNumber(row.missing_required_evidence_count),
      hasMinimumRequiredEvidence: Boolean(row.has_minimum_required_evidence),
      requiresPhotoEvidence: Boolean(row.requires_photo_evidence),
    },
    notes: row.notes || "",
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null,
    cleaningStartedAt: row.cleaning_started_at || row.cleaningStartedAt || null,
    cleaningCompletedAt:
      row.cleaning_completed_at || row.cleaningCompletedAt || null,
    inspectionCompletedAt:
      row.inspection_completed_at || row.inspectionCompletedAt || null,
    lastCheckout: row.last_checkout || null,
    nextCheckin: row.next_checkin || null,
    deadlineAt: row.deadline_at || null,
    deadlineLabel: row.deadline_label || "",
    overallStatus: row.overall_status || "",
    overallStatusLabel: row.overall_status_label || "",
    effectiveOverallStatus: normalizedCurrentStatus,
    effectiveOverallStatusLabel: row.effective_overall_status_label || "",
    cleaningAssignee: row.cleaning_assignee || null,
    inspectionAssignee: row.inspection_assignee || null,
    assignee: row.assignee || null,
    deadlineRisk: Boolean(row.next_checkin_at_risk),
    requiresPhotoEvidence: Boolean(row.requires_photo_evidence),
    minimumRequiredEvidenceCount,
    checklistItemsCount,
    requiredChecklistItemsCount,
    incompleteRequiredChecklistItemsCount,
    failedChecklistItemsCount: toNumber(row.failed_checklist_items_count),
    totalEvidenceCount,
    missingRequiredEvidenceCount: toNumber(row.missing_required_evidence_count),
    isRequiredChecklistComplete: Boolean(row.is_required_checklist_complete),
    hasMinimumRequiredEvidence: Boolean(row.has_minimum_required_evidence),
    isReadyForApproval: Boolean(row.is_ready_for_approval),
    nextCheckinAtRisk: Boolean(row.next_checkin_at_risk),
    cleaningDurationMinutes: toNullableNumber(row.cleaning_duration_minutes),
    cleaningChecklist: Array.isArray(row.cleaning_checklist)
      ? row.cleaning_checklist.map((item) => mapChecklistItem(item, "cleaning"))
      : [],
    inspectionChecklist: Array.isArray(row.inspection_checklist)
      ? row.inspection_checklist.map((item) => mapChecklistItem(item, "inspection"))
      : [],
    photosBefore: Array.isArray(row.photos_before)
      ? row.photos_before.map(mapEvidenceItem)
      : [],
    photosAfter: Array.isArray(row.photos_after)
      ? row.photos_after.map(mapEvidenceItem)
      : [],
    photosInspection: Array.isArray(row.photos_inspection)
      ? row.photos_inspection.map(mapEvidenceItem)
      : [],
    photosIssue: Array.isArray(row.photos_issue)
      ? row.photos_issue.map(mapEvidenceItem)
      : [],
    photosGeneral: Array.isArray(row.photos_general)
      ? row.photos_general.map(mapEvidenceItem)
      : [],
  };
};

const dedupeByKey = (items = [], keySelector) => {
  const seen = new Set();
  return items.filter((item) => {
    const key = keySelector(item);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const buildFilterOptions = (items = [], responsibleRows = []) => ({
  statuses: CLEANING_INSPECTION_FILTERS,
  places: dedupeByKey(
    items
      .filter((item) => item.place?.id)
      .map((item) => ({
        key: item.place.id,
        label: item.place.title || "Imóvel sem nome",
        city: item.place.city || "",
      })),
    (item) => item.key,
  ),
  responsibles: responsibleRows.map((row) => ({
    key: row.responsibleId || "unassigned",
    label: row.responsibleName,
    tasksCount: row.tasksCount,
  })),
  riskLevels: RISK_LEVEL_FILTERS,
});

const buildApprovalBlockers = (task) => {
  const blockers = [];

  if (!task.isRequiredChecklistComplete) {
    blockers.push({
      code: "CHECKLIST_INCOMPLETE",
      label: "Checklist obrigatório incompleto",
      description: "Existem itens obrigatórios que ainda não foram concluídos.",
    });
  }

  if (!task.hasMinimumRequiredEvidence && task.requiresPhotoEvidence) {
    blockers.push({
      code: "MISSING_EVIDENCE",
      label: "Evidências insuficientes",
      description: "A quantidade mínima de fotos ou evidências ainda não foi atendida.",
    });
  }

  if (task.failedChecklistItemsCount > 0) {
    blockers.push({
      code: "CRITICAL_ISSUE",
      label: "Pendência crítica no checklist",
      description: "Há itens do checklist marcados como falha ou problema.",
    });
  }

  if (task.currentStatus === "blocked") {
    blockers.push({
      code: "TASK_BLOCKED",
      label: "Tarefa bloqueada",
      description: "A tarefa está bloqueada e precisa ser desbloqueada antes da aprovação.",
    });
  }

  return blockers;
};

const buildChecklistByArea = (cleaningChecklist = [], inspectionChecklist = []) => {
  const areaMap = new Map();

  for (const item of [...cleaningChecklist, ...inspectionChecklist]) {
    const areaKey = item.area || "other";
    const current = areaMap.get(areaKey) || {
      key: areaKey,
      label: AREA_LABELS[areaKey] || AREA_LABELS.other,
      cleaningItems: [],
      inspectionItems: [],
    };

    if (item.scope === "inspection") {
      current.inspectionItems.push(item);
    } else {
      current.cleaningItems.push(item);
    }

    areaMap.set(areaKey, current);
  }

  return [...areaMap.values()].sort((a, b) => a.label.localeCompare(b.label));
};

const buildTimeline = (task) => {
  const events = [];

  const pushEvent = (type, label, at, meta = {}) => {
    if (!at) return;
    events.push({
      type,
      label,
      at,
      ...meta,
    });
  };

  pushEvent("task_created", "Tarefa criada", task.createdAt);
  pushEvent("last_checkout", "Último checkout registrado", task.lastCheckoutAt);
  pushEvent("cleaning_started", "Limpeza iniciada", task.cleaningStartedAt);
  pushEvent("cleaning_completed", "Limpeza concluída", task.cleaningCompletedAt);
  pushEvent("inspection_completed", "Vistoria concluída", task.inspectionCompletedAt);

  const allEvidence = [
    ...task.photosBefore,
    ...task.photosAfter,
    ...task.photosInspection,
    ...task.photosIssue,
    ...task.photosGeneral,
  ];
  const lastEvidence = [...allEvidence]
    .filter((item) => item.uploadedAt)
    .sort((a, b) => String(b.uploadedAt).localeCompare(String(a.uploadedAt)))[0];

  if (lastEvidence) {
    pushEvent("last_evidence", "Última evidência adicionada", lastEvidence.uploadedAt, {
      evidenceType: lastEvidence.type || "",
    });
  }

  pushEvent("task_updated", "Última atualização", task.updatedAt);

  return events.sort((a, b) => String(a.at).localeCompare(String(b.at)));
};

const appendOperationalReason = (existingNotes, reason, kind) => {
  const trimmedReason = String(reason || "").trim();
  if (!trimmedReason) return existingNotes || "";
  const stamp = new Date().toISOString();
  const prefix = kind === "blocked" ? "Bloqueio" : "Reprovação";
  const entry = `[${stamp}] ${prefix}: ${trimmedReason}`;
  return existingNotes ? `${existingNotes}\n${entry}` : entry;
};

const extractHostId = (record) => String(record?.hostId || "");

const resolveOperationalHostId = async (prisma, hostId) => {
  const normalizedHostId = String(hostId || "").trim();

  if (!normalizedHostId) {
    throw createCleaningInspectionError("Autenticação inválida para esta operação.", {
      statusCode: 401,
      code: "UNAUTHENTICATED",
    });
  }

  const host = await prisma.user.findFirst({
    where: isUuid(normalizedHostId)
      ? {
          OR: [{ id: normalizedHostId }, { legacyMongoId: normalizedHostId }],
        }
      : { legacyMongoId: normalizedHostId },
    select: { id: true },
  });

  if (!host?.id) {
    throw createCleaningInspectionError(
      "Anfitrião não encontrado na base operacional.",
      {
        statusCode: 404,
        code: "HOST_NOT_FOUND",
      },
    );
  }

  return host.id;
};

const ensureTaskExistsForHost = async (prisma, hostId, taskId) => {
  const task = await prisma.cleaningInspection.findUnique({
    where: { id: taskId },
    select: {
      id: true,
      hostId: true,
      overallStatus: true,
      cleaningStatus: true,
      inspectionStatus: true,
      notes: true,
      cleaningStartedAt: true,
      cleaningCompletedAt: true,
      inspectionCompletedAt: true,
      assigneeName: true,
      assigneeContact: true,
      inspectionAssigneeName: true,
      inspectionAssigneeContact: true,
    },
  });

  if (!task) {
    throw createCleaningInspectionError(
      "Tarefa de limpeza e vistoria não encontrada.",
      { statusCode: 404, code: "TASK_NOT_FOUND" },
    );
  }

  if (extractHostId(task) !== String(hostId)) {
    throw createCleaningInspectionError(
      "Você não tem permissão para acessar esta tarefa.",
      { statusCode: 403, code: "FORBIDDEN_TASK" },
    );
  }

  return task;
};

const ensureUserExists = async (prisma, userId) => {
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      profile: {
        select: {
          phone: true,
        },
      },
    },
  });

  if (!user) {
    throw createCleaningInspectionError("Responsável não encontrado.", {
      statusCode: 404,
      code: "ASSIGNEE_NOT_FOUND",
    });
  }

  return user;
};

const ensureChecklistItemBelongsToTask = async (
  prisma,
  hostId,
  taskId,
  itemId,
  scope,
) => {
  const model =
    scope === "inspection"
      ? prisma.inspectionChecklistItem
      : prisma.cleaningChecklistItem;

  const item = await model.findUnique({
    where: { id: itemId },
    select: {
      id: true,
      cleaningInspectionId: true,
      cleaningInspection: {
        select: {
          hostId: true,
        },
      },
    },
  });

  if (!item) {
    throw createCleaningInspectionError("Item de checklist não encontrado.", {
      statusCode: 404,
      code: "CHECKLIST_ITEM_NOT_FOUND",
    });
  }

  if (extractHostId(item.cleaningInspection) !== String(hostId)) {
    throw createCleaningInspectionError(
      "Você não tem permissão para alterar este item de checklist.",
      { statusCode: 403, code: "FORBIDDEN_CHECKLIST_ITEM" },
    );
  }

  if (String(item.cleaningInspectionId) !== String(taskId)) {
    throw createCleaningInspectionError(
      "O item de checklist informado não pertence a esta tarefa.",
      { statusCode: 400, code: "CHECKLIST_ITEM_TASK_MISMATCH" },
    );
  }

  return item;
};

const getTaskRowOrThrow = async (prisma, hostId, taskId) => {
  const persistedTask = await ensureTaskExistsForHost(prisma, hostId, taskId);
  const rows = await getHostCleaningInspectionTaskById(prisma, {
    hostId,
    taskId,
  });

  if (!rows[0]) {
    throw createCleaningInspectionError(
      "Tarefa de limpeza e vistoria não encontrada.",
      { statusCode: 404, code: "TASK_NOT_FOUND" },
    );
  }

  return mapTaskRow({
    ...rows[0],
    cleaningStartedAt: persistedTask.cleaningStartedAt,
    cleaningCompletedAt: persistedTask.cleaningCompletedAt,
    inspectionCompletedAt: persistedTask.inspectionCompletedAt,
    overall_status: rows[0].overall_status || persistedTask.overallStatus,
    cleaning_status: rows[0].cleaning_status || persistedTask.cleaningStatus,
    inspection_status:
      rows[0].inspection_status || persistedTask.inspectionStatus,
    notes: rows[0].notes ?? persistedTask.notes,
  });
};

const buildDetailPayload = (task) => ({
  item: {
    ...task,
    responsible: task.responsible || task.assignee || null,
    checklistByArea: buildChecklistByArea(
      task.cleaningChecklist,
      task.inspectionChecklist,
    ),
    evidence: {
      before: task.photosBefore,
      after: task.photosAfter,
      inspection: task.photosInspection,
      issue: task.photosIssue,
      general: task.photosGeneral,
      total: task.totalEvidenceCount,
      missingRequired: task.missingRequiredEvidenceCount,
      minimumRequired: task.minimumRequiredEvidenceCount,
    },
    timeline: buildTimeline(task),
    approvalBlockers: buildApprovalBlockers(task),
    cleaningStartedAt: task.cleaningStartedAt || null,
    cleaningCompletedAt: task.cleaningCompletedAt || null,
    inspectionCompletedAt: task.inspectionCompletedAt || null,
  },
});

const buildListPayload = ({
  metrics,
  taskRows,
  problemPlaceRows,
  responsibleRows,
}) => {
  const normalizedMetrics = metrics[0]
    ? normalizeMetricsRow(metrics[0])
    : emptyMetrics();
  const mappedResponsibles = responsibleRows.map(mapResponsibleRow);
  const items = taskRows.map(mapTaskRow);

  return {
    summary: buildSummary(normalizedMetrics),
    filters: CLEANING_INSPECTION_FILTERS,
    filterOptions: buildFilterOptions(items, mappedResponsibles),
    items,
    metrics: normalizedMetrics,
    problemPlaces: problemPlaceRows.map(mapProblemPlaceRow),
    tasksByResponsible: mappedResponsibles,
  };
};

const buildStatusUpdateData = ({
  persistedTask,
  taskSnapshot,
  nextStatus,
  reason,
}) => {
  const currentStatus = String(taskSnapshot.currentStatus || "");
  const currentOverallStatus = String(taskSnapshot.overallStatus || "").toLowerCase();
  const transitionSource =
    currentStatus === "overdue" ? currentOverallStatus : currentStatus;
  const allowedTargets = STATUS_TRANSITIONS[transitionSource];

  if (!allowedTargets || !allowedTargets.has(nextStatus)) {
    throw createCleaningInspectionError("Transição de status inválida.", {
      statusCode: 409,
      code: "INVALID_STATUS_TRANSITION",
    });
  }

  const now = new Date();

  if (nextStatus === "approved") {
    const blockers = buildApprovalBlockers(taskSnapshot);
    if (blockers.length > 0 || !taskSnapshot.isReadyForApproval) {
      const primaryBlocker = blockers[0];
      throw createCleaningInspectionError(
        primaryBlocker?.description ||
          "A aprovação está bloqueada por pendências operacionais.",
        {
          statusCode: 409,
          code: primaryBlocker?.code || "APPROVAL_BLOCKED",
        },
      );
    }
  }

  if (nextStatus === "rejected" && !reason) {
    throw createCleaningInspectionError("Informe o motivo da reprovação.", {
      statusCode: 400,
      code: "REJECTION_REASON_REQUIRED",
    });
  }

  if (nextStatus === "blocked" && !reason) {
    throw createCleaningInspectionError("Informe o motivo do bloqueio.", {
      statusCode: 400,
      code: "BLOCK_REASON_REQUIRED",
    });
  }

  switch (nextStatus) {
    case "cleaning_in_progress":
      return {
        overallStatus: "CLEANING_IN_PROGRESS",
        cleaningStatus: "CLEANING_IN_PROGRESS",
        inspectionStatus: "AWAITING_INSPECTION",
        cleaningStartedAt: persistedTask.cleaningStartedAt || now,
      };
    case "awaiting_inspection":
      return {
        overallStatus: "AWAITING_INSPECTION",
        cleaningStatus: "DONE",
        inspectionStatus: "AWAITING_INSPECTION",
        cleaningCompletedAt: now,
      };
    case "approved":
      return {
        overallStatus: "APPROVED",
        inspectionStatus: "APPROVED",
        inspectionCompletedAt: now,
      };
    case "rejected":
      return {
        overallStatus: "REJECTED",
        inspectionStatus: "REJECTED",
        inspectionCompletedAt: now,
        notes: appendOperationalReason(persistedTask.notes, reason, "rejected"),
      };
    case "blocked":
      return {
        overallStatus: "BLOCKED",
        inspectionStatus: "BLOCKED",
        notes: appendOperationalReason(persistedTask.notes, reason, "blocked"),
      };
    default:
      throw createCleaningInspectionError("Status de destino não suportado.", {
        statusCode: 400,
        code: "INVALID_STATUS_TARGET",
      });
  }
};

const getServiceClient = async (client) => client || getPrismaClient();

export const buildCleaningInspectionData = async (hostId, filters = {}, client) => {
  const prisma = await getServiceClient(client);
  const postgresHostId = await resolveOperationalHostId(prisma, hostId);
  const effectiveStatus = filters.status
    ? normalizePublicStatus(filters.status, { allowEmpty: true })
    : null;
  const onlyAtRisk =
    filters.onlyAtRisk === undefined || filters.onlyAtRisk === null
      ? null
      : Boolean(filters.onlyAtRisk);
  const limit = filters.limit || 250;

  const [metricRows, taskRows, problemPlaceRows, responsibleRows] =
    await Promise.all([
      getHostCleaningInspectionMetrics(prisma, { hostId: postgresHostId }),
      getHostCleaningInspectionTasks(prisma, {
        hostId: postgresHostId,
        effectiveStatus,
        onlyAtRisk,
        limit,
      }),
      getHostCleaningInspectionProblemPlaces(prisma, {
        hostId: postgresHostId,
        limit: 12,
      }),
      getHostCleaningInspectionResponsibles(prisma, {
        hostId: postgresHostId,
        limit: 50,
      }),
    ]);

  return buildListPayload({
    metrics: metricRows,
    taskRows,
    problemPlaceRows,
    responsibleRows,
  });
};

export const getCleaningInspectionTaskDetail = async (hostId, taskId, client) => {
  const prisma = await getServiceClient(client);
  validateTaskId(taskId);
  const postgresHostId = await resolveOperationalHostId(prisma, hostId);
  const task = await getTaskRowOrThrow(prisma, postgresHostId, taskId);
  return buildDetailPayload(task);
};

export const updateCleaningInspectionStatus = async (
  hostId,
  taskId,
  payload = {},
  actorUserId,
) => {
  const prisma = await getPrismaClient();
  validateTaskId(taskId);
  const postgresHostId = await resolveOperationalHostId(prisma, hostId);
  const nextStatus = normalizePublicStatus(payload.status);
  const reason = validateOptionalReason(payload.reason);

  try {
    return await prisma.$transaction(async (tx) => {
      const persistedTask = await ensureTaskExistsForHost(
        tx,
        postgresHostId,
        taskId,
      );
      const taskSnapshot = await getTaskRowOrThrow(tx, postgresHostId, taskId);
      const data = buildStatusUpdateData({
        persistedTask,
        taskSnapshot,
        nextStatus,
        reason,
      });

      await tx.cleaningInspection.update({
        where: { id: taskId },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });

      const detail = await getCleaningInspectionTaskDetail(
        postgresHostId,
        taskId,
        tx,
      );
      return {
        message: "Status da tarefa atualizado com sucesso.",
        changedByUserId: actorUserId || null,
        ...detail,
      };
    });
  } catch (error) {
    if (isCleaningInspectionError(error)) throw error;
    throw error;
  }
};

export const updateCleaningInspectionChecklist = async (
  hostId,
  taskId,
  payload = {},
  actorUserId,
) => {
  const prisma = await getPrismaClient();
  validateTaskId(taskId);
  const postgresHostId = await resolveOperationalHostId(prisma, hostId);
  const scope = normalizeChecklistScope(payload.scope);
  const itemId = validateTaskId(payload.itemId, "itemId");
  const status = normalizeChecklistStatus(payload.status);
  const notes = validateOptionalReason(payload.notes, { maxLength: 2000 });

  return prisma.$transaction(async (tx) => {
    await ensureTaskExistsForHost(tx, postgresHostId, taskId);
    await ensureChecklistItemBelongsToTask(
      tx,
      postgresHostId,
      taskId,
      itemId,
      scope,
    );

    const model =
      scope === "inspection"
        ? tx.inspectionChecklistItem
        : tx.cleaningChecklistItem;

    const completedFields =
      status === "DONE" || status === "FAILED"
        ? {
            completedAt: new Date(),
            completedByUserId: actorUserId || null,
          }
        : status === "PENDING"
          ? {
              completedAt: null,
              completedByUserId: null,
            }
          : {};

    await model.update({
      where: { id: itemId },
      data: {
        status,
        notes,
        ...completedFields,
      },
    });

    const detail = await getCleaningInspectionTaskDetail(
      postgresHostId,
      taskId,
      tx,
    );
    return {
      message: "Checklist atualizado com sucesso.",
      ...detail,
    };
  });
};

export const addCleaningInspectionEvidence = async (
  hostId,
  taskId,
  payload = {},
  actorUserId,
) => {
  const prisma = await getPrismaClient();
  validateTaskId(taskId);
  const postgresHostId = await resolveOperationalHostId(prisma, hostId);
  const type = normalizeEvidenceType(payload.type);
  const url = validateUrlPayload(payload.url);
  const description = validateOptionalReason(payload.description, {
    maxLength: 2000,
    allowEmpty: true,
  });
  const area = normalizeCleaningArea(payload.area, { allowEmpty: true });
  const checklistItemId = payload.checklistItemId
    ? validateTaskId(payload.checklistItemId, "checklistItemId")
    : null;
  const scope = checklistItemId
    ? normalizeChecklistScope(payload.scope)
    : null;

  return prisma.$transaction(async (tx) => {
    await ensureTaskExistsForHost(tx, postgresHostId, taskId);

    if (checklistItemId && scope) {
      await ensureChecklistItemBelongsToTask(
        tx,
        postgresHostId,
        taskId,
        checklistItemId,
        scope,
      );
    }

    const existingPhotos = await tx.cleaningInspectionPhoto.count({
      where: { cleaningInspectionId: taskId },
    });

    await tx.cleaningInspectionPhoto.create({
      data: {
        cleaningInspectionId: taskId,
        cleaningChecklistItemId:
          scope === "cleaning" ? checklistItemId : null,
        inspectionChecklistItemId:
          scope === "inspection" ? checklistItemId : null,
        uploadedByUserId: actorUserId || null,
        url,
        description,
        area,
        type,
        uploadedAt: new Date(),
        sortOrder: existingPhotos,
      },
    });

    const detail = await getCleaningInspectionTaskDetail(
      postgresHostId,
      taskId,
      tx,
    );
    return {
      message: "Evidência registrada com sucesso.",
      ...detail,
    };
  });
};

export const updateCleaningInspectionAssignee = async (
  hostId,
  taskId,
  payload = {},
) => {
  const prisma = await getPrismaClient();
  validateTaskId(taskId);
  const postgresHostId = await resolveOperationalHostId(prisma, hostId);
  const role = normalizeAssigneeRole(payload.role);
  const userId = payload.userId ? validateTaskId(payload.userId, "userId") : null;

  return prisma.$transaction(async (tx) => {
    await ensureTaskExistsForHost(tx, postgresHostId, taskId);
    const assignee = await ensureUserExists(tx, userId);

    const data =
      role === "cleaning"
        ? {
            cleaningAssigneeId: assignee?.id || null,
            assigneeName: assignee?.name || null,
            assigneeContact: assignee?.profile?.phone || null,
          }
        : {
            inspectionAssigneeId: assignee?.id || null,
            inspectionAssigneeName: assignee?.name || null,
            inspectionAssigneeContact: assignee?.profile?.phone || null,
          };

    await tx.cleaningInspection.update({
      where: { id: taskId },
      data,
    });

    const detail = await getCleaningInspectionTaskDetail(
      postgresHostId,
      taskId,
      tx,
    );
    return {
      message: "Responsável atualizado com sucesso.",
      ...detail,
    };
  });
};

export const updateCleaningInspectionNotes = async (hostId, taskId, payload = {}) => {
  const prisma = await getPrismaClient();
  validateTaskId(taskId);
  const postgresHostId = await resolveOperationalHostId(prisma, hostId);
  const notes = validateNotesPayload(payload.notes);

  return prisma.$transaction(async (tx) => {
    await ensureTaskExistsForHost(tx, postgresHostId, taskId);

    await tx.cleaningInspection.update({
      where: { id: taskId },
      data: { notes },
    });

    const detail = await getCleaningInspectionTaskDetail(
      postgresHostId,
      taskId,
      tx,
    );
    return {
      message: "Observações atualizadas com sucesso.",
      ...detail,
    };
  });
};
