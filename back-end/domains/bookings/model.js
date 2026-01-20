import  { model, Schema } from "mongoose"

const bookingSchema = new Schema({
    place: { type: Schema.Types.ObjectId, ref: "Place" },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    price: Number,
    priceTotal: Number,
    checkin: Date,
    checkout: Date,
    guests: Number,
    nights: Number,
});

export default model("Booking", bookingSchema);