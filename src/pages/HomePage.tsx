import { Link } from "react-router-dom"
import { formatMoney, siteConfig } from "../data/config"
import { useCart } from "../lib/cart"
import { InstagramIcon } from "../components/InstagramIcon"

export function HomePage() {
  const { promos, products } = useCart()
  const featured = products.filter((p) => p.image).slice(0, 6)

  return (
    <div>
      <section className="relative min-h-[82vh] overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-16 top-24 h-32 w-52 rounded-full cloud animate-floaty" />
          <div className="absolute right-10 top-40 h-20 w-36 rounded-full cloud animate-floaty [animation-delay:1s]" />
          <div className="absolute bottom-28 left-1/3 h-24 w-44 rounded-full cloud animate-floaty [animation-delay:0.4s]" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 pb-20 pt-14 sm:px-6 sm:pt-20">
          <div className="max-w-2xl animate-fade-up">
            <p className="font-display text-sm font-semibold uppercase tracking-[0.22em] text-blood/80">
              {siteConfig.city} · smash burgers
            </p>
            <h1 className="mt-3 font-display text-5xl font-bold leading-[0.95] text-blood sm:text-7xl">
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
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border-2 border-blood/30 bg-white/55 text-blood backdrop-blur transition hover:border-blood"
              >
                <InstagramIcon className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {featured.length > 0 ? (
        <section className="relative z-20 mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blood/70">
                Destacadas
              </p>
              <h2 className="mt-1 font-display text-3xl font-bold text-blood">
                Las burgers
              </h2>
            </div>
            <Link to="/menu" className="text-sm font-extrabold text-blood">
              Ver menú →
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {featured.map((product, i) => (
              <Link
                key={product.id}
                to={`/menu?cat=${product.category}`}
                className="group overflow-hidden rounded-[1.5rem] border border-white/70 bg-white/65 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md animate-fade-up"
                style={{ animationDelay: `${80 + i * 60}ms` }}
              >
                <div className="aspect-square overflow-hidden bg-ink/5">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-3 sm:p-4">
                  <p className="font-display text-lg font-bold text-blood sm:text-xl">
                    {product.name}
                  </p>
                  <p className="mt-0.5 text-xs font-bold text-blood/60">
                    desde {formatMoney(product.prices?.S ?? product.fixedPrice ?? 0)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {promos.length > 0 ? (
        <section className="relative z-20 mx-auto max-w-5xl px-4 py-10 sm:px-6">
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
                  <div className="aspect-square w-full overflow-hidden bg-ink/5 sm:aspect-[4/3]">
                    <img
                      src={promo.image}
                      alt={promo.title}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-r from-sky/40 to-halo/40">
                    <img
                      src={siteConfig.mascotSrc}
                      alt=""
                      className="h-16 w-auto object-contain"
                    />
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

      <section className="relative z-20 mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <h2 className="font-display text-3xl font-bold text-blood">El menú Bendito</h2>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-ink/75 sm:text-lg">
          Burgers, papas, postres y bebidas. Elegí, sumá al carrito y cerramos
          por WhatsApp.
        </p>
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
