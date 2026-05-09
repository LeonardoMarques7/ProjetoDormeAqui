import { Router } from "express";
import { requireAuth } from "../middleware.js";
import {
  addCleaningInspectionEvidenceController,
  getCleaningInspectionOverviewController,
  getCleaningInspectionTaskDetailController,
  updateCleaningInspectionAssigneeController,
  updateCleaningInspectionChecklistController,
  updateCleaningInspectionNotesController,
  updateCleaningInspectionStatusController,
} from "./controller.js";

const router = Router();

router.use(requireAuth);

router.get("/", getCleaningInspectionOverviewController);
router.get("/:id", getCleaningInspectionTaskDetailController);
router.patch("/:id/status", updateCleaningInspectionStatusController);
router.patch("/:id/checklist", updateCleaningInspectionChecklistController);
router.post("/:id/evidence", addCleaningInspectionEvidenceController);
router.patch("/:id/assignee", updateCleaningInspectionAssigneeController);
router.patch("/:id/notes", updateCleaningInspectionNotesController);

export default router;

