import { createCleaningInspectionError } from "./errors.js";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const PUBLIC_STATUS_TO_DB = {
  awaiting_cleaning: "AWAITING_CLEANING",
  cleaning_in_progress: "CLEANING_IN_PROGRESS",
  awaiting_inspection: "AWAITING_INSPECTION",
  approved: "APPROVED",
  rejected: "REJECTED",
  blocked: "BLOCKED",
  overdue: "OVERDUE",
};

const CHECKLIST_STATUS_TO_DB = {
  pending: "PENDING",
  done: "DONE",
  failed: "FAILED",
  not_applicable: "NOT_APPLICABLE",
};

const EVIDENCE_TYPE_TO_DB = {
  before: "BEFORE",
  after: "AFTER",
  inspection: "INSPECTION",
  issue: "ISSUE",
  general: "GENERAL",
};

const CLEANING_AREA_TO_DB = {
  bathroom: "BATHROOM",
  kitchen: "KITCHEN",
  bedroom: "BEDROOM",
  common_area: "COMMON_AREA",
  contact_surfaces: "CONTACT_SURFACES",
  linens: "LINENS",
  supplies: "SUPPLIES",
  basic_safety: "BASIC_SAFETY",
  outdoor: "OUTDOOR",
  other: "OTHER",
};

const ASSIGNEE_ROLES = new Set(["cleaning", "inspection"]);
const CHECKLIST_SCOPES = new Set(["cleaning", "inspection"]);

const normalizeString = (value) => String(value || "").trim();

export const validateTaskId = (value, fieldName = "id") => {
  const normalized = normalizeString(value);
  if (!normalized || !UUID_PATTERN.test(normalized)) {
    throw createCleaningInspectionError(`Campo '${fieldName}' inválido.`, {
      statusCode: 400,
      code: "INVALID_ID",
    });
  }
  return normalized;
};

export const normalizePublicStatus = (value, { allowEmpty = false } = {}) => {
  const normalized = normalizeString(value).toLowerCase();
  if (!normalized && allowEmpty) return null;
  if (!PUBLIC_STATUS_TO_DB[normalized]) {
    throw createCleaningInspectionError("Status operacional inválido.", {
      statusCode: 400,
      code: "INVALID_STATUS",
    });
  }
  return normalized;
};

export const normalizeChecklistStatus = (value) => {
  const normalized = normalizeString(value).toLowerCase();
  const dbStatus = CHECKLIST_STATUS_TO_DB[normalized];
  if (!dbStatus) {
    throw createCleaningInspectionError("Status de checklist inválido.", {
      statusCode: 400,
      code: "INVALID_CHECKLIST_STATUS",
    });
  }
  return dbStatus;
};

export const normalizeChecklistScope = (value) => {
  const normalized = normalizeString(value).toLowerCase();
  if (!CHECKLIST_SCOPES.has(normalized)) {
    throw createCleaningInspectionError("Escopo de checklist inválido.", {
      statusCode: 400,
      code: "INVALID_CHECKLIST_SCOPE",
    });
  }
  return normalized;
};

export const normalizeEvidenceType = (value) => {
  const normalized = normalizeString(value).toLowerCase();
  const dbType = EVIDENCE_TYPE_TO_DB[normalized];
  if (!dbType) {
    throw createCleaningInspectionError("Tipo de evidência inválido.", {
      statusCode: 400,
      code: "INVALID_EVIDENCE_TYPE",
    });
  }
  return dbType;
};

export const normalizeCleaningArea = (value, { allowEmpty = false } = {}) => {
  const normalized = normalizeString(value).toLowerCase();
  if (!normalized && allowEmpty) return null;
  const dbArea = CLEANING_AREA_TO_DB[normalized];
  if (!dbArea) {
    throw createCleaningInspectionError("Ambiente inválido.", {
      statusCode: 400,
      code: "INVALID_AREA",
    });
  }
  return dbArea;
};

export const normalizeAssigneeRole = (value) => {
  const normalized = normalizeString(value).toLowerCase();
  if (!ASSIGNEE_ROLES.has(normalized)) {
    throw createCleaningInspectionError("Papel de responsável inválido.", {
      statusCode: 400,
      code: "INVALID_ASSIGNEE_ROLE",
    });
  }
  return normalized;
};

export const validateOptionalReason = (
  value,
  { maxLength = 4000, allowEmpty = true } = {},
) => {
  const normalized = normalizeString(value);
  if (!normalized) {
    return allowEmpty ? "" : null;
  }
  if (normalized.length > maxLength) {
    throw createCleaningInspectionError("Texto excede o limite permitido.", {
      statusCode: 400,
      code: "TEXT_TOO_LONG",
    });
  }
  return normalized;
};

export const validateNotesPayload = (value) => {
  if (typeof value !== "string") {
    throw createCleaningInspectionError("Campo 'notes' deve ser texto.", {
      statusCode: 400,
      code: "INVALID_NOTES",
    });
  }
  if (value.length > 8000) {
    throw createCleaningInspectionError("Observações excedem o limite permitido.", {
      statusCode: 400,
      code: "NOTES_TOO_LONG",
    });
  }
  return value.trim();
};

export const validateUrlPayload = (value) => {
  const normalized = normalizeString(value);
  if (!normalized) {
    throw createCleaningInspectionError("Campo 'url' é obrigatório.", {
      statusCode: 400,
      code: "URL_REQUIRED",
    });
  }
  if (
    !normalized.startsWith("http://") &&
    !normalized.startsWith("https://") &&
    !normalized.startsWith("/")
  ) {
    throw createCleaningInspectionError(
      "A evidência deve informar uma URL http/https ou um path absoluto.",
      {
        statusCode: 400,
        code: "INVALID_URL",
      },
    );
  }
  return normalized;
};

