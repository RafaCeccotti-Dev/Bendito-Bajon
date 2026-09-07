# Bendito Bajón

Sitio de pedidos online (estilo Burgués): menú → carrito → checkout → MercadoPago + WhatsApp.

Instagram: https://www.instagram.com/bendito.bajon_/

## Local

```bash
cd D:\Proyectos\bendito-bajon
npm install
npm run dev
```

Variables opcionales (`.env`):

```env
VITE_WHATSAPP_NUMBER=5493492XXXXXX
VITE_SHIPPING_FEE=1500
```

## Subir a Cloudflare Pages (producción)

No me pases usuario ni contraseña. Lo hacés vos en 5 minutos:

### Opción A — Dashboard (la más simple)

1. Subí el repo a GitHub (crear repo `bendito-bajon` y push).
2. Entrá a [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Elegí el repo `bendito-bajon`.
4. Build settings:
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
5. Variables (Settings → Environment variables):
   - `VITE_WHATSAPP_NUMBER` = número del local sin + (ej. `5493492123456`)
   - `VITE_SHIPPING_FEE` = `1500` (o el que digan)
   - Secret: `MP_ACCESS_TOKEN` = Access Token de MercadoPago (para el link de pago)
6. **Save and Deploy**.
7. Te da una URL tipo `https://bendito-bajon.pages.dev`.

Para dar de baja después: Workers & Pages → el proyecto → Settings → Delete project.

### Opción B — CLI (`wrangler`)

```bash
npm install
npx wrangler login
npm run deploy
```

Después, en el proyecto Pages, cargá las mismas variables/secrets.

## Nota MercadoPago

Sin `MP_ACCESS_TOKEN` el sitio igual funciona: abre WhatsApp con el pedido (sin link de pago). Cuando cargues el token, el link aparece en el mensaje.
