import { jest } from '@jest/globals';

const mockCreatePreferenceWithBackUrls = jest.fn();
const mockPaymentClientGet = jest.fn();
const mockValidateToken = jest.fn();

// Declare mocks before importing the module under test
jest.unstable_mockModule('./config/mercadopago.js', () => ({
  createPreferenceWithBackUrls: mockCreatePreferenceWithBackUrls,
  paymentClient: { get: mockPaymentClientGet },
  testToken: jest.fn(),
  validateToken: mockValidateToken
}));

jest.unstable_mockModule('./domains/places/model.js', () => ({
  default: { findById: jest.fn() }
}));

let Place;
let createPreferenceWithBackUrls;
let paymentClient;
let service;

beforeAll(async () => {
  Place = (await import('./domains/places/model.js')).default;
  ({ createPreferenceWithBackUrls, paymentClient } = await import('./config/mercadopago.js'));
  service = await import('./domains/payments/service.js');
});

describe('payments service', () => {
  beforeEach(()=>{
    jest.resetAllMocks();
    process.env.MERCADO_PAGO_WEBHOOK_URL='http://example.com/webhook';
  });

  test('calculateNights', ()=>{
    expect(service.calculateNights('2026-02-01','2026-02-03')).toBe(2);
  });

  test('calculateTotalPrice', ()=> expect(service.calculateTotalPrice(100,3)).toBe(300));

  test('getAccommodationDetails throws when not found', async ()=> {
    Place.findById.mockResolvedValue(null);
    await expect(service.getAccommodationDetails('x')).rejects.toMatchObject({message:'Acomodação não encontrada'});
  });

  test('createCheckoutPreference validates frontendUrl', async ()=> {
    await expect(service.createCheckoutPreference({ accommodationId:'a', userId:'u', checkIn:new Date(), checkOut:new Date(Date.now()+86400000), guests:1 })).rejects.toBeTruthy();
  });

  test('createCheckoutPreference success', async ()=> {
    const place = { price:100, guests:2, title:'T', city:'C', photos:[], _id:'a' };
    Place.findById.mockResolvedValue(place);
    mockCreatePreferenceWithBackUrls.mockResolvedValue({ id:'pref1', init_point:'init', back_urls:{success:'ok'} });
    const result = await service.createCheckoutPreference({ accommodationId:'a', userId:'u', checkIn:new Date('2026-02-01'), checkOut:new Date('2026-02-03'), guests:1, frontendUrl:'https://app.test', payerEmail:'test@example.com' });
    expect(result.preferenceId).toBe('pref1');
    expect(result.totalPrice).toBe(200);
  });

  test('processPaymentNotification normalizes metadata', async ()=> {
    paymentClient.get.mockResolvedValue({ id: 'p1', status:'approved', metadata:{ userId:'u', accommodationId:'a', checkIn:'2026-02-01T00:00:00Z', checkOut:'2026-02-03T00:00:00Z', guests:'2', nights:'2', totalPrice:'200', pricePerNight:'100' }, transaction_amount:200 });
    const res = await service.processPaymentNotification({ data:{ id:'p1' } });
    expect(res.paymentId).toBe('p1');
    expect(res.metadata.totalPrice).toBe(200);
    expect(res.metadata.guests).toBe(2);
  });
});
