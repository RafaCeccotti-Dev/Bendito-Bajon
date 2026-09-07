import { Link, NavLink } from "react-router-dom"
import type { ReactNode } from "react"
import { siteConfig } from "../data/config"
import { useCart } from "../lib/cart"

export function Shell({ children }: { children: ReactNode }) {
  const { count } = useCart()

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-bold uppercase tracking-wide transition ${
      isActive ? "text-blood" : "text-ink/70 hover:text-blood"
    }`

  return (
    <div className="sky-bg min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-white/50 bg-cloud/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link to="/" className="font-display text-xl font-bold text-blood sm:text-2xl">
            {siteConfig.brand}
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
      <main>{children}</main>
      <footer className="border-t border-white/60 px-4 py-8 text-center text-sm text-ink/60">
        <p className="font-display text-lg font-semibold text-blood">
          {siteConfig.brand}
        </p>
        <p className="mt-1">{siteConfig.tagline} · {siteConfig.city}</p>
        <a
          href={siteConfig.instagramUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block font-bold text-blood-hot underline-offset-2 hover:underline"
        >
          Instagram
        </a>
      </footer>
    </div>
  )
}
