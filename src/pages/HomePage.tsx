import { Link } from "react-router-dom"
import { siteConfig } from "../data/config"

export function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-16">
        <div className="pointer-events-none absolute -left-10 top-16 h-24 w-40 rounded-full cloud animate-floaty" />
        <div className="pointer-events-none absolute right-6 top-28 h-16 w-28 rounded-full cloud animate-floaty [animation-delay:1s]" />
        <div className="pointer-events-none absolute bottom-10 left-1/3 h-20 w-36 rounded-full cloud animate-floaty [animation-delay:0.4s]" />

        <div className="relative mx-auto max-w-5xl animate-fade-up">
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
            Hamburguesas smash, cheddar derretido y ese bajón que pedías.
            Armá el pedido en la web y lo confirmamos por WhatsApp.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/menu"
              className="inline-flex h-12 items-center rounded-full bg-blood px-6 text-base font-extrabold text-white shadow-lg transition hover:bg-blood-hot hover:scale-[1.02]"
            >
              Hacé tu pedido
            </Link>
            <a
              href={siteConfig.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center rounded-full border-2 border-blood/30 bg-white/50 px-6 text-base font-bold text-blood backdrop-blur transition hover:border-blood"
            >
              Ver Instagram
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <h2 className="font-display text-3xl font-bold text-blood">¿Qué es Bendito?</h2>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-ink/75 sm:text-lg">
          Un local de bajón con smash, salsas propias y categorías para todos los
          gustos: BURGER&apos;S, BENDITAS y BAJONERAS. Elegí simple, doble, triple
          o cuádruple y listo.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            ["BURGER'S", "Las clásicas smash con aderezo Bendito."],
            ["BENDITAS", "Butter, bacon y combinaciones más intensas."],
            ["BAJONERAS", "MDB, Argenta, Crispy y Provo."],
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
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
        <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/60 p-6 shadow-sm backdrop-blur sm:p-8">
          <h2 className="font-display text-3xl font-bold text-blood">Contacto</h2>
          <p className="mt-3 text-ink/75">
            Pedidos por la web + WhatsApp. Seguinos en Instagram para novedades y
            #momentobajon.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/menu"
              className="inline-flex h-11 items-center rounded-full bg-halo px-5 text-sm font-extrabold text-ink"
            >
              Ir al menú
            </Link>
            <a
              href={siteConfig.catalogUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center rounded-full border border-blood/25 px-5 text-sm font-bold text-blood"
            >
              Catálogo WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
