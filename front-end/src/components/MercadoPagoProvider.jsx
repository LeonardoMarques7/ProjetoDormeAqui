import React, { createContext, useEffect, useState } from 'react';

export const MercadoPagoContext = createContext(null);

export default function MercadoPagoProvider({ publicKey, locale = 'pt-BR', children }) {
  const [mp, setMp] = useState(null);

  useEffect(() => {
    if (!publicKey) return;
    const scriptId = 'mp-sdk-js';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://sdk.mercadopago.com/js/v2';
      script.async = true;
      script.onload = () => {
        if (window.MercadoPago) {
          const mpLib = new window.MercadoPago(publicKey, { locale });
          setMp(mpLib);
        }
      };
      document.head.appendChild(script);
    } else if (window.MercadoPago) {
      setMp(new window.MercadoPago(publicKey, { locale }));
    }
  }, [publicKey, locale]);

  return <MercadoPagoContext.Provider value={mp}>{children}</MercadoPagoContext.Provider>;
}
