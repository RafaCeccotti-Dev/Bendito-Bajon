import { siteConfig } from "../data/config"

export function WhatsAppFloat() {
  const href = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
    `Hola ${siteConfig.brand}! Quiero hacer un pedido 🍔`,
  )}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Escribinos por WhatsApp"
      className="fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition hover:scale-105 hover:bg-[#1ebe57] focus:outline-none focus:ring-4 focus:ring-[#25D366]/40"
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden>
        <path d="M20.52 3.48A11.86 11.86 0 0 0 12.04 0C5.5 0 .2 5.3.2 11.82c0 2.08.55 4.12 1.6 5.92L0 24l6.43-1.68a11.8 11.8 0 0 0 5.6 1.43h.01c6.54 0 11.84-5.3 11.84-11.82 0-3.16-1.23-6.13-3.36-8.45ZM12.04 21.5h-.01a9.7 9.7 0 0 1-4.94-1.35l-.35-.21-3.81 1 1.02-3.72-.23-.38a9.7 9.7 0 0 1-1.49-5.18c0-5.36 4.37-9.72 9.74-9.72 2.6 0 5.04 1.01 6.88 2.85a9.66 9.66 0 0 1 2.85 6.88c0 5.36-4.37 9.83-9.76 9.83Zm5.34-7.28c-.29-.15-1.72-.85-1.99-.94-.27-.1-.46-.15-.66.15-.2.29-.76.94-.93 1.13-.17.2-.34.22-.63.07-.29-.15-1.23-.45-2.34-1.44-.86-.77-1.45-1.72-1.62-2.01-.17-.29-.02-.45.13-.6.13-.13.29-.34.43-.51.15-.17.2-.29.29-.48.1-.2.05-.37-.02-.52-.07-.15-.66-1.59-.9-2.18-.24-.58-.48-.5-.66-.51h-.56c-.2 0-.52.07-.79.37-.27.29-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.72-.7 1.96-1.38.24-.68.24-1.26.17-1.38-.07-.12-.26-.2-.55-.34Z" />
      </svg>
    </a>
  )
}
