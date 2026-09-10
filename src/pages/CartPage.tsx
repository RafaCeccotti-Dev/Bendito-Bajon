import { Link } from "react-router-dom"
import { formatMoney, sizeLabels } from "../data/config"
import { useCart } from "../lib/cart"

export function CartPage() {
  const {
    items,
    subtotal,
    setQty,
    setNote,
    removeItem,
    getProduct,
    unitPrice,
    lineTotal,
  } = useCart()

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
        <h1 className="font-display text-4xl font-bold text-blood">Carrito vacío</h1>
        <p className="mt-3 text-ink/70">Sumá alguna smash desde el menú.</p>
        <Link
          to="/menu"
          className="mt-8 inline-flex h-12 items-center rounded-full bg-blood px-6 font-extrabold text-white"
        >
          Ir al menú
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-4xl font-bold text-blood">Tu carrito</h1>
      <div className="mt-8 space-y-4">
        {items.map((item) => {
          const product = getProduct(item.productId)
          if (!product) return null
          const label =
            item.size === "U"
              ? product.name
              : `${product.name} · ${sizeLabels[item.size]}`
          return (
            <div
              key={item.key}
              className="rounded-3xl border border-white/70 bg-white/70 p-5 shadow-sm backdrop-blur"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl font-bold text-blood">
                    {label}
                  </h2>
                  <p className="mt-1 text-sm text-ink/65">
                    {formatMoney(unitPrice(product, item.size))} c/u
                  </p>
                </div>
                <p className="font-extrabold text-blood">
                  {formatMoney(lineTotal(item))}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <label className="text-sm font-bold text-ink/70">
                  Cant.
                  <input
                    type="number"
                    min={1}
                    value={item.qty}
                    onChange={(e) => setQty(item.key, Number(e.target.value) || 1)}
                    className="ml-2 h-10 w-16 rounded-xl border border-blood/20 bg-cloud px-2"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => removeItem(item.key)}
                  className="text-sm font-bold text-blood-hot underline-offset-2 hover:underline"
                >
                  Quitar
                </button>
              </div>

              <label className="mt-4 block text-sm font-bold text-ink/70">
                Nota (opcional)
                <input
                  value={item.note}
                  onChange={(e) => setNote(item.key, e.target.value)}
                  placeholder="Ej: SIN MANTECA"
                  className="mt-1 h-11 w-full rounded-xl border border-blood/20 bg-cloud px-3 font-semibold"
                />
              </label>
            </div>
          )
        })}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-blood px-5 py-5 text-white">
        <div>
          <p className="text-sm opacity-80">Subtotal</p>
          <p className="font-display text-3xl font-bold">{formatMoney(subtotal)}</p>
        </div>
        <Link
          to="/checkout"
          className="inline-flex h-12 items-center rounded-full bg-halo px-6 text-sm font-extrabold text-ink"
        >
          Continuar
        </Link>
      </div>
    </div>
  )
}
