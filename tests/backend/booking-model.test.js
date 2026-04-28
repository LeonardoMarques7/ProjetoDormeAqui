import Booking from "../../back-end/domains/bookings/model.js";

describe("Booking model", () => {
  test("defines a unique partial index for provider payment idempotency", () => {
    const indexes = Booking.schema.indexes();

    expect(indexes).toContainEqual([
      { mercadopagoPaymentId: 1 },
      {
        unique: true,
        partialFilterExpression: { mercadopagoPaymentId: { $type: "string" } },
      },
    ]);
  });

  test("rejects invalid financial and stay values", async () => {
    const booking = new Booking({
      place: "64f000000000000000000001",
      user: "64f000000000000000000002",
      pricePerNight: -10,
      priceTotal: -100,
      checkin: new Date("2026-05-01"),
      checkout: new Date("2026-05-02"),
      guests: 0,
      nights: 0,
    });

    await expect(booking.validate()).rejects.toMatchObject({
      errors: expect.objectContaining({
        pricePerNight: expect.any(Object),
        priceTotal: expect.any(Object),
        guests: expect.any(Object),
        nights: expect.any(Object),
      }),
    });
  });
});

