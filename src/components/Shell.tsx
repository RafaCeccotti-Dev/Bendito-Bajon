import { Link, NavLink, useLocation } from "react-router-dom"
import type { ReactNode } from "react"
import { siteConfig } from "../data/config"
import { useCart } from "../lib/cart"
import { InstagramIcon } from "./InstagramIcon"
import { WhatsAppFloat } from "./WhatsAppFloat"

export function Shell({ children }: { children: ReactNode }) {
  const { count } = useCart()
  const { pathname } = useLocation()
  const isHome = pathname === "/"

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-bold uppercase tracking-wide transition ${
      isActive ? "text-blood" : "text-ink/70 hover:text-blood"
    }`

  return (
    <div className="sky-bg relative min-h-dvh overflow-x-hidden">
      {isHome ? (
        <>
          <img
            src={siteConfig.mascotSrc}
            alt=""
            aria-hidden
            className="pointer-events-none absolute right-[-1.5rem] top-28 z-10 w-28 select-none opacity-95 animate-drift sm:right-6 sm:top-32 sm:w-40 md:w-48"
          />
          <img
            src={siteConfig.mascotSrc}
            alt=""
            aria-hidden
            className="pointer-events-none absolute bottom-[28%] left-[-1rem] z-10 w-20 select-none opacity-80 animate-drift-slow sm:left-4 sm:w-28"
          />
        </>
      ) : null}

      <header className="sticky top-0 z-40 border-b border-white/50 bg-cloud/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <img
              src={siteConfig.mascotSrc}
              alt=""
              className="h-10 w-10 object-contain"
            />
            <span className="font-display text-xl font-bold text-blood sm:text-2xl">
              {siteConfig.brand}
            </span>
          </Link>
          <nav className="flex items-center gap-4 sm:gap-6">
            <NavLink to="/" className={linkClass} end>
              Inicio
            </NavLink>
            <NavLink to="/menu" className={linkClass}>
              Menú
            </NavLink>
            <NavLink
              to="/carrito"
              className="relative inline-flex h-10 items-center rounded-full bg-blood px-4 text-sm font-extrabold text-white shadow-md transition hover:bg-blood-hot"
            >
              Carrito
              {count > 0 ? (
                <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-halo px-1 text-xs text-ink">
                  {count}
                </span>
              ) : null}
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="relative z-20">{children}</main>

      <footer className="relative z-20 border-t border-white/60 px-4 py-10 text-center text-sm text-ink/60">
        <img
          src={siteConfig.mascotSrc}
          alt="Spicy, mascota de Bendito Bajón"
          className="mx-auto h-20 w-auto object-contain drop-shadow-lg"
        />
        <p className="mt-3 font-display text-lg font-semibold text-blood">
          {siteConfig.brand}
        </p>
        <p className="mt-1">
          {siteConfig.tagline} · {siteConfig.city}
        </p>
        <a
          href={siteConfig.instagramUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="Instagram"
          className="mt-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-blood text-white transition hover:bg-blood-hot"
        >
          <InstagramIcon className="h-5 w-5" />
        </a>
      </footer>

      <WhatsAppFloat />
    </div>
  )
}
