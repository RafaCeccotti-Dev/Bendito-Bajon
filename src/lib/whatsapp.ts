import { formatMoney, siteConfig, sizeLabels, type Size } from "../data/config"
import type { CartItem } from "./cart"
import { menu } from "./cart"

type CheckoutInfo = {
  name: string
  mode: "delivery" | "pickup"
  address: string
  shippingFee: number
  mpLink?: string | null
}

export function buildWhatsAppMessage(items: CartItem[], info: CheckoutInfo) {
  const lines: string[] = []
  lines.push(
    `- Hola ${siteConfig.brand}! Soy *${info.name}* y quiero hacer el siguiente pedido${
      info.mode === "delivery"
        ? ` hacia *${info.address}*`
        : " para *RETIRAR EN EL LOCAL*"
    }:`,
  )
  lines.push("")

  for (const item of items) {
    const product = menu.find((p) => p.id === item.productId)
    if (!product) continue
    const unit = product.prices[item.size as Size]
    lines.push(
      `- ${item.qty} x ${product.name} ${sizeLabels[item.size]}(${formatMoney(unit * item.qty)})`,
    )
    if (item.note.trim()) {
      lines.push(`  ${item.note.trim().toUpperCase()}`)
    }
    lines.push("")
  }

  if (info.mode === "delivery" && info.shippingFee > 0) {
    lines.push(`- Envío a domicilio (${formatMoney(info.shippingFee)})`)
    lines.push("")
  }

  const foodTotal = items.reduce((acc, item) => {
    const product = menu.find((p) => p.id === item.productId)
    if (!product) return acc
    return acc + product.prices[item.size as Size] * item.qty
  }, 0)
  const total =
    foodTotal + (info.mode === "delivery" ? info.shippingFee : 0)

  lines.push(`*Total: ${formatMoney(total)}*`)
  lines.push("")

  if (info.mpLink) {
    lines.push(`Link para MercadoPago: ${info.mpLink}`)
    lines.push("")
  } else {
    lines.push("Pago: coordinamos por este chat / MercadoPago.")
    lines.push("")
  }

  lines.push("¡Muchas gracias!")
  return lines.join("\n")
}

export function openWhatsApp(message: string) {
  const url = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(message)}`
  window.open(url, "_blank", "noopener,noreferrer")
}
