import  { model, Schema } from "mongoose"

const placeSchema = new Schema({
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, default: "" },
    title: { type: String, trim: true, maxlength: 160 },
    city: { type: String, trim: true, maxlength: 120, index: true },
    photos: [String],
    description: String,
    extras: String,
    perks: [String],
    price: { type: Number, min: 0 },
    checkin: String,
    checkout: String,
    guests: { type: Number, min: 1 },
    rooms: { type: Number, min: 0 },
    beds: { type: Number, min: 0 },
    bathrooms: { type: Number, min: 0 },
    averageRating: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
});

export default model("Place", placeSchema);
