export const siteConfig = {
  brand: "Bendito Bajón",
  tagline: "#momentobajon",
  city: "Ceres",
  instagramUrl: "https://www.instagram.com/bendito.bajon_/",
  catalogUrl: "https://wa.me/c/5493491440753",
  whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER ?? "5493491440753",
  shippingFee: Number(import.meta.env.VITE_SHIPPING_FEE ?? 1500),
  mascotSrc: "/brand/mascot.png",
  /** null = sin tope. Cuando el dueño fije cupo (ej. 10), va acá. */
  slotMaxPer: null as number | null,
  slotStartHour: 21,
  slotEndHour: 23,
  slotIntervalMin: 15,
}

export type Size = "S" | "D" | "T" | "C" | "U"

export const sizeLabels: Record<Size, string> = {
  S: "Simple",
  D: "Doble",
  T: "Triple",
  C: "Cuádruple",
  U: "Única",
}

export const burgerSizes: Size[] = ["S", "D", "T", "C"]

export function formatMoney(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value)
}
