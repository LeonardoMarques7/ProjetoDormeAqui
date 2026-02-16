import mercadopago from "mercadopago";  

const ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN;
if (!ACCESS_TOKEN) {
  console.warn('MERCADO_PAGO_ACCESS_TOKEN is not set. Set it to use Mercado Pago API.');
}

mercadopago.configure({ access_token: ACCESS_TOKEN });

module.exports = mercadopago;
