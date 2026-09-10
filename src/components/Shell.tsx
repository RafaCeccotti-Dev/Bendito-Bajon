import { Link, NavLink } from "react-router-dom"
import type { ReactNode } from "react"
import { siteConfig } from "../data/config"
import { useCart } from "../lib/cart"
import { InstagramIcon } from "./InstagramIcon"

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
          <Link to="/" className="flex items-center gap-2">
            <img
              src={siteConfig.mascotSrc}
              alt=""
              className="h-10 w-10 rounded-full object-cover shadow-md ring-2 ring-white/80"
            />
            <span className="font-display text-xl font-bold text-blood sm:text-2xl">
              {siteConfig.brand}
            </span>
          </Link>
          <nav className="flex items-center gap-3 sm:gap-5">
            <NavLink to="/" className={linkClass} end>
              Inicio
            </NavLink>
            <NavLink to="/menu" className={linkClass}>
              Menú
            </NavLink>
            <a
              href={siteConfig.instagramUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram Bendito Bajón"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-blood/20 bg-white/70 text-blood transition hover:border-blood hover:bg-white"
            >
              <InstagramIcon className="h-5 w-5" />
            </a>
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
      <footer className="border-t border-white/60 px-4 py-10 text-center text-sm text-ink/60">
        <img
          src={siteConfig.mascotSrc}
          alt="Mascota Bendito Bajón"
          className="mx-auto h-16 w-16 rounded-full object-cover shadow-lg ring-4 ring-white/70"
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
    </div>
  )
}
