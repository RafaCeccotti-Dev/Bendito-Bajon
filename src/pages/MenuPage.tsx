import { useEffect, useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { burgerSizes, formatMoney, sizeLabels, type Size } from "../data/config"
import { useCart, type Product } from "../lib/cart"
import { PhotoSoon } from "../components/PhotoSoon"

const categories = [
  { id: "burgers", label: "BURGER'S" },
  { id: "benditas", label: "BENDITAS" },
  { id: "bajoneras", label: "BAJONERAS" },
  { id: "papas", label: "PAPAS" },
  { id: "postres", label: "POSTRES" },
  { id: "bebidas", label: "BEBIDAS" },
  { id: "promos", label: "PROMOS" },
] as const

function ProductCard({ product }: { product: Product }) {
  const { addItem, unitPrice } = useCart()
  const isSized = Boolean(product.prices)
  const [size, setSize] = useState<Size>(isSized ? "D" : "U")
  const [added, setAdded] = useState(false)

  return (
    <article className="overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/65 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md">
      {product.image ? (
        <div className="aspect-square w-full overflow-hidden bg-ink/5">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover object-center"
          />
        </div>
      ) : (
        <PhotoSoon />
      )}
      <div className="p-5">
        <h3 className="font-display text-2xl font-bold text-blood">{product.name}</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink/70">{product.description}</p>

        {isSized ? (
          <div className="mt-4 grid grid-cols-4 gap-2">
            {burgerSizes.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setSize(option)}
                className={`rounded-2xl border px-2 py-2 text-center transition ${
                  size === option
                    ? "border-blood bg-blood text-white"
                    : "border-blood/15 bg-cloud text-ink hover:border-blood/40"
                }`}
              >
                <div className="text-xs font-extrabold">{option}</div>
                <div className="text-[11px] opacity-90">
                  {formatMoney(unitPrice(product, option))}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-4 font-display text-2xl font-bold text-blood">
            {formatMoney(unitPrice(product, "U"))}
          </p>
        )}

        <button
          type="button"
          onClick={() => {
            addItem(product.id, isSized ? size : "U")
            setAdded(true)
            window.setTimeout(() => setAdded(false), 1200)
          }}
          className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-full bg-blood text-sm font-extrabold text-white transition hover:bg-blood-hot"
        >
          {added
            ? "Agregado ✓"
            : isSized
              ? `Agregar ${sizeLabels[size]}`
              : "Agregar"}
        </button>
      </div>
    </article>
  )
}

export function MenuPage() {
  const { products, promos } = useCart()
  const [params] = useSearchParams()
  const initial = (params.get("cat") as (typeof categories)[number]["id"]) || "burgers"
  const [active, setActive] = useState<(typeof categories)[number]["id"]>(
    categories.some((c) => c.id === initial) ? initial : "burgers",
  )

  useEffect(() => {
    if (categories.some((c) => c.id === initial)) setActive(initial)
  }, [initial])

  const list = useMemo(
    () => products.filter((item) => item.category === active),
    [active, products],
  )

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blood/70">
            Pedido online
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold text-blood">Menú</h1>
          <p className="mt-2 text-ink/70">
            Burgers, papas, postres, bebidas y promos.
          </p>
        </div>
        <Link
          to="/carrito"
          className="inline-flex h-11 items-center rounded-full bg-halo px-5 text-sm font-extrabold text-ink"
        >
          Ver carrito
        </Link>
      </div>

      <div className="mt-8 flex gap-2 overflow-x-auto pb-1">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setActive(category.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-extrabold transition ${
              active === category.id
                ? "bg-blood text-white"
                : "bg-white/70 text-blood hover:bg-white"
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {active === "promos" ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {promos.map((promo) => (
            <article
              key={promo.id}
              className="overflow-hidden rounded-3xl border border-white/70 bg-white/65 shadow-sm backdrop-blur"
            >
              {promo.image ? (
                <div className="aspect-square w-full overflow-hidden bg-ink/5">
                  <img
                    src={promo.image}
                    alt={promo.title}
                    className="h-full w-full object-cover object-center"
                  />
                </div>
              ) : (
                <PhotoSoon />
              )}
              <div className="p-5">
                <h3 className="font-display text-2xl font-bold text-blood">
                  {promo.title}
                </h3>
                <p className="mt-2 text-sm text-ink/70">{promo.description}</p>
                {promo.price && promo.price > 0 ? (
                  <p className="mt-3 font-display text-2xl font-bold text-blood">
                    {formatMoney(promo.price)}
                  </p>
                ) : (
                  <p className="mt-3 text-sm font-bold text-blood/80">
                    Consultar al pedir
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {list.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
