const express = require('express');
const router = express.Router();
const mercadopago = require('./mercadopagoClient');

// Webhook endpoint to receive Mercado Pago notifications
router.post('/', async (req, res) => {
  try {
    // Mercado Pago can send resource id in different places depending on configuration
    const resource = req.body && req.body.data ? req.body.data : null;
    const id = (resource && resource.id) || req.query.id || req.body.id || (req.body && req.body.transaction_id);

    if (!id) {
      console.warn('Webhook received without id');
      return res.status(400).send('No id');
    }

    const mpRes = await mercadopago.payment.get(id);
    const payment = mpRes && mpRes.body ? mpRes.body : mpRes;

    // Find reservation id from payment metadata or description
    const reservationId = payment && payment.metadata && payment.metadata.reservationId;

    // TODO: update reservation status in your system according to payment.status
    // Example (pseudo):
    // const Reservations = require('./domains/reservations/service');
    // await Reservations.updateStatusByPaymentId(payment.id, payment.status);

    console.log('MercadoPago webhook - payment:', payment.id, 'status:', payment.status, 'reservation:', reservationId);

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('webhook error', err);
    return res.status(500).json({ error: err.message || String(err) });
  }
});

module.exports = router;
