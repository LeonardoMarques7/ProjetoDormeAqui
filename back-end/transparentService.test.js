import { jest } from '@jest/globals';

const mockPaymentCreate = jest.fn();
const mockPlaceFindById = jest.fn();
const mockBookingFind = jest.fn();

// declare mocks before importing the module under test
jest.unstable_mockModule('./config/mercadopago.js', ()=>({ paymentClient:{ create: mockPaymentCreate } }));
jest.unstable_mockModule('./domains/places/model.js', ()=>({ default: { findById: mockPlaceFindById } }));
jest.unstable_mockModule('./domains/bookings/model.js', ()=>({ default: { find: mockBookingFind } }));

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
  beforeEach(()=>{ jest.resetAllMocks(); process.env.MERCADO_PAGO_WEBHOOK_URL='http://example.com/webhook'; });

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

  test('creates payment and returns approved', async ()=> {
    Place.findById.mockResolvedValue({ price:100, title:'T', description:'D', guests:2 });
    Booking.find.mockResolvedValue([]);
    paymentClient.create.mockResolvedValue({ status:'approved' });
    const res = await service.processTransparentPayment({ accommodationId:'a', checkIn:'2026-02-01', checkOut:'2026-02-02', token:'t', email:'e', paymentMethodId:'pm', identificationNumber:'123' }, { _id:'u1', email:'u@e' });
    expect(res.status).toBe('approved');
    expect(res.success).toBe(true);
  });
});
