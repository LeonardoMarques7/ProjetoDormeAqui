import { model, Schema } from "mongoose"

const bookingSchema = new Schema({
    place: { type: Schema.Types.ObjectId, ref: "Place", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    pricePerNight: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    guests: { type: Number, required: true },
    nights: { type: Number, required: true },
    paymentStatus: { 
        type: String, 
        enum: ["pending", "approved", "rejected"], 
        default: "pending" 
    },
    mercadopagoPaymentId: { type: String, index: true },
}, { timestamps: true });

export default model("Booking", bookingSchema);
