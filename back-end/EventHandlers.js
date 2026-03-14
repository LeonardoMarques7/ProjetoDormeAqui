import { createNotification } from "../NotificationService.js";

/**
 * EXEMPLO: Integração de eventos de notificação
 * Estes são os locais onde notificações devem ser criadas
 */

/**
 * Quando uma reserva é criada
 * Deve ser chamado em: routes/bookings.js ou no handler de criação de reserva
 */
export async function onReservationCreated(booking, guestUser, hostUser) {
  try {
    // Notificação para o hóspede
    if (guestUser) {
      await createNotification(
        guestUser._id,
        "reservation_created",
        booking._id.toString(),
        {
          title: "🎉 Sua reserva foi confirmada!",
          message: `Sua estadia em "${booking.place.name}" foi confirmada para ${new Date(booking.checkin).toLocaleDateString("pt-BR")} até ${new Date(booking.checkout).toLocaleDateString("pt-BR")}.`,
          entityType: "reservation",
          link: `/bookings/${booking._id}`,
          metadata: {
            bookingId: booking._id.toString(),
            placeId: booking.place._id.toString(),
            checkIn: booking.checkin,
            checkOut: booking.checkout,
          },
        }
      );
    }

    // Notificação para o anfitrião
    if (hostUser) {
      await createNotification(
        hostUser._id,
        "reservation_created",
        booking._id.toString(),
        {
          title: "🏠 Sua acomodação recebeu uma nova reserva!",
          message: `"${booking.place.name}" tem uma nova reserva de ${guestUser?.firstName || "um hóspede"} para ${new Date(booking.checkin).toLocaleDateString("pt-BR")}.`,
          entityType: "reservation",
          link: `/host/bookings/${booking._id}`,
          metadata: {
            bookingId: booking._id.toString(),
            placeId: booking.place._id.toString(),
            guestId: guestUser._id.toString(),
            guestName: guestUser.firstName,
          },
        }
      );
    }
  } catch (error) {
    console.error("[Events] Erro ao criar notificações de reserva:", error);
  }
}

/**
 * Quando uma reserva é cancelada
 */
export async function onReservationCancelled(booking, reason, guestUser, hostUser) {
  try {
    if (guestUser) {
      await createNotification(
        guestUser._id,
        "reservation_cancelled",
        booking._id.toString(),
        {
          title: "❌ Sua reserva foi cancelada",
          message: `Sua reserva em "${booking.place.name}" foi cancelada. Motivo: ${reason || "Cancelamento do usuário"}.`,
          entityType: "reservation",
          link: `/bookings`,
          metadata: {
            bookingId: booking._id.toString(),
            reason,
          },
        }
      );
    }

    if (hostUser) {
      await createNotification(
        hostUser._id,
        "reservation_cancelled",
        booking._id.toString(),
        {
          title: "📋 Uma reserva foi cancelada",
          message: `A reserva de ${guestUser?.firstName || "um hóspede"} em "${booking.place.name}" foi cancelada.`,
          entityType: "reservation",
          link: `/host/bookings`,
          metadata: {
            bookingId: booking._id.toString(),
            guestId: guestUser?._id.toString(),
          },
        }
      );
    }
  } catch (error) {
    console.error("[Events] Erro ao criar notificações de cancelamento:", error);
  }
}

/**
 * Quando um pagamento é confirmado
 */
export async function onPaymentSuccess(booking, paymentDetails, userId) {
  try {
    await createNotification(
      userId,
      "payment_success",
      booking._id.toString(),
      {
        title: "💳 Pagamento aprovado!",
        message: `Seu pagamento de R$ ${(paymentDetails.amount / 100).toFixed(2)} foi processado com sucesso.`,
        entityType: "payment",
        link: `/bookings/${booking._id}`,
        metadata: {
          bookingId: booking._id.toString(),
          amount: paymentDetails.amount,
          paymentId: paymentDetails.paymentId,
        },
      }
    );
  } catch (error) {
    console.error("[Events] Erro ao criar notificação de pagamento:", error);
  }
}

/**
 * Quando um pagamento falha
 */
