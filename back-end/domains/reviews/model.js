import { model, Schema } from "mongoose";

const reviewSchema = new Schema({
    booking: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    place: { type: Schema.Types.ObjectId, ref: "Place", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
}, { timestamps: true });

reviewSchema.index({ place: 1 });
reviewSchema.index({ place: 1, user: 1 });
reviewSchema.index({ booking: 1 }, { unique: true });
reviewSchema.index({ user: 1 });
reviewSchema.index({ place: 1, rating: 1 });

export default model("Review", reviewSchema);
