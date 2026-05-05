import { model, Schema } from "mongoose";
import Place from "../places/model.js";

const reviewSchema = new Schema({
    booking: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    place: { type: Schema.Types.ObjectId, ref: "Place", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
}, { timestamps: true });

reviewSchema.index({ place: 1, user: 1 });
reviewSchema.index({ booking: 1 }, { unique: true });
reviewSchema.index({ user: 1 });
reviewSchema.index({ place: 1, rating: 1 });

const recalculateAverageRating = async (reviewModel, placeId) => {
    if (!placeId) return;
    const [stats] = await reviewModel.aggregate([
        { $match: { place: placeId } },
        { $group: { _id: "$place", averageRating: { $avg: "$rating" } } }
    ]);
    const averageRating = stats?.averageRating || 0;
    await Place.findByIdAndUpdate(placeId, { averageRating });
};

reviewSchema.post("save", async function () {
    await recalculateAverageRating(this.constructor, this.place);
});

reviewSchema.post("deleteOne", { document: true, query: false }, async function () {
    await recalculateAverageRating(this.constructor, this.place);
});

reviewSchema.post("findOneAndDelete", async function (doc) {
    if (doc) {
        await recalculateAverageRating(this.model, doc.place);
    }
});

export default model("Review", reviewSchema);
