import Booking from "../domains/bookings/model.js";
import * as transitionService from "../domains/bookings/transitionService.js";

/**
 * Job para transições automáticas de booking baseadas em datas
 * - confirmed → in_progress (quando checkin é atingido)
 * - in_progress → evaluation (quando checkout é atingido)
 */
export async function processAutomaticBookingTransitions() {
  try {
    const now = new Date();

    // 1. Transição: confirmed → in_progress
    // Bookings que estão em status 'confirmed' e checkin <= agora
    const toInProgress = await Booking.find({
      status: "confirmed",
      checkin: { $lte: now },
    });

    for (const booking of toInProgress) {
      try {
        await transitionService.transitionBookingStatus(
          booking._id,
          "in_progress",
          {
            reason: "Transição automática: data de check-in atingida",
          }
        );
        console.log(`✅ Booking ${booking._id} transitou para 'in_progress'`);
      } catch (error) {
        console.error(
          `❌ Erro ao transicionar booking ${booking._id}:`,
          error.message
        );
      }
    }

    // 2. Transição: in_progress → evaluation
    // Bookings que estão em status 'in_progress' e checkout <= agora
    const toEvaluation = await Booking.find({
      status: "in_progress",
      checkout: { $lte: now },
    });

    for (const booking of toEvaluation) {
      try {
        await transitionService.transitionBookingStatus(
          booking._id,
          "evaluation",
          {
            reason: "Transição automática: data de checkout atingida",
          }
        );
        console.log(`✅ Booking ${booking._id} transitou para 'evaluation'`);
      } catch (error) {
        console.error(
          `❌ Erro ao transicionar booking ${booking._id}:`,
          error.message
        );
      }
    }

    console.log(
      `✅ Job de transições automáticas de booking completado em ${new Date().toISOString()}`
    );
  } catch (error) {
    console.error("❌ Erro no job de transições automáticas:", error);
  }
}

export default processAutomaticBookingTransitions;
