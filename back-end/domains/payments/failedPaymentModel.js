import mongoose, { model, Schema } from "mongoose";

const failedPaymentSchema = new Schema({
  paymentId: { type: String, required: true, index: true },
  status: { type: String },
  status_detail: { type: String },
  reason: { type: String },
  metadata: { type: Schema.Types.Mixed },
  paymentInfo: { type: Schema.Types.Mixed },
  receivedAt: { type: Date, default: () => new Date() }
}, { timestamps: true });

export default model("FailedPayment", failedPaymentSchema);
