# Bendito Bajón — Design Spec (v1)

Fecha: 2026-09-07  
Proyecto: `D:\Proyectos\bendito-bajon`  
Referencia de UX de pedido: [Burgués Rafaela](https://burguesrafaela.com.ar/menu)  
Marca / menú: Instagram `@bendito.bajon_`, cartas propias, catálogo WhatsApp `https://wa.me/c/142649235398751`

## Objetivo

Sitio web personal (no VPS municipal) para la hamburguesería **Bendito Bajón**: landing de marca + pedido online con carrito, checkout, link de MercadoPago y envío del pedido por WhatsApp.

## Decisiones cerradas

| Tema | Decisión |
|------|----------|
| Alcance marketing | Estilo Burgués: quiénes son, fotos, contacto, CTA de pedido |
| Pedido | Menú en la web → carrito → checkout → WhatsApp (no ir directo al chat) |
| Pago | Generar link de MercadoPago e incluirlo en el mensaje de WhatsApp |
| Visual | **Cielo Bendito**: celeste, nubes, rojo, vibe `#momentobajon` / halo |
| Stack | Vite + React + TypeScript + Tailwind + React Router |
| Hosting | Cloudflare Pages + Pages Function para MercadoPago |
| Datos v1 | Sin base de datos; menú en JSON; carrito en `localStorage` |
| Menú v1 | Solo hamburguesas (13) con tamaños S/D/T/C |
| Diferido | Papas, bebidas, extras, panel admin, fotos de producto reales |

## Páginas

1. **`/` Landing**
   - Hero full-bleed con atmósfera cielo / marca
   - Título de marca dominante: Bendito Bajón
   - CTA principal: Hacé tu pedido → `/menu`
   - Sección corta “quiénes somos”
   - Galería / fotos (placeholders o assets disponibles)
   - Contacto + link Instagram + WhatsApp

2. **`/menu`**
   - Categorías: BURGER'S, BENDITAS, BAJONERAS
   - Cada producto: nombre, descripción, selector S/D/T/C con precio, agregar al carrito
   - Acceso al carrito (badge con cantidad)

3. **`/carrito`**
   - Lista de ítems (nombre + tamaño + precio + cantidad)
   - Notas por ítem (ej. SIN MANTECA)
   - Editar cantidades / quitar
   - Total parcial
   - CTA a checkout

4. **`/checkout`**
   - Nombre del cliente
   - Delivery o retiro
   - Dirección si delivery
   - Costo de envío (monto fijo configurable en v1)
   - Total final
   - Confirmar: crea preferencia MP → abre WhatsApp con mensaje formateado

## Flujo de pedido

```
Elegir producto + tamaño
  → Agregar al carrito (localStorage)
  → Revisar carrito + notas
  → Checkout (datos + envío)
  → Pages Function crea preferencia MercadoPago
  → Armar mensaje WhatsApp (ítems, dirección/retiro, total, link MP)
  → window.open(wa.me/...)
  → Local confirma por chat
```

### Formato de mensaje (referencia)

Basado en pedidos reales a Burgués:

- Saludo + nombre del cliente
- Dirección o retiro
- Líneas `cantidad x Producto Tamaño ($ precio)` + notas
- Línea de envío si aplica
- Total
- Link MercadoPago
- Cierre

## Modelo de datos (front)

### Producto (JSON)

- `id`, `category` (`burgers` | `benditas` | `bajoneras`)
- `name`, `description`
- `prices`: `{ S, D, T, C }` en pesos enteros
- `image` opcional (placeholder en v1)

### Ítem de carrito

- `productId`, `size` (`S`|`D`|`T`|`C`), `qty`, `note?`
- Precio unitario derivado del menú al momento de agregar/mostrar

### Config (`src/data/config.ts` o env)

- `whatsappNumber` (E.164 sin +)
- `shippingFee` (número fijo v1)
- `mercadopago` vía secrets en Cloudflare (no en el cliente)
- `instagramUrl`
- Textos de marca / horarios si se cargan

## Backend mínimo

Una sola **Cloudflare Pages Function**:

- `POST /api/create-preference`
- Body: ítems del pedido + totales + datos de checkout (sin guardar en DB)
- Usa Access Token de MercadoPago (secret)
- Devuelve `init_point` / `sandbox_init_point`
- Validar precios contra el menú del servidor (misma fuente JSON) para no confiar solo en el cliente

Sin auth de usuarios. Sin panel admin en v1.

## Estética

- Paleta: cielo celeste, blanco/nubes, rojo/bordo de las cartas, acentos cálidos del personaje burger
- Tipografía expresiva (no Inter/Roboto/Arial por defecto)
- Hero con atmósfera (cielo/nubes), no flat single color
- Marca como señal hero-level
- Evitar cards genéricas en el hero; en menú, contenedores orientados a interacción (agregar al carrito)
- Motion sutil: entrada de hero / hover en CTAs (2–3 movimientos intencionales)

## Fuera de alcance v1

- Base de datos / historial de pedidos
- Login
- Edición de menú desde UI
- Papas, bebidas, combos
- Cálculo de envío por zona/mapa
- Notificaciones push / email
- Deploy en VPS de Gobierno de Ceres (prohibido; proyecto personal)

## Criterios de éxito

- Landing con identidad Cielo Bendito reconocible
- Se puede armar un pedido de burgers S/D/T/C de punta a punta
- El mensaje de WhatsApp es legible y completo
- Incluye link de MercadoPago (sandbox o prod según keys)
- Deployable en Cloudflare Pages
- Menú editable cambiando un JSON + rebuild/deploy

## Pendientes de configuración (antes de prod real)

1. Número de WhatsApp del local
2. Credenciales MercadoPago (test → prod)
3. Monto de envío acordado
4. Fotos reales de productos / logo vectorial si lo tienen
5. Textos finales de papas/bebidas cuando estén

## Fuentes de menú v1

Archivos en `docs/menu.md` y capturas en `public/menu/`:

- BURGER'S: Clásica, Oklahoma, Cuarto, Extra Cheddar, Cheese Burger
- BENDITAS: Butter, Cheese Bacon, Bacon 2.0, Ameri
- BAJONERAS: MDB, Argenta, Bendita Crispy, Bendita Provo
