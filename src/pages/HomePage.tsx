import { Link } from "react-router-dom"
import { formatMoney, siteConfig } from "../data/config"
import { useCart } from "../lib/cart"
import { InstagramIcon } from "../components/InstagramIcon"

export function HomePage() {
  const { promos } = useCart()

  return (
    <div>
      <section className="relative min-h-[88vh] overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-16 top-24 h-32 w-52 rounded-full cloud animate-floaty" />
          <div className="absolute right-8 top-20 h-20 w-36 rounded-full cloud animate-floaty [animation-delay:1s]" />
          <div className="absolute bottom-24 left-1/3 h-24 w-44 rounded-full cloud animate-floaty [animation-delay:0.4s]" />
        </div>

        <div className="relative mx-auto grid max-w-5xl items-center gap-8 px-4 pb-16 pt-10 sm:grid-cols-[1.1fr_0.9fr] sm:px-6 sm:pb-20 sm:pt-14">
          <div className="animate-fade-up">
            <p className="font-display text-sm font-semibold uppercase tracking-[0.22em] text-blood/80">
              {siteConfig.city} · smash burgers
            </p>
            <h1 className="mt-3 max-w-3xl font-display text-5xl font-bold leading-[0.95] text-blood sm:text-7xl">
              {siteConfig.brand}
            </h1>
            <p className="mt-2 font-display text-2xl text-blood-hot sm:text-3xl">
              {siteConfig.tagline}
            </p>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink/75 sm:text-lg">
              Smash, cheddar derretido, papas, postres y promos. Pedí online y
              confirmamos por WhatsApp.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/menu"
                className="inline-flex h-12 items-center rounded-full bg-blood px-6 text-base font-extrabold text-white shadow-lg transition hover:scale-[1.02] hover:bg-blood-hot"
              >
                Hacé tu pedido
              </Link>
              <a
                href={siteConfig.instagramUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Abrir Instagram"
                className="inline-flex h-12 items-center gap-2 rounded-full border-2 border-blood/30 bg-white/55 px-5 text-base font-bold text-blood backdrop-blur transition hover:border-blood"
              >
                <InstagramIcon className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md animate-fade-up [animation-delay:120ms]">
            <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-halo/40 via-white/20 to-blood/10 blur-2xl" />
            <img
              src={siteConfig.mascotSrc}
              alt="Mascota Bendito Bajón"
              className="relative mx-auto w-[78%] max-w-sm animate-floaty drop-shadow-2xl"
            />
          </div>
        </div>
      </section>

      {promos.length > 0 ? (
        <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blood/70">
                Ahora
              </p>
              <h2 className="mt-1 font-display text-3xl font-bold text-blood">
                Promos
              </h2>
            </div>
            <Link to="/menu?cat=promos" className="text-sm font-extrabold text-blood">
              Ver menú →
            </Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {promos.slice(0, 4).map((promo, i) => (
              <article
                key={promo.id}
                className="overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/65 shadow-sm backdrop-blur animate-fade-up"
                style={{ animationDelay: `${100 + i * 80}ms` }}
              >
                {promo.image ? (
                  <img
                    src={promo.image}
                    alt={promo.title}
                    className="h-40 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-28 items-center justify-center bg-gradient-to-r from-sky/40 to-halo/40">
                    <img src={siteConfig.mascotSrc} alt="" className="h-16 w-16" />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="font-display text-2xl font-bold text-blood">
                    {promo.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/70">
                    {promo.description}
                  </p>
                  {promo.price && promo.price > 0 ? (
                    <p className="mt-3 font-extrabold text-blood">
                      {formatMoney(promo.price)}
                    </p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <h2 className="font-display text-3xl font-bold text-blood">El menú Bendito</h2>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-ink/75 sm:text-lg">
          Burgers, papas, postres y bebidas. Elegí, sumá al carrito y cerramos
          por WhatsApp.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {[
            ["BURGER'S", "Smash con aderezo Bendito."],
            ["PAPAS", "Clásicas, cheddar y Bendito."],
            ["POSTRES", "Para cerrar el bajón."],
          ].map(([title, text], i) => (
            <div
              key={title}
              className="rounded-3xl border border-white/70 bg-white/55 p-5 shadow-sm backdrop-blur animate-fade-up"
              style={{ animationDelay: `${120 + i * 80}ms` }}
            >
              <p className="font-display text-xl font-bold text-blood">{title}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink/70">{text}</p>
            </div>
          ))}
        </div>
        <Link
          to="/menu"
          className="mt-8 inline-flex h-11 items-center rounded-full bg-halo px-5 text-sm font-extrabold text-ink"
        >
          Ver carta completa
        </Link>
      </section>
    </div>
  )
}
