import MercadoPagoConfig from "mercadopago";

// Solo para uso en el servidor (route handlers).
export const mp = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});
