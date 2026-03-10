Stripe integration for DormeAqui — Frontend guide (PT-BR)

Overview
--------
This guide shows how to integrate the frontend with the backend transparent payment flow using Stripe Elements.

Install (frontend project root)
-------------------------------
# using npm
npm install @stripe/stripe-js @stripe/react-stripe-js

# or using yarn
yarn add @stripe/stripe-js @stripe/react-stripe-js

Environment
-----------
Add the following to front-end/.env (Vite expects VITE_ prefix):
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...   # from Stripe Dashboard (publishable)
VITE_API_URL=http://localhost:5173/api      # or your backend public URL

Usage (example React page)
--------------------------
1. Import the component where you want to use it:

import StripeTransparentCheckout from './components/StripeTransparentCheckout';

2. Provide checkoutData and onResult callback:

const checkoutData = {
  accommodationId: 'a',
  checkIn: '2026-03-10',
  checkOut: '2026-03-15',
  guests: 1,
  payerEmail: 'user@example.com',
  payerName: 'Nome Usuario',
  // any other fields required by backend (phone, identification, etc.)
};

function handleResult(result) {
  if (result.success) {
    // show success, redirect to bookings page, etc.
  } else {
    // show error
  }
}

<StripeTransparentCheckout checkoutData={checkoutData} onResult={handleResult} />

Notes on flows
--------------
- Preferred flow (recommended): use Stripe Elements to create a PaymentMethod on the client and send the pm_id (pm_...) to the backend. Backend will attach and attempt to confirm/capture.
- Alternate flow (client confirmation): backend can create a PaymentIntent WITHOUT payment_method and return client_secret; the frontend calls stripe.confirmCardPayment(client_secret) to finish the flow. Our backend supports both: if you send paymentMethodId (pm_...) it will attempt server-side confirmation; if you don't send it, the backend returns clientSecret and expects frontend confirmation.

Security
--------
- Never put STRIPE_SECRET_KEY on the frontend. Only publishable keys (pk_...) go to front-end env.
- Use HTTPS in production and verify CORS settings on the backend.

Testing locally
----------------
- Run stripe CLI to forward webhooks during local testing:
  stripe listen --forward-to localhost:3000/webhooks/stripe
- Create a test payment in the frontend with test card numbers (e.g., 4242 4242 4242 4242) to simulate success.
- Use stripe trigger to simulate webhook events if needed.

Troubleshooting
---------------
- If backend returns "No such PaymentMethod: 'visa'" it means the form sent a brand string instead of a pm_ ID. Ensure the frontend creates a PaymentMethod with stripe.createPaymentMethod or confirmCardPayment.

