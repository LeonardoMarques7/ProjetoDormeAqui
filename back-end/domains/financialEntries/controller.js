import {
  buildMonthlyFinancialSummary,
  createFinancialEntry,
  deleteFinancialEntry,
  listFinancialEntries,
  updateFinancialEntry,
} from "./service.js";

export const getFinancialEntries = async (req, res, next) => {
  try {
    const entries = await listFinancialEntries(req.user._id, req.query);
    return res.status(200).json({ success: true, data: entries });
  } catch (error) {
    next(error);
  }
};

export const getMonthlyFinancialSummary = async (req, res, next) => {
  try {
    const summary = await buildMonthlyFinancialSummary({
      hostId: req.user._id,
      placeId: req.query.placeId || req.query.place || null,
      competenceMonth: req.query.competenceMonth || req.query.month || null,
    });
    return res.status(200).json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
};

export const createFinancialEntryController = async (req, res, next) => {
  try {
    const entry = await createFinancialEntry(req.user._id, req.body);
    return res.status(201).json({ success: true, data: entry });
  } catch (error) {
    next(error);
  }
};

export const updateFinancialEntryController = async (req, res, next) => {
  try {
    const entry = await updateFinancialEntry(req.user._id, req.params.entryId, req.body);
    return res.status(200).json({ success: true, data: entry });
  } catch (error) {
    next(error);
  }
};

export const deleteFinancialEntryController = async (req, res, next) => {
  try {
    const result = await deleteFinancialEntry(req.user._id, req.params.entryId);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
