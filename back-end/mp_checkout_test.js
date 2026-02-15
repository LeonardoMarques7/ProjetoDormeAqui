import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

/**
 * Mercado Pago Transparent Checkout automated scenario tester (sandbox)
 *
 * Usage:
 *   node back-end\mp_checkout_test.js
 *
 * Requirements:
 *   - MERCADO_PAGO_ACCESS_TOKEN must be a TEST- token in .env (starts with TEST-)
 *   - Backend server running locally (default http://localhost:3000)
 *
 * Notes:
 *   - The script tries to create a card token via Mercado Pago REST API and then
 *     calls the app's /api/payments/transparent endpoint to run the booking flow.
 *   - Scenario card numbers below are example test cards; replace them with
 *     official Mercado Pago sandbox test cards if you have a list with specific
 *     numbers for each failure scenario. The script is configurable.
 */

const MP_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN;
const BACKEND_BASE = process.env.TEST_BACKEND_BASE || "http://localhost:3000";
const TRANSPARENT_ENDPOINT = `${BACKEND_BASE}/api/payments/transparent`;

if (!MP_ACCESS_TOKEN) {
  console.error("MERCADO_PAGO_ACCESS_TOKEN not set. Add TEST- token to .env");
  process.exit(1);
}

const httpMp = axios.create({
  baseURL: "https://api.mercadopago.com",
  headers: {
    Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

const httpBackend = axios.create({
  baseURL: TRANSPARENT_ENDPOINT,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

/**
 * Helper to map first digit to a simple paymentMethodId guess.
 * For robust mapping, call Mercado Pago payment_methods by bin.
 */
const guessPaymentMethodId = (cardNumber) => {
  if (!cardNumber) return null;
  const first = cardNumber.trim()[0];
  if (first === "4") return "visa";
  if (first === "5") return "master";
  if (first === "6") return "hipercard";
  return "unknown";
};

/**
 * Scenarios definition.
 * Replace card_number values with official Mercado Pago sandbox card numbers
 * for predictable behavior (approved, cc_rejected_..., in_process, etc).
 */
const SCENARIOS = [
  {
    key: "cartao_valido",
    card_number: "4509953566233704",
    security_code: "123",
    expiration_month: "12",
    expiration_year: "2030",
    cardholder_name: "APRO",
    identification_number: "00000000000",
    expected: "approved",
  },
  {
    key: "cvv_incorreto",
    card_number: "4509953566233704",
    security_code: "000",
    expiration_month: "12",
    expiration_year: "2030",
    cardholder_name: "APRO",
    identification_number: "00000000000",
  },
  {
    key: "numero_invalido",
    card_number: "4111111111111112",
    security_code: "123",
    expiration_month: "12",
    expiration_year: "2030",
    cardholder_name: "APRO",
    identification_number: "00000000000",
  },
  {
    key: "cartao_vencido",
    card_number: "4509953566233704",
    security_code: "123",
    expiration_month: "01",
    expiration_year: "2020",
    cardholder_name: "APRO",
    identification_number: "00000000000",
  },
  {
    key: "nome_diferente",
    card_number: "4509953566233704",
    security_code: "123",
    expiration_month: "12",
    expiration_year: "2030",
    cardholder_name: "NOME DIFERENTE",
    identification_number: "00000000000",
  },
  {
    key: "cpf_invalido",
    card_number: "4509953566233704",
    security_code: "123",
    expiration_month: "12",
    expiration_year: "2030",
    cardholder_name: "APRO",
    identification_number: "123",
  },
  {
    key: "limite_insuficiente",
    card_number: "5031755734530604",
    security_code: "123",
    expiration_month: "12",
    expiration_year: "2030",
    cardholder_name: "APRO",
    identification_number: "00000000000",
  },
  {
    key: "cartao_bloqueado",
    card_number: "4509953566233704",
    security_code: "123",
    expiration_month: "12",
    expiration_year: "2030",
    cardholder_name: "APRO",
    identification_number: "00000000000",
  },
  {
    key: "pagamento_em_analise",
    card_number: "4509953566233704",
    security_code: "123",
    expiration_month: "12",
    expiration_year: "2030",
    cardholder_name: "APRO",
    identification_number: "00000000000",
  },
];

/**
 * Standard booking payload fields used by the backend.
 * The script will vary token/payment details only.
 * Use a valid accommodationId from your seeded DB or set via env var BOOKING_ACCOMMODATION_ID.
 */
const ACCOMMODATION_ID = process.env.BOOKING_ACCOMMODATION_ID || "694e0cf2c29f9e7c9094f6ce";
const TODAY = new Date();
const CHECKIN = new Date(TODAY.getTime() + 1000 * 60 * 60 * 24 * 7).toISOString();
const CHECKOUT = new Date(TODAY.getTime() + 1000 * 60 * 60 * 24 * 8).toISOString();

async function createCardToken(scenario) {
  const body = {
    card_number: scenario.card_number,
    expiration_month: Number(scenario.expiration_month),
    expiration_year: Number(scenario.expiration_year),
    security_code: scenario.security_code,
    cardholder: {
      name: scenario.cardholder_name,
      identification: {
        type: "CPF",
        number: scenario.identification_number,
      },
    },
  };

  try {
    const res = await httpMp.post("/v1/card_tokens", body);
    return { success: true, token: res.data.id, raw: res.data };
  } catch (err) {
    return { success: false, error: err.response?.data || err.message };
  }
}

async function runScenario(scenario) {
  const log = {
    scenario: scenario.key,
    payment_status: null,
    status_detail: null,
    gateway_response: null,
    reservation_created: false,
    final_result: null,
  };

  // 1) Create card token in Mercado Pago sandbox
  const tokenResult = await createCardToken(scenario);
  if (!tokenResult.success) {
    log.gateway_response = tokenResult.error;
    log.payment_status = "token_error";
    log.final_result = "failure";
    console.log(JSON.stringify(log, null, 2));
    return log;
  }

  const token = tokenResult.token;

  // guess payment method id simple mapping
  const cleanNumber = scenario.card_number.replace(/\s+/g, "");
  const paymentMethodId = guessPaymentMethodId(cleanNumber);

  // Prepare payload for /payments/transparent
  const payload = {
    accommodationId: ACCOMMODATION_ID,
    checkIn: CHECKIN,
    checkOut: CHECKOUT,
    guests: 1,
    token,
    email: `test+${scenario.key}@example.com`,
    paymentMethodId,
    issuerId: null,
    installments: 1,
    identificationType: "CPF",
    identificationNumber: scenario.identification_number,
  };

  // 2) Call backend endpoint to process transparent payment (runs preauth/booking flow)
  let backendResp;
  try {
    const resp = await httpBackend.post("", payload);
    backendResp = resp.data;
  } catch (err) {
    backendResp = { error: err.response?.data || err.message, httpStatus: err.response?.status };
  }

  // 3) Extract gateway info if provided by backend
  log.gateway_response = backendResp.payment || backendResp.gateway_response || backendResp;
  // backend returns status field or status inside payment
  const status = (backendResp.status || backendResp.payment?.status || backendResp.payment_status || "")
    .toString?.()
    .toLowerCase?.() || "";

  log.payment_status = status || null;
  log.status_detail = backendResp.payment?.status_detail || backendResp.status_detail || null;

  // 4) Determine reservation_created and final_result per criteria
  if (status === "approved") {
    log.reservation_created = !!backendResp.booking;
    log.final_result = "success";
  } else if (status === "in_process" || status === "pending") {
    log.reservation_created = false;
    log.final_result = "pending";
  } else if (status === "authorized") {
    log.reservation_created = !!backendResp.booking;
    log.final_result = backendResp.booking ? "success" : "pending";
  } else {
    log.reservation_created = false;
    log.final_result = "failure";
  }

  console.log(JSON.stringify(log, null, 2));
  return log;
}

async function main() {
  console.log("Starting Mercado Pago Transparent Checkout scenario tests (sandbox)");
  console.log("Backend endpoint:", TRANSPARENT_ENDPOINT);
  console.log("Scenarios to run:", SCENARIOS.map((s) => s.key).join(", "));
  const results = [];
  for (const sc of SCENARIOS) {
    console.log(`\n--- Running scenario: ${sc.key}`);
    try {
      const r = await runScenario(sc);
      results.push(r);
    } catch (err) {
      console.error(`Unexpected error in scenario ${sc.key}:`, err);
      results.push({
        scenario: sc.key,
        error: String(err),
      });
    }
    // small delay to avoid rate limits
    await new Promise((res) => setTimeout(res, 1000));
  }

  console.log("\n=== SUMMARY ===");
  results.forEach((r) => {
    console.log(`SCENARIO: ${r.scenario}`);
    console.log(`  status: ${r.payment_status}`);
    console.log(`  status_detail: ${r.status_detail}`);
    console.log(`  reservation_created: ${r.reservation_created}`);
    console.log(`  final_result: ${r.final_result}`);
    console.log("");
  });

  // Map status_detail -> result table
  const mapping = {};
  results.forEach((r) => {
    const key = r.status_detail || r.payment_status || "unknown";
    mapping[key] = mapping[key] || { occurrences: 0, examples: [] };
    mapping[key].occurrences += 1;
    mapping[key].examples.push(r.scenario);
  });

  console.log("=== status_detail -> scenarios mapping ===");
  console.log(JSON.stringify(mapping, null, 2));
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});