import {
  addCleaningInspectionEvidence,
  buildCleaningInspectionData,
  getCleaningInspectionTaskDetail,
  updateCleaningInspectionAssignee,
  updateCleaningInspectionChecklist,
  updateCleaningInspectionNotes,
  updateCleaningInspectionStatus,
} from "./service.js";
import { isCleaningInspectionError } from "./errors.js";

const getHostId = (req) => String(req.user?._id || req.user?.id || "");

const handleCleaningInspectionError = (res, error, fallbackMessage) => {
  if (isCleaningInspectionError(error)) {
    return res.status(error.statusCode).json({
      error: error.message,
      code: error.code,
    });
  }

  console.error(fallbackMessage, error);
  return res.status(500).json({
    error: fallbackMessage,
    code: "INTERNAL_SERVER_ERROR",
  });
};

export const getCleaningInspectionOverviewController = async (req, res) => {
  try {
    const hostId = getHostId(req);
    const cleaningInspection = await buildCleaningInspectionData(hostId, {
      status: req.query.status || null,
      onlyAtRisk:
        req.query.onlyAtRisk === undefined
          ? null
          : String(req.query.onlyAtRisk).toLowerCase() === "true",
      limit: req.query.limit || null,
    });
    return res.status(200).json({ cleaningInspection });
  } catch (error) {
    return handleCleaningInspectionError(
      res,
      error,
      "Erro ao carregar limpeza e vistoria do anfitrião.",
    );
  }
};

export const getCleaningInspectionTaskDetailController = async (req, res) => {
  try {
    const hostId = getHostId(req);
    const detail = await getCleaningInspectionTaskDetail(hostId, req.params.id);
    return res.status(200).json(detail);
  } catch (error) {
    return handleCleaningInspectionError(
      res,
      error,
      "Erro ao carregar o detalhe da tarefa de limpeza e vistoria.",
    );
  }
};

export const updateCleaningInspectionStatusController = async (req, res) => {
  try {
    const hostId = getHostId(req);
    const result = await updateCleaningInspectionStatus(
      hostId,
      req.params.id,
      req.body,
      req.user?._id || req.user?.id || null,
    );
    return res.status(200).json(result);
  } catch (error) {
    return handleCleaningInspectionError(
      res,
      error,
      "Erro ao atualizar o status da tarefa de limpeza e vistoria.",
    );
  }
};

export const updateCleaningInspectionChecklistController = async (req, res) => {
  try {
    const hostId = getHostId(req);
    const result = await updateCleaningInspectionChecklist(
      hostId,
      req.params.id,
      req.body,
      req.user?._id || req.user?.id || null,
    );
    return res.status(200).json(result);
  } catch (error) {
    return handleCleaningInspectionError(
      res,
      error,
      "Erro ao atualizar o checklist da tarefa.",
    );
  }
};

export const addCleaningInspectionEvidenceController = async (req, res) => {
  try {
    const hostId = getHostId(req);
    const result = await addCleaningInspectionEvidence(
      hostId,
      req.params.id,
      req.body,
      req.user?._id || req.user?.id || null,
    );
    return res.status(201).json(result);
  } catch (error) {
    return handleCleaningInspectionError(
      res,
      error,
      "Erro ao registrar evidência da tarefa.",
    );
  }
};

export const updateCleaningInspectionAssigneeController = async (req, res) => {
  try {
    const hostId = getHostId(req);
    const result = await updateCleaningInspectionAssignee(
      hostId,
      req.params.id,
      req.body,
    );
    return res.status(200).json(result);
  } catch (error) {
    return handleCleaningInspectionError(
      res,
      error,
      "Erro ao atualizar o responsável da tarefa.",
    );
  }
};

export const updateCleaningInspectionNotesController = async (req, res) => {
  try {
    const hostId = getHostId(req);
    const result = await updateCleaningInspectionNotes(
      hostId,
      req.params.id,
      req.body,
    );
    return res.status(200).json(result);
  } catch (error) {
    return handleCleaningInspectionError(
      res,
      error,
      "Erro ao atualizar as observações da tarefa.",
    );
  }
};

