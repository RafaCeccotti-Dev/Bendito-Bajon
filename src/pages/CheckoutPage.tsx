import { useEffect, useState, type FormEvent } from "react"
import { Link, Navigate, useSearchParams } from "react-router-dom"
import { formatMoney, siteConfig, sizeLabels } from "../data/config"
import { useCart } from "../lib/cart"
import { buildWhatsAppMessage, openWhatsApp } from "../lib/whatsapp"

type MpStatus = {
  configured: boolean
  message: string
}

export function CheckoutPage() {
  const { items, subtotal, clear, getProduct, unitPrice } = useCart()
  const [params] = useSearchParams()
  const [name, setName] = useState("")
  const [mode, setMode] = useState<"delivery" | "pickup">("delivery")
  const [address, setAddress] = useState("")
  const [loading, setLoading] = useState<"mp" | "wpp" | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [mpStatus, setMpStatus] = useState<MpStatus | null>(null)
  const mpResult = params.get("mp")

  useEffect(() => {
    void fetch("/api/mp-status")
      .then((r) => r.json())
      .then((data: MpStatus) => setMpStatus(data))
      .catch(() =>
        setMpStatus({
          configured: false,
          message: "No se pudo verificar MercadoPago.",
        }),
      )
  }, [])

  useEffect(() => {
    if (mpResult === "success") clear()
    // clear cambia de identidad al vaciar el carrito; solo nos importa el resultado de MP
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mpResult])

  if (items.length === 0 && !mpResult) {
    return <Navigate to="/menu" replace />
  }

  const shipping = mode === "delivery" ? siteConfig.shippingFee : 0
  const total = subtotal + shipping

  function buildPayload() {
    return {
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
  }

  function validate() {
    if (!name.trim()) {
      setError("Poné tu nombre.")
      return false
    }
    if (mode === "delivery" && !address.trim()) {
      setError("Poné la dirección de envío.")
      return false
    }
    return true
  }

  async function payWithMercadoPago(event: FormEvent) {
    event.preventDefault()
    setError(null)
    if (!validate()) return

    setLoading("mp")
    try {
      const res = await fetch("/api/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      })
      const data = (await res.json()) as {
        init_point?: string
        sandbox_init_point?: string
        error?: string
      }

      if (!res.ok || (!data.init_point && !data.sandbox_init_point)) {
        setError(
          data.error ||
            "No se pudo crear el pago en MercadoPago. Revisá el Access Token.",
        )
        setLoading(null)
        return
      }

      const checkoutUrl = data.init_point || data.sandbox_init_point
      if (!checkoutUrl) {
        setError("MercadoPago no devolvió link de pago.")
        setLoading(null)
        return
      }

      window.location.href = checkoutUrl
    } catch {
      setError("Error de red al conectar con MercadoPago.")
      setLoading(null)
    }
  }

  async function sendWhatsAppOnly(event: FormEvent) {
    event.preventDefault()
    setError(null)
    if (!validate()) return

    setLoading("wpp")
    let mpLink: string | null = null

    if (mpStatus?.configured) {
      try {
        const res = await fetch("/api/create-preference", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildPayload()),
        })
        if (res.ok) {
          const data = (await res.json()) as {
            init_point?: string
            sandbox_init_point?: string
          }
          mpLink = data.init_point || data.sandbox_init_point || null
        }
      } catch {
        // sigue por WhatsApp sin link
      }
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
    setLoading(null)
  }

  if (mpResult) {
    const copy =
      mpResult === "success"
        ? "¡Pago recibido! Ya figura en MercadoPago. Si querés, también podés avisar al local por WhatsApp."
        : mpResult === "pending"
          ? "Tu pago quedó pendiente. Cuando se acredite, confirmamos el pedido."
          : "El pago no se completó. Podés intentar de nuevo o pedir por WhatsApp."
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
        <h1 className="font-display text-4xl font-bold text-blood">
          {mpResult === "success" ? "Listo" : "MercadoPago"}
        </h1>
        <p className="mt-3 text-ink/70">{copy}</p>
        <Link
          to="/menu"
          className="mt-8 inline-flex h-12 items-center rounded-full bg-blood px-6 font-extrabold text-white"
        >
          Volver al menú
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-4xl font-bold text-blood">Checkout</h1>
      <p className="mt-2 text-ink/70">
        Completá los datos. <strong>Pagar con MercadoPago</strong> te lleva
        directo al cobro. El otro botón manda el pedido por WhatsApp.
      </p>

      <div
        className={`mt-5 rounded-2xl px-4 py-3 text-sm font-bold ${
          mpStatus?.configured
            ? "bg-emerald-50 text-emerald-800"
            : "bg-amber-50 text-amber-900"
        }`}
      >
        {mpStatus
          ? mpStatus.configured
            ? "MercadoPago activo ✓"
            : "MercadoPago pendiente: falta cargar MP_ACCESS_TOKEN en Cloudflare. Mientras tanto podés pedir por WhatsApp."
          : "Verificando MercadoPago…"}
      </div>

      <form className="mt-8 space-y-5">
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

        <button
          type="button"
          disabled={loading !== null || !mpStatus?.configured}
          onClick={(e) => void payWithMercadoPago(e)}
          className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#009EE3] text-base font-extrabold text-white transition hover:brightness-110 disabled:opacity-50"
        >
          {loading === "mp" ? "Abriendo MercadoPago…" : "Pagar con MercadoPago"}
        </button>

        <button
          type="button"
          disabled={loading !== null}
          onClick={(e) => void sendWhatsAppOnly(e)}
          className="inline-flex h-12 w-full items-center justify-center rounded-full bg-blood text-base font-extrabold text-white transition hover:bg-blood-hot disabled:opacity-60"
        >
          {loading === "wpp" ? "Abriendo WhatsApp…" : "Confirmar por WhatsApp"}
        </button>

        <Link to="/carrito" className="block text-center text-sm font-bold text-blood">
          Volver al carrito
        </Link>
      </form>
    </div>
  )
}
