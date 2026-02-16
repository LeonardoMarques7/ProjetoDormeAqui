const express = require('express');
const router = express.Router();
const mercadopago = require('./mercadopagoClient');

router.post('/create', async (req, res) => {
  try {
    const { token, payment_method_id, issuer_id, installments, reservationId, amount, payer } = req.body;

    const body = {
      transaction_amount: Number(amount) || 0,
      token: token || undefined,
      description: `Reserva ${reservationId || 'unknown'}`,
      installments: Number(installments) || 1,
      payment_method_id: payment_method_id || undefined,
      issuer_id: issuer_id || undefined,
      payer: { email: (payer && payer.email) || req.body.email || 'no-reply@example.com' },
      metadata: { reservationId }
    };

    const response = await mercadopago.payment.create(body);
    const payment = response && response.body ? response.body : response;

    // Persist payment.id to reservation - adapt to your reservation service
    // Example (pseudo):
    // const Reservations = require('./domains/reservations/service');
    // await Reservations.attachPayment(reservationId, payment.id);

    return res.json({ success: true, payment });
  } catch (err) {
    console.error('createPayment error', err);
    return res.status(500).json({ success: false, message: err.message || String(err) });
  }
});

module.exports = router;
