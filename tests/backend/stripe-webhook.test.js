import { jest } from "@jest/globals";

const mockConstructEvent = jest.fn();
const mockFindOne = jest.fn();
const mockCreateFromPayment = jest.fn();

jest.unstable_mockModule("../../back-end/config/stripe.js", () => ({
  stripeClient: {
    webhooks: {
      constructEvent: mockConstructEvent,
    },
  },
  webhookSecret: "whsec_test",
}));

jest.unstable_mockModule("../../back-end/domains/bookings/model.js", () => ({
  default: {
    findOne: mockFindOne,
    createFromPayment: mockCreateFromPayment,
  },
}));

const createResponse = () => ({
  statusCode: null,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.body = payload;
    return this;
  },
});

describe("Stripe webhook integration", () => {
  let router;
  let routeHandler;

  beforeAll(async () => {
    router = (await import("../../back-end/webhooks/stripe.js")).default;
    const layer = router.stack.find((item) => item.route?.path === "/" && item.route?.methods?.post);
    routeHandler = layer.route.stack.at(-1).handle;
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("rejects invalid signatures", async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error("bad signature");
    });

    const req = {
      headers: { "stripe-signature": "invalid" },
      rawBody: Buffer.from("{}"),
      body: Buffer.from("{}"),
    };
    const res = createResponse();

    await routeHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/signature/i);
  });

  test("creates a booking once for a paid checkout session", async () => {
    mockConstructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          object: "checkout.session",
          payment_status: "paid",
          payment_intent: "pi_test_123",
          metadata: {
            userId: "64f000000000000000000002",
            accommodationId: "64f000000000000000000001",
            checkIn: "2026-05-01T00:00:00.000Z",
            checkOut: "2026-05-03T00:00:00.000Z",
            guests: "2",
            nights: "2",
            totalPrice: "300",
            pricePerNight: "150",
          },
        },
      },
    });
    mockFindOne.mockResolvedValue(null);
    mockCreateFromPayment.mockResolvedValue({ _id: "booking_1" });

    const req = {
      headers: { "stripe-signature": "valid" },
      rawBody: Buffer.from("{}"),
      body: Buffer.from("{}"),
    };
    const res = createResponse();

    await routeHandler(req, res);

    expect(mockCreateFromPayment).toHaveBeenCalledWith(expect.objectContaining({
      mercadopagoPaymentId: "pi_test_123",
      paymentStatus: "approved",
      priceTotal: 300,
    }));
    expect(res.statusCode).toBe(200);
    expect(res.body.bookingId).toBe("booking_1");
  });

  test("does not create duplicate bookings for the same payment id", async () => {
    mockConstructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          object: "checkout.session",
          payment_status: "paid",
          payment_intent: "pi_existing",
          metadata: {
            userId: "64f000000000000000000002",
            accommodationId: "64f000000000000000000001",
            checkIn: "2026-05-01T00:00:00.000Z",
            checkOut: "2026-05-02T00:00:00.000Z",
            totalPrice: "100",
          },
        },
      },
    });
    mockFindOne.mockResolvedValue({ _id: "existing_booking" });

    const res = createResponse();
    await routeHandler({ headers: { "stripe-signature": "valid" }, rawBody: Buffer.from("{}") }, res);

    expect(mockCreateFromPayment).not.toHaveBeenCalled();
    expect(res.body.message).toBe("booking-already-exists");
  });
});

