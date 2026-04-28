import mongoose, { model, Schema } from "mongoose"

const bookingSchema = new Schema({
    place: { type: Schema.Types.ObjectId, ref: "Place", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    pricePerNight: { type: Number, required: true, min: 0 },
    priceTotal: { type: Number, required: true, min: 0 },
    checkin: { type: Date, required: true },
    checkout: { type: Date, required: true },
    guests: { type: Number, required: true, min: 1 },
    nights: { type: Number, required: true, min: 1 },
    paymentStatus: { 
        type: String, 
        enum: ["pending", "approved", "rejected", "canceled"], 
        default: "pending" 
    },
    mercadopagoPaymentId: { type: String },
    status: {
        type: String,
        enum: ["pending", "confirmed", "in_progress", "evaluation", "review", "completed", "canceled"],
        default: "pending",
        index: true
    },
    statusHistory: [{
        status: String,
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: Schema.Types.ObjectId, ref: "User" },
        reason: String
    }],
    lastStatusChange: { type: Date, default: Date.now },
    reviewRequestedAt: Date,
    reviewRequestedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewReason: String,
}, { timestamps: true });

bookingSchema.index(
    { mercadopagoPaymentId: 1 },
    { unique: true, partialFilterExpression: { mercadopagoPaymentId: { $type: "string" } } }
);
bookingSchema.index({ place: 1, checkin: 1, checkout: 1, status: 1 });

bookingSchema.statics.createFromPayment = async function ({
    place,
    user,
    pricePerNight,
    priceTotal,
    checkin,
    checkout,
    guests,
    nights,
    mercadopagoPaymentId,
    paymentStatus
}) {
    const Booking = this;
    const session = await mongoose.startSession();
    let committed = false;

    try {
        session.startTransaction();

        // 🔎 Verifica usuário
        const User = (await import("../users/model.js")).default;
        const userDoc = await User.findById(user).session(session);

        if (!userDoc) {
            const err = new Error("Usuário não encontrado.");
            err.statusCode = 404;
            throw err;
        }

        if (userDoc.deactivated) {
            const err = new Error("Conta desativada. Não é possível fazer novas reservas.");
            err.statusCode = 403;
            throw err;
        }

        // 🔎 Verifica lugar
        const Place = (await import("../places/model.js")).default;
        const placeDoc = await Place.findById(place).session(session);

        if (!placeDoc) {
            const err = new Error("Lugar não encontrado.");
            err.statusCode = 404;
            throw err;
        }

        const checkinDate = new Date(checkin);
        const checkoutDate = new Date(checkout);

        if (isNaN(checkinDate.getTime()) || isNaN(checkoutDate.getTime())) {
            const err = new Error("Formato de data inválido para checkin/checkout.");
            err.statusCode = 400;
            throw err;
        }

        // 🔎 Conflito de datas
        const conflictingBookings = await Booking.find({
            place,
            $or: [
                { checkin: { $lt: checkoutDate }, checkout: { $gt: checkinDate } }
            ]
        }).session(session);

        if (conflictingBookings.length > 0) {
            const err = new Error("Datas conflitantes com reservas existentes. As datas selecionadas não estão disponíveis.");
            err.statusCode = 409;
            throw err;
        }

        // 🔎 Intervalo mínimo
        const lastBooking = await Booking.findOne({ place }).sort({ checkout: -1 }).session(session);

        if (lastBooking?.checkout) {
            const lastCheckoutDate = new Date(lastBooking.checkout);
            if (!isNaN(lastCheckoutDate.getTime())) {
                const hoursDiff = (checkinDate - lastCheckoutDate) / (1000 * 60 * 60);
                const minIntervalHours = 3;

                if (hoursDiff < minIntervalHours) {
                    const err = new Error(`Intervalo mínimo de ${minIntervalHours} horas entre check-out e check-in não respeitado.`);
                    err.statusCode = 400;
                    throw err;
                }
            }
        }

        // 🧾 Criação
        const [booking] = await Booking.create([{
            place,
            user,
            pricePerNight,
            priceTotal,
            checkin: checkinDate,
            checkout: checkoutDate,
            guests,
            nights,
            paymentStatus,
            mercadopagoPaymentId
        }], { session });

        await session.commitTransaction();
        committed = true;

        return booking;

    } catch (error) {
        if (!committed) {
            await session.abortTransaction();
        }
        throw error;
    } finally {
        session.endSession();
    }
}; 

export default model("Booking", bookingSchema);
