import React, { useContext, useEffect } from "react";
import axios from "axios";
import { MercadoPagoContext } from "./MercadoPagoProvider";

export default function PaymentBrick({
  amount,
  reservationId,
  onSuccess,
  onError,
}) {
  const mp = useContext(MercadoPagoContext);

  useEffect(() => {
    if (!mp) return;

    const settings = {
      initialization: {
        amount: Number(amount),
      },

      callbacks: {
        onReady: () => {},

        onError: (err) => {
          console.error("PaymentBrick error", err);
          onError && onError(err && err.message ? err.message : JSON.stringify(err));
        },

        onSubmit: async (formData) => {
          try {
            const payload = {
              token: formData.token,
              payment_method_id: formData.payment_method_id,
              issuer_id: formData.issuer_id,
              installments: formData.installments,
              amount,
              reservationId,
              payer: { email: formData.payer?.email },
            };

            const res = await axios.post("/payments/create", payload);
            onSuccess && onSuccess(res.data);
          } catch (err) {
            onError && onError(err && err.message ? err.message : JSON.stringify(err));
          }
        },
      },
    };

    const bricksBuilder = mp.bricks();
    let controller;

    (async () => {
      try {
        let productId = null;
        // If parent passed bookingData via global window (compatibility with Place), use it to create a preference
        const bookingData = typeof window !== 'undefined' ? window.__TRANSPARENT_BOOKING_DATA__ : null;
        if (bookingData && bookingData.accommodationId) {
          const createRes = await axios.post('/payments/create', bookingData);
          productId = createRes?.data?.data?.preferenceId || createRes?.data?.preferenceId || createRes?.data?.id;
        }

        const initialization = Object.assign({}, (settings.initialization || {}), {
			// include many aliases to satisfy server expectations
			payment_method: 'card',
			payment_method_id: 'card',
			payment_methods: ['card'],
			payment_method_ids: ['card'],
			payment_type: 'credit_card',
			paymentType: 'credit_card',
			payment_method_types: ['credit_card'],
			payer: { email: (bookingData && bookingData.email) || 'no-reply@example.com' }
		});
        if (productId) initialization.product_id = productId;
        // Hint payment type to avoid server-side 'No payment type was selected'
        initialization.payment_method = 'card';
        initialization.payment_type = 'credit_card';

        // Create the bricks payment controller
        bricksBuilder
          .create('payment', 'payment-brick-container', { ...settings, initialization })
          .then((brick) => {
            controller = brick;
            if (controller.render) controller.render();
            else if (controller.mount) controller.mount(document.getElementById('payment-brick-container'));
          });
      } catch (e) {
        console.error('PaymentBrick init error', e);
        onError && onError(e && e.message ? e.message : JSON.stringify(e));
      }
    })();

    return () => controller?.unmount && controller.unmount();
  }, [mp, amount, reservationId, onSuccess, onError]);

  return <div id="payment-brick-container" />;
}
