import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { formatMoney, sizeLabels, type Size } from "../data/config"
import { menu, useCart, type Product } from "../lib/cart"

const categories = [
  { id: "burgers", label: "BURGER'S" },
  { id: "benditas", label: "BENDITAS" },
  { id: "bajoneras", label: "BAJONERAS" },
] as const

function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const [size, setSize] = useState<Size>("D")
  const [added, setAdded] = useState(false)

  return (
    <article className="rounded-3xl border border-white/70 bg-white/65 p-5 shadow-sm backdrop-blur">
      <h3 className="font-display text-2xl font-bold text-blood">{product.name}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink/70">{product.description}</p>
      <div className="mt-4 grid grid-cols-4 gap-2">
        {(Object.keys(sizeLabels) as Size[]).map((option) => (
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
            <div className="text-[11px] opacity-90">{formatMoney(product.prices[option])}</div>
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => {
          addItem(product.id, size)
          setAdded(true)
          window.setTimeout(() => setAdded(false), 1200)
        }}
        className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-full bg-blood text-sm font-extrabold text-white transition hover:bg-blood-hot"
      >
        {added ? "Agregada ✓" : `Agregar ${sizeLabels[size]}`}
      </button>
    </article>
  )
}

export function MenuPage() {
  const [active, setActive] = useState<(typeof categories)[number]["id"]>("burgers")
  const products = useMemo(
    () => menu.filter((item) => item.category === active),
    [active],
  )

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blood/70">
            Pedido online
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold text-blood">Menú</h1>
          <p className="mt-2 text-ink/70">Elegí tamaño S / D / T / C y sumá al carrito.</p>
        </div>
        <Link
          to="/carrito"
          className="inline-flex h-11 items-center rounded-full bg-halo px-5 text-sm font-extrabold text-ink"
        >
          Ver carrito
        </Link>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setActive(category.id)}
            className={`rounded-full px-4 py-2 text-sm font-extrabold transition ${
              active === category.id
                ? "bg-blood text-white"
                : "bg-white/70 text-blood hover:bg-white"
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <p className="mt-10 text-center text-sm text-ink/55">
        Papas y bebidas: las sumamos apenas tengamos la carta.
      </p>
    </div>
  )
}
