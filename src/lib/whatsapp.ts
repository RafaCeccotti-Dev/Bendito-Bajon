import { formatMoney, siteConfig, sizeLabels, type Size } from "../data/config"
import type { CartItem } from "./cart"
import { useCart } from "./cart"

const DRAFT_KEY = "bendito-pending-order"
const PAID_WA_KEY = "bendito-paid-wa"

export type OrderLine = {
  title: string
  qty: number
  unitPrice: number
  note: string
}

export type SavedOrder = {
  name: string
  mode: "delivery" | "pickup"
  address: string
  shippingFee: number
  slot: string
  items: OrderLine[]
}

type CheckoutInfo = {
  name: string
  mode: "delivery" | "pickup"
  address: string
  shippingFee: number
  slot: string
  mpLink?: string | null
  paid?: boolean
  paymentId?: string
}

export function savePendingOrder(order: SavedOrder) {
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify(order))
}

export function loadPendingOrder(): SavedOrder | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as SavedOrder
    if (!parsed?.name || !Array.isArray(parsed.items)) return null
    return parsed
  } catch {
    return null
  }
}

export function clearPendingOrder() {
  sessionStorage.removeItem(DRAFT_KEY)
}

export function savePaidWhatsAppUrl(url: string) {
  sessionStorage.setItem(PAID_WA_KEY, url)
}

export function loadPaidWhatsAppUrl(): string | null {
  return sessionStorage.getItem(PAID_WA_KEY)
}

export function clearPaidWhatsAppUrl() {
  sessionStorage.removeItem(PAID_WA_KEY)
}

export function whatsappUrl(message: string) {
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(message)}`
}

export function buildOrderFromCart(
  items: CartItem[],
  info: Omit<CheckoutInfo, "mpLink" | "paid" | "paymentId">,
  getProduct: ReturnType<typeof useCart>["getProduct"],
  unitPrice: ReturnType<typeof useCart>["unitPrice"],
): SavedOrder {
  return {
    name: info.name,
    mode: info.mode,
    address: info.address,
    shippingFee: info.shippingFee,
    slot: info.slot,
    items: items.flatMap((item) => {
      const product = getProduct(item.productId)
      if (!product) return []
      const sizeText = item.size === "U" ? "" : ` ${sizeLabels[item.size as Size]}`
      return [
        {
          title: `${product.name}${sizeText}`,
          qty: item.qty,
          unitPrice: unitPrice(product, item.size),
          note: item.note.trim(),
        },
      ]
    }),
  }
}

export function buildWhatsAppMessageFromOrder(
  order: SavedOrder,
  extra?: { mpLink?: string | null; paid?: boolean; paymentId?: string },
) {
  const lines: string[] = []
  lines.push(
    `- Hola ${siteConfig.brand}! Soy *${order.name}* y quiero hacer el siguiente pedido${
      order.mode === "delivery"
        ? ` hacia *${order.address}*`
        : " para *RETIRAR EN EL LOCAL*"
    } para las *${order.slot} hs*:`,
  )
  lines.push("")

  for (const item of order.items) {
    lines.push(
      `- ${item.qty} x ${item.title} (${formatMoney(item.unitPrice * item.qty)})`,
    )
    if (item.note) {
      lines.push(`  ${item.note.toUpperCase()}`)
    }
    lines.push("")
  }

  if (order.mode === "delivery" && order.shippingFee > 0) {
    lines.push(`- Envío a domicilio (${formatMoney(order.shippingFee)})`)
    lines.push("")
  }

  const foodTotal = order.items.reduce(
    (acc, item) => acc + item.unitPrice * item.qty,
    0,
  )
  const total =
    foodTotal + (order.mode === "delivery" ? order.shippingFee : 0)

  lines.push(`*Total: ${formatMoney(total)}*`)
  lines.push("")

  if (extra?.paid) {
    lines.push("*Pago realizado por MercadoPago.* Ya está cobrado.")
    if (extra.paymentId) {
      lines.push(`Comprobante / ID de pago: ${extra.paymentId}`)
    }
    lines.push("")
  } else if (extra?.mpLink) {
    lines.push(`Link para MercadoPago: ${extra.mpLink}`)
    lines.push("")
  } else {
    lines.push("Pago: coordinamos por este chat / MercadoPago.")
    lines.push("")
  }

  lines.push("¡Muchas gracias!")
  return lines.join("\n")
}

export function buildWhatsAppMessage(
  items: CartItem[],
  info: CheckoutInfo,
  getProduct: ReturnType<typeof useCart>["getProduct"],
  unitPrice: ReturnType<typeof useCart>["unitPrice"],
) {
  const order = buildOrderFromCart(items, info, getProduct, unitPrice)
  return buildWhatsAppMessageFromOrder(order, {
    mpLink: info.mpLink,
    paid: info.paid,
    paymentId: info.paymentId,
  })
}

export function openWhatsApp(message: string) {
  window.open(whatsappUrl(message), "_blank", "noopener,noreferrer")
}

export type { Size }
