import { siteConfig } from "../data/config"

function BurgerIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      {/* top bun */}
      <path
        d="M10 28c0-10 10-16 22-16s22 6 22 16H10z"
        fill="#E8A04A"
      />
      <path
        d="M14 20c1.2-1.5 3-1.2 3.5.4M22 16.5c1-1.4 2.8-1.2 3.2.5M32 15c1.1-1.5 2.9-1.1 3.3.6M42 17c1.1-1.4 2.8-1 3.1.7"
        stroke="#C47A2A"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
      {/* cheese */}
      <path d="M11 29h42l-3 5H14z" fill="#F5C542" />
      {/* patty */}
      <rect x="12" y="34" width="40" height="7" rx="3.5" fill="#6B2E1A" />
      {/* lettuce */}
      <path
        d="M11 42c3-3 7 1 10-1s6-3 10 0 7 2 11-1 7-1 10 2v3H11z"
        fill="#6FBF3A"
      />
      {/* bottom bun */}
      <path d="M12 45h40c0 7-8 11-20 11S12 52 12 45z" fill="#D4893A" />
      {/* small WA badge */}
      <circle cx="50" cy="50" r="11" fill="#25D366" />
      <path
        d="M50 42.2a7.7 7.7 0 0 0-6.7 11.5l-.4 2.3 2.4-.4A7.7 7.7 0 1 0 50 42.2Zm4.1 10.3c-.2.5-1 1-1.4 1.1-.4.1-.8.2-1.3.1-.5-.1-1.1-.3-1.8-.7a9.5 9.5 0 0 1-3.4-3.3c-.4-.6-.7-1.2-.7-1.6 0-.3.1-.5.3-.7l.5-.6c.1-.2.2-.3.3-.5.1-.2 0-.3 0-.5l-.7-1.7c-.1-.3-.3-.3-.5-.3h-.4c-.2 0-.5.1-.7.4s-.9 1-.9 2.3.9 2.6 1 2.8c.1.2 1.8 2.8 4.4 3.8.6.3 1.1.4 1.5.5.6.2 1.2.2 1.6.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2-.1-.1-.3-.2-.6-.3Z"
        fill="#fff"
      />
    </svg>
  )
}

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
      className="fixed bottom-5 right-5 z-50 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#fff6e8] to-[#ffd7a0] text-ink shadow-[0_10px_28px_rgba(140,40,20,0.35)] ring-2 ring-blood/25 transition hover:scale-110 hover:ring-blood/50 focus:outline-none focus:ring-4 focus:ring-blood/30 animate-floaty"
    >
      <BurgerIcon className="h-11 w-11 drop-shadow-sm" />
    </a>
  )
}
