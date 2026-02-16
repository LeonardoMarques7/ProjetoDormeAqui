import React, { useContext, useEffect, useRef } from 'react';
import axios from 'axios';
import { MercadoPagoContext } from './MercadoPagoProvider';

export default function PixBrick({ amount, reservationId, onSuccess, onError }) {
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
              payment_method_id: 'pix'
            };
            const res = await axios.post('/payments/create', payload);
            onSuccess && onSuccess(res.data);
          } catch (err) { onError && onError(err && err.message ? err.message : JSON.stringify(err)); }
        }
      }
    };

    const bricks = mp.bricks();
    let controller;
    // create the pix brick and render it into the container
    const initialization = Object.assign({}, (settings.initialization || {}), {
			payment_method: 'pix',
			payment_method_id: 'pix',
			payment_methods: ['pix'],
			payment_method_ids: ['pix'],
			payment_type: 'pix',
			paymentType: 'pix',
			payment_method_types: ['pix'],
			payer: { email: 'no-reply@example.com' }
		});
		bricks.create('payment', 'pix-brick-container', { ...settings, initialization }).then(b => {
      controller = b;
      if (controller.render) controller.render();
      else if (controller.mount) controller.mount(document.getElementById('pix-brick-container'));
    });

    return () => { try { controller?.unmount && controller.unmount(); } catch (e) { /* noop */ } };
  }, [mp, amount, reservationId, onSuccess, onError]);

  return <div id="pix-brick-container" ref={containerRef} />;
}
