import { jest } from '@jest/globals';

const mockProcessPaymentNotification = jest.fn();
const mockFindOne = jest.fn();
const mockCreateFromPayment = jest.fn();
const mockAppendFileSync = jest.fn();

jest.unstable_mockModule('./domains/payments/service.js', () => ({
  processPaymentNotification: mockProcessPaymentNotification
}));
jest.unstable_mockModule('./domains/bookings/model.js', () => ({
  default: { findOne: mockFindOne, createFromPayment: mockCreateFromPayment }
}));
jest.unstable_mockModule('fs', () => ({
  appendFileSync: mockAppendFileSync
}));

let processPaymentNotification;
let Booking;
let fsMock;
let service;

beforeAll(async ()=>{
  ({ processPaymentNotification } = await import('./domains/payments/service.js'));
  Booking = (await import('./domains/bookings/model.js')).default;
  fsMock = await import('fs');
  service = await import('./webhooks/mercadopago.js');
});





describe('mercadopago webhook', ()=> {
  beforeEach(()=> jest.resetAllMocks());

  test('ignores non-payment', async ()=> {
    const req = { body: { type: 'not_payment' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await service.handleMercadoPagoWebhook(req,res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('não processada') }));
  });

  test('missing payment id', async ()=> {
    const req = { body: { type:'payment', data: {} } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await service.handleMercadoPagoWebhook(req,res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('sem dados de pagamento') }));
  });

  test('pending payment does not create booking', async ()=> {
    processPaymentNotification.mockResolvedValue({ paymentId:'p1', status:'pending', metadata:{} });
    Booking.findOne.mockResolvedValue(null);
    const req = { body: { type:'payment', data:{ id:'p1'} } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await service.handleMercadoPagoWebhook(req,res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Pagamento não aprovado') }));
  });

  test('approved but incomplete metadata', async ()=> {
    processPaymentNotification.mockResolvedValue({ paymentId:'p1', status:'approved', metadata:{ } });
    Booking.findOne.mockResolvedValue(null);
    const req = { body: { type:'payment', data:{ id:'p1'} } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await service.handleMercadoPagoWebhook(req,res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Metadata incompleta') }));
  });

  test('approved and creates booking', async ()=> {
    processPaymentNotification.mockResolvedValue({ paymentId:'p1', status:'approved', metadata:{ userId:'u1', accommodationId:'a1', totalPrice:200, pricePerNight:100, checkIn:new Date('2026-02-01'), checkOut:new Date('2026-02-03'), guests:2, nights:2 } });
    Booking.findOne.mockResolvedValue(null);
    Booking.createFromPayment.mockResolvedValue({ _id:'b1' });
    const req = { body: { type:'payment', data:{ id:'p1'} } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await service.handleMercadoPagoWebhook(req,res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Reserva criada com sucesso', bookingId:'b1' }));
  });
});
