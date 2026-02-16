import React, { useContext, useEffect, useRef } from 'react';
import axios from 'axios';
import { MercadoPagoContext } from './MercadoPagoProvider';

export default function BoletoBrick({ amount, reservationId, onSuccess, onError }) {
  const mp = useContext(MercadoPagoContext);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!mp || !containerRef.current) return;

    const settings = {
      initialization: { amount: Number(amount) },
      callbacks: {
        onReady: () => {},
        onError: (err) => { onError && onError(err && err.message ? err.message : JSON.stringify(err)); },
        onSubmit: async () => {          try {
            const payload = {
              amount,
              reservationId,
              payment_method_id: 'ticket'
            };
            const res = await axios.post('/payments/create', payload);
            onSuccess && onSuccess(res.data);
          } catch (err) { onError && onError(err && err.message ? err.message : JSON.stringify(err)); }
        }
      }
    };

    const bricks = mp.bricks();
    let controller;
    // create the ticket (boleto) brick and render it into the container
    const initialization = Object.assign({}, (settings.initialization || {}), {
			payment_method: 'ticket',
			payment_method_id: 'ticket',
			payment_methods: ['ticket'],
			payment_method_ids: ['ticket'],
			payment_type: 'ticket',
			paymentType: 'ticket',
			payment_method_types: ['ticket'],
			payer: { email: 'no-reply@example.com' }
		});
		bricks.create('payment', 'ticket-brick-container', { ...settings, initialization }).then(b => {
      controller = b;
      if (controller.render) controller.render();
      else if (controller.mount) controller.mount(document.getElementById('ticket-brick-container'));
    });

    return () => { try { controller?.unmount && controller.unmount(); } catch (e) { /* noop */ } };
  }, [mp, amount, reservationId, onSuccess, onError]);

  return <div id="ticket-brick-container" ref={containerRef} />;
}
