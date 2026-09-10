import { useState, type FormEvent } from "react"
import { Link, Navigate } from "react-router-dom"
import { formatMoney, siteConfig, sizeLabels } from "../data/config"
import { useCart } from "../lib/cart"
import { buildWhatsAppMessage, openWhatsApp } from "../lib/whatsapp"

export function CheckoutPage() {
  const { items, subtotal, clear, getProduct, unitPrice } = useCart()
  const [name, setName] = useState("")
  const [mode, setMode] = useState<"delivery" | "pickup">("delivery")
  const [address, setAddress] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mpHint, setMpHint] = useState<string | null>(null)

  if (items.length === 0) {
    return <Navigate to="/menu" replace />
  }

  const shipping = mode === "delivery" ? siteConfig.shippingFee : 0
  const total = subtotal + shipping

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setMpHint(null)

    if (!name.trim()) {
      setError("Poné tu nombre.")
      return
    }
    if (mode === "delivery" && !address.trim()) {
      setError("Poné la dirección de envío.")
      return
    }

    setLoading(true)
    let mpLink: string | null = null

    try {
      const payload = {
        customerName: name.trim(),
        mode,
        address: address.trim(),
        shippingFee: shipping,
        items: items.map((item) => {
          const product = getProduct(item.productId)
          const title =
            item.size === "U"
              ? product?.name ?? item.productId
              : `${product?.name ?? item.productId} ${sizeLabels[item.size]}`
          return {
            id: item.productId,
            size: item.size,
            title,
            quantity: item.qty,
            unit_price: product ? unitPrice(product, item.size) : 0,
            note: item.note,
          }
        }),
      }

      const res = await fetch("/api/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        const data = (await res.json()) as { init_point?: string }
        mpLink = data.init_point ?? null
      } else {
        setMpHint(
          "MercadoPago no está configurado todavía: el pedido va igual por WhatsApp.",
        )
      }
    } catch {
      setMpHint(
        "No pudimos generar el link de pago. Seguimos por WhatsApp.",
      )
    }

    const message = buildWhatsAppMessage(
      items,
      {
        name: name.trim(),
        mode,
        address: address.trim(),
        shippingFee: shipping,
        mpLink,
      },
      getProduct,
      unitPrice,
    )

    openWhatsApp(message)
    clear()
    setLoading(false)
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-4xl font-bold text-blood">Checkout</h1>
      <p className="mt-2 text-ink/70">
        Completá los datos. Te abrimos WhatsApp con el pedido
        {mpHint ? "" : " y el link de MercadoPago si está activo"}.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <label className="block text-sm font-bold text-ink/80">
          Tu nombre
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 h-12 w-full rounded-2xl border border-blood/20 bg-white/80 px-4"
            placeholder="Rafael"
            required
          />
        </label>

        <fieldset className="space-y-3">
          <legend className="text-sm font-bold text-ink/80">Entrega</legend>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setMode("delivery")}
              className={`rounded-full px-4 py-2 text-sm font-extrabold ${
                mode === "delivery" ? "bg-blood text-white" : "bg-white/80 text-blood"
              }`}
            >
              Envío a domicilio
            </button>
            <button
              type="button"
              onClick={() => setMode("pickup")}
              className={`rounded-full px-4 py-2 text-sm font-extrabold ${
                mode === "pickup" ? "bg-blood text-white" : "bg-white/80 text-blood"
              }`}
            >
              Retiro en el local
            </button>
          </div>
        </fieldset>

        {mode === "delivery" ? (
          <label className="block text-sm font-bold text-ink/80">
            Dirección
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1 h-12 w-full rounded-2xl border border-blood/20 bg-white/80 px-4"
              placeholder="Calle y número, Ceres"
              required
            />
          </label>
        ) : null}

        <div className="rounded-3xl bg-white/75 p-5 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <strong>{formatMoney(subtotal)}</strong>
          </div>
          {mode === "delivery" ? (
            <div className="mt-2 flex justify-between">
              <span>Envío</span>
              <strong>{formatMoney(shipping)}</strong>
            </div>
          ) : null}
          <div className="mt-3 flex justify-between border-t border-blood/10 pt-3 text-base">
            <span className="font-extrabold text-blood">Total</span>
            <strong className="font-display text-2xl text-blood">
              {formatMoney(total)}
            </strong>
          </div>
        </div>

        {error ? (
          <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {error}
          </p>
        ) : null}
        {mpHint ? (
          <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
            {mpHint}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-12 w-full items-center justify-center rounded-full bg-blood text-base font-extrabold text-white transition hover:bg-blood-hot disabled:opacity-60"
        >
          {loading ? "Preparando pedido…" : "Confirmar y abrir WhatsApp"}
        </button>

        <Link to="/carrito" className="block text-center text-sm font-bold text-blood">
          Volver al carrito
        </Link>
      </form>
    </div>
  )
}
