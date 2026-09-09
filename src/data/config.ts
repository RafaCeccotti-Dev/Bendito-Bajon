export const siteConfig = {
  brand: "Bendito Bajón",
  tagline: "#momentobajon",
  city: "Ceres",
  instagramUrl: "https://www.instagram.com/bendito.bajon_/",
  catalogUrl: "https://wa.me/c/142649235398751",
  /** Número WhatsApp sin +. Override con VITE_WHATSAPP_NUMBER. */
  whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER ?? "5493491440753",
  shippingFee: Number(import.meta.env.VITE_SHIPPING_FEE ?? 1500),
}

export type Size = "S" | "D" | "T" | "C"

export const sizeLabels: Record<Size, string> = {
  S: "Simple",
  D: "Doble",
  T: "Triple",
  C: "Cuádruple",
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value)
}
