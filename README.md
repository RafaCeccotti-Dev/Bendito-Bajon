# Bendito Bajón

Sitio de pedidos online: menú → carrito → checkout → MercadoPago + WhatsApp.

Instagram: https://www.instagram.com/bendito.bajon_/
Prod: https://bendito-bajon.pages.dev/

## Local

```bash
npm install
npm run dev
```

Variables opcionales (`.env`):

```env
VITE_WHATSAPP_NUMBER=5493491440753
VITE_SHIPPING_FEE=1500
```

## Panel del dueño

URL: `/admin`

En Cloudflare Pages → Settings → Environment variables / Secrets:

- `ADMIN_PASSWORD` = contraseña del panel
- `MP_ACCESS_TOKEN` = Access Token de MercadoPago (opcional; sin esto el pedido igual va por WhatsApp)
- `VITE_WHATSAPP_NUMBER` / `VITE_SHIPPING_FEE` si querés override en build

Desde el panel se pueden:

- subir fotos a cada producto (burgers, papas, postres, bebidas)
- crear / editar / activar promos

Los datos viven en Cloudflare KV (`CATALOG`).

## Deploy

```bash
npx wrangler login
npm run deploy
```

## Nota MercadoPago

Sin `MP_ACCESS_TOKEN` el sitio funciona igual: abre WhatsApp con el pedido (sin link de pago). Cuando cargues el token, el link aparece en el mensaje.
