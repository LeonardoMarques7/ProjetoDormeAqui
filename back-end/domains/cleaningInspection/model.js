import { model, Schema } from "mongoose";

const checklistItemSchema = new Schema(
  {
    label: { type: String, trim: true, required: true },
    status: {
      type: String,
      enum: ["pending", "done", "issue", "not_applicable"],
      default: "pending",
    },
    notes: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const photoSchema = new Schema(
  {
    url: { type: String, trim: true, required: true },
    label: { type: String, trim: true, default: "" },
    type: {
      type: String,
      enum: ["before", "after", "inspection", "issue"],
      default: "inspection",
    },
    uploadedAt: { type: Date },
  },
  { _id: false }
);

const assigneeSchema = new Schema(
  {
    name: { type: String, trim: true, default: "" },
    contact: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const cleaningInspectionSchema = new Schema(
  {
    host: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    place: { type: Schema.Types.ObjectId, ref: "Place", required: true, index: true },
    previousBooking: { type: Schema.Types.ObjectId, ref: "Booking" },
    nextBooking: { type: Schema.Types.ObjectId, ref: "Booking" },
    lastCheckout: { type: Date },
    nextCheckin: { type: Date, index: true },
    cleaningStatus: {
      type: String,
      enum: ["awaiting_cleaning", "cleaning_in_progress", "done", "not_required"],
      default: "awaiting_cleaning",
      index: true,
    },
    inspectionStatus: {
      type: String,
      enum: ["awaiting_inspection", "approved", "blocked", "not_required"],
      default: "awaiting_inspection",
      index: true,
    },
    overallStatus: {
      type: String,
      enum: [
        "awaiting_cleaning",
        "cleaning_in_progress",
        "awaiting_inspection",
        "approved",
        "blocked",
      ],
      default: "awaiting_cleaning",
      index: true,
    },
    assignee: assigneeSchema,
    deadlineLabel: { type: String, trim: true, default: "" },
    notes: { type: String, trim: true, default: "" },
    cleaningChecklist: [checklistItemSchema],
    inspectionChecklist: [checklistItemSchema],
    photosBefore: [photoSchema],
    photosAfter: [photoSchema],
  },
  { timestamps: true }
);

cleaningInspectionSchema.index({ host: 1, overallStatus: 1, nextCheckin: 1 });
cleaningInspectionSchema.index({ host: 1, place: 1, nextCheckin: 1 });

export default model("CleaningInspection", cleaningInspectionSchema);
