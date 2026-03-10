import Stripe from 'stripe';

const { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } = process.env;

if (!STRIPE_SECRET_KEY) {
  console.warn('[stripe] STRIPE_SECRET_KEY is not set. Stripe client will not be initialized.');
  console.error('[stripe] Payments will be disabled until STRIPE_SECRET_KEY is provided.');
}

export const webhookSecret = STRIPE_WEBHOOK_SECRET || '';

export const stripeClient = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' })
  : null;

const getRequestOptions = (opts = {}) => {
  const requestOptions = {};
  if (opts && opts.idempotencyKey) requestOptions.idempotencyKey = opts.idempotencyKey;
  return requestOptions;
};

export const paymentClient = {
  // Generic create: resource should be a top-level stripe resource name (e.g., 'paymentIntents', 'paymentMethods', 'customers')
  async create(resource, data = {}, opts = {}) {
    if (!stripeClient) throw new Error('STRIPE_SECRET_KEY not set. Cannot call Stripe.');
    const requestOptions = getRequestOptions(opts);
    const resourceObj = stripeClient[resource];
    if (resourceObj && typeof resourceObj.create === 'function') {
      return resourceObj.create(data, requestOptions);
    }
    throw new Error(`Stripe resource ${resource} does not support create`);
  },

  // Generic get/retrieve
  async get(resource, id, opts = {}) {
    if (!stripeClient) throw new Error('STRIPE_SECRET_KEY not set. Cannot call Stripe.');
    const requestOptions = getRequestOptions(opts);
    const resourceObj = stripeClient[resource];
    if (resourceObj && typeof resourceObj.retrieve === 'function') {
      return resourceObj.retrieve(id, requestOptions);
    }
    throw new Error(`Stripe resource ${resource} does not support retrieve`);
  },

  // Generic capture (e.g., paymentIntents.capture, charges.capture)
  async capture(resource, id, opts = {}) {
    if (!stripeClient) throw new Error('STRIPE_SECRET_KEY not set. Cannot call Stripe.');
    const requestOptions = getRequestOptions(opts);
    const resourceObj = stripeClient[resource];
    if (resourceObj && typeof resourceObj.capture === 'function') {
      return resourceObj.capture(id, requestOptions);
    }
    throw new Error(`Stripe resource ${resource} does not support capture`);
  },

  // Refunds
  async refund(data = {}, opts = {}) {
    if (!stripeClient) throw new Error('STRIPE_SECRET_KEY not set. Cannot call Stripe.');
    const requestOptions = getRequestOptions(opts);
    return stripeClient.refunds.create(data, requestOptions);
  },

  // Convenience: create a PaymentIntent
  async createPaymentIntent(data = {}, opts = {}) {
    if (!stripeClient) throw new Error('STRIPE_SECRET_KEY not set. Cannot call Stripe.');
    const requestOptions = getRequestOptions(opts);
    return stripeClient.paymentIntents.create(data, requestOptions);
  },

  // Convenience: create a PaymentMethod
  async createPaymentMethod(data = {}, opts = {}) {
    if (!stripeClient) throw new Error('STRIPE_SECRET_KEY not set. Cannot call Stripe.');
    const requestOptions = getRequestOptions(opts);
    return stripeClient.paymentMethods.create(data, requestOptions);
  },

  // Equivalent to mercadopago's preference with back URLs: implement via Checkout Session
  async createPreferenceWithBackUrls(data = {}, backUrls = {}, opts = {}) {
    if (!stripeClient) throw new Error('STRIPE_SECRET_KEY not set. Cannot call Stripe.');
    const requestOptions = getRequestOptions(opts);

    const sessionParams = {
      payment_method_types: data.payment_method_types || ['card'],
      line_items: data.line_items || data.items || [],
      mode: data.mode || 'payment',
      success_url: backUrls.success || backUrls.back_url || '',
      cancel_url: backUrls.cancel || backUrls.failure_url || '',
      ...data.extra,
    };

    return stripeClient.checkout.sessions.create(sessionParams, requestOptions);
  },
};