export async function onPaymentFailed(booking, paymentDetails, userId) {
  try {
    await createNotification(
      userId,
      "payment_failed",
      booking._id.toString(),
      {
        title: "❌ Pagamento não aprovado",
        message: `O pagamento de R$ ${(paymentDetails.amount / 100).toFixed(2)} não foi aprovado. ${paymentDetails.reason || "Tente novamente com outro método."}`,
        entityType: "payment",
        link: `/bookings/${booking._id}`,
        metadata: {
          bookingId: booking._id.toString(),
          amount: paymentDetails.amount,
          reason: paymentDetails.reason,
        },
      }
    );
  } catch (error) {
    console.error("[Events] Erro ao criar notificação de erro de pagamento:", error);
  }
}

/**
 * Quando uma acomodação é criada
 */
export async function onPlaceCreated(place, hostUser) {
  try {
    await createNotification(
      hostUser._id,
      "place_created",
      place._id.toString(),
      {
        title: "🏠 Sua acomodação foi publicada!",
        message: `"${place.name}" está ao vivo e pronta para receber reservas.`,
        entityType: "place",
        link: `/host/places/${place._id}`,
        metadata: {
          placeId: place._id.toString(),
          placeName: place.name,
        },
      }
    );
  } catch (error) {
    console.error("[Events] Erro ao criar notificação de lugar criado:", error);
  }
}

/**
 * Quando um usuário faz login
 */
export async function onUserLogin(user) {
  try {
    await createNotification(
      user._id,
      "user_login",
      user._id.toString(),
      {
        title: `👋 Bem-vindo de volta, ${user.firstName}!`,
        message: `Você entrou em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}.`,
        entityType: "user",
        link: "/",
        metadata: {
          userId: user._id.toString(),
          loginTime: new Date(),
        },
      }
    );
  } catch (error) {
    console.error("[Events] Erro ao criar notificação de login:", error);
  }
}

/**
 * Quando um usuário faz logout
 */
export async function onUserLogout(user) {
  try {
    await createNotification(
      user._id,
      "user_logout",
      user._id.toString(),
      {
        title: "👋 Até logo!",
        message: "Esperamos que tenha tido uma ótima experiência. Volte em breve!",
        entityType: "user",
        link: "/",
        metadata: {
          userId: user._id.toString(),
          logoutTime: new Date(),
        },
      }
    );
  } catch (error) {
    console.error("[Events] Erro ao criar notificação de logout:", error);
  }
}

/**
 * Quando uma avaliação é recebida
 */
export async function onReviewReceived(review, recipientUser, authorUser) {
  try {
    await createNotification(
      recipientUser._id,
      "review_received",
      review._id.toString(),
      {
        title: `⭐ ${authorUser.firstName} deixou uma avaliação!`,
        message: `${authorUser.firstName} classificou sua acomodação com ${review.rating} estrelas: "${review.comment.substring(0, 50)}..."`,
        entityType: "review",
        link: `/reviews/${review._id}`,
        metadata: {
          reviewId: review._id.toString(),
          rating: review.rating,
          authorId: authorUser._id.toString(),
        },
      }
    );
  } catch (error) {
    console.error("[Events] Erro ao criar notificação de avaliação:", error);
  }
}

/**
 * Lembrete de reserva próxima (5 dias)
 * Deve ser chamado por um cron job
 */
export async function onReservationReminder(booking, daysRemaining, guestUser) {
  try {
    if (daysRemaining === 5 || daysRemaining === 1) {
      const eventType =
        daysRemaining === 5 ? "reservation_reminder_5days" : "reservation_reminder_1day";

      await createNotification(
        guestUser._id,
        eventType,
        booking._id.toString(),
        {
          title: "📅 Sua viagem está chegando!",
          message: `Faltam ${daysRemaining} ${daysRemaining === 1 ? "dia" : "dias"} para sua reserva em "${booking.place.name}". Prepare-se!`,
          entityType: "reservation",
          link: `/bookings/${booking._id}`,
          metadata: {
            bookingId: booking._id.toString(),
            daysRemaining,
            checkIn: booking.checkin,
          },
        }
      );
    }
  } catch (error) {
    console.error("[Events] Erro ao criar notificação de lembrete:", error);
  }
}
