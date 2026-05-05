import { model, Schema } from "mongoose";

const financialEntrySchema = new Schema(
  {
    host: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    place: { type: Schema.Types.ObjectId, ref: "Place", required: true, index: true },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", default: null, index: true },
    paymentId: { type: String, trim: true, default: "", index: true },
    recurrenceId: { type: String, trim: true, default: "", index: true },
    source: { type: String, trim: true, default: "" },
    provider: { type: String, trim: true, default: "" },
    competenceMonth: {
      type: String,
      required: true,
      index: true,
      match: /^\d{4}-(0[1-9]|1[0-2])$/,
    },
    competenceDate: { type: Date, required: true, index: true },
    entryDate: { type: Date, required: true, default: () => new Date(), index: true },
    entryType: {
      type: String,
      required: true,
      enum: [
        "recurring_expense",
        "operational_expense",
        "refund",
        "payment_fee",
        "manual_revenue",
      ],
      index: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: [
        "draft",
        "pending",
        "scheduled",
        "confirmed",
        "paid",
        "processing",
        "refunded",
        "failed",
        "canceled",
        "void",
      ],
      default: "confirmed",
      index: true,
    },
    taxDeductible: { type: Boolean, default: true },
    fiscalCategory: { type: String, trim: true, default: "" },
    accountingCategory: { type: String, trim: true, default: "" },
    notes: { type: String, trim: true, default: "" },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

financialEntrySchema.index({ host: 1, place: 1, competenceMonth: 1, entryType: 1 });
financialEntrySchema.index({ host: 1, competenceMonth: 1, status: 1 });

export default model("FinancialEntry", financialEntrySchema);
