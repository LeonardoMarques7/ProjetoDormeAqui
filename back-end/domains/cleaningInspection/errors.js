export class CleaningInspectionError extends Error {
  constructor(message, { statusCode = 400, code = "CLEANING_INSPECTION_ERROR" } = {}) {
    super(message);
    this.name = "CleaningInspectionError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

export const createCleaningInspectionError = (message, options) =>
  new CleaningInspectionError(message, options);

export const isCleaningInspectionError = (error) =>
  error instanceof CleaningInspectionError;

