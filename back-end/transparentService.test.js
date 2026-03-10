import { jest } from '@jest/globals';

const mockPaymentCreate = jest.fn();
const mockPlaceFindById = jest.fn();
const mockBookingFind = jest.fn();

// declare mocks before importing the module under test
jest.unstable_mockModule('./config/mercadopago.js', ()=>({ paymentClient:{ create: mockPaymentCreate } }));
jest.unstable_mockModule('./domains/places/model.js', ()=>({ default: { findById: mockPlaceFindById } }));
jest.unstable_mockModule('./domains/bookings/model.js', ()=>({ default: { find: mockBookingFind } }));
// stripe mocks
const mockStripeCreatePaymentIntent = jest.fn();
jest.unstable_mockModule('./config/stripe.js', ()=>({ paymentClient: { createPaymentIntent: mockStripeCreatePaymentIntent } }));

let Place;
let Booking;
let paymentClient;
let service;

beforeAll(async ()=>{
  Place = (await import('./domains/places/model.js')).default;
  Booking = (await import('./domains/bookings/model.js')).default;
  ({ paymentClient } = await import('./config/mercadopago.js'));
  service = await import('./domains/payments/transparentService.js');
});




describe('transparentService', ()=> {
  beforeEach(()=>{ jest.resetAllMocks(); process.env.MERCADO_PAGO_WEBHOOK_URL='http://example.com/webhook'; process.env.USE_STRIPE = 'true'; });

  test('missing fields', async ()=> {
    const res = await service.processTransparentPayment({}, {});
    expect(res.success).toBe(false);
    expect(res.message).toMatch(/Dados incompletos/);
  });

  test('accommodation not found', async ()=> {
    Place.findById.mockResolvedValue(null);
    const res = await service.processTransparentPayment({ accommodationId:'a', checkIn:'2026-02-01', checkOut:'2026-02-02', token:'t', email:'e', paymentMethodId:'pm', identificationNumber:'123' }, {});
    expect(res.success).toBe(false);
    expect(res.message).toMatch(/Acomodação não encontrada/);
  });

  test('conflict detected', async ()=> {
    Place.findById.mockResolvedValue({ price:100, title:'T', description:'D', guests:2 });
    Booking.find.mockResolvedValue([{}]);
    const res = await service.processTransparentPayment({ accommodationId:'a', checkIn:'2026-02-01', checkOut:'2026-02-02', token:'t', email:'e', paymentMethodId:'pm', identificationNumber:'123' }, {});
    expect(res.status).toBe('conflict');
  });

  test('creates payment with server-side pm and returns approved', async ()=> {
    Place.findById.mockResolvedValue({ price:100, title:'T', description:'D', guests:2 });
    Booking.find.mockResolvedValue([]);
    // When USE_STRIPE=true, transparentService uses paymentClient.createPaymentIntent
    mockStripeCreatePaymentIntent.mockResolvedValue({ id: 'pi_1', status: 'succeeded' });
    const res = await service.processTransparentPayment({ accommodationId:'a', checkIn:'2026-02-01', checkOut:'2026-02-02', token:'t', email:'e', paymentMethodId:'pm_12345', identificationNumber:'123' }, { _id:'u1', email:'u@e' });
    expect(res.status).toBe('succeeded');
    expect(res.success).toBe(true);
  });

  test('creates payment without pm and returns client_secret for client confirm', async ()=> {
    Place.findById.mockResolvedValue({ price:100, title:'T', description:'D', guests:2 });
    Booking.find.mockResolvedValue([]);
    mockStripeCreatePaymentIntent.mockResolvedValue({ id: 'pi_2', client_secret: 'cs_test_123', status: 'requires_payment_method' });
    const res = await service.processTransparentPayment({ accommodationId:'a', checkIn:'2026-02-01', checkOut:'2026-02-02', token:'t', email:'e', identificationNumber:'123' }, { _id:'u1', email:'u@e' });
    expect(res.success).toBe(true);
    expect(res.clientSecret).toBe('cs_test_123');
  });
});
