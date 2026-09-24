import { useEffect, useState, type FormEvent } from "react"
import { Link, Navigate, useSearchParams } from "react-router-dom"
import { formatMoney, siteConfig, sizeLabels } from "../data/config"
import { useCart } from "../lib/cart"
import {
  buildOrderFromCart,
  buildWhatsAppMessage,
  buildWhatsAppMessageFromOrder,
  clearPaidWhatsAppUrl,
  clearPendingOrder,
  loadPaidWhatsAppUrl,
  loadPendingOrder,
  openWhatsApp,
  savePaidWhatsAppUrl,
  savePendingOrder,
  whatsappUrl,
} from "../lib/whatsapp"
import { decorateSlots, type OrderSlot } from "../lib/slots"

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
  const [slot, setSlot] = useState("")
  const [slots, setSlots] = useState<OrderSlot[]>(() => decorateSlots().slots)
  const [loading, setLoading] = useState<"mp" | "wpp" | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [mpStatus, setMpStatus] = useState<MpStatus | null>(null)
  const mpResult = params.get("mp")
  const paymentId =
    params.get("payment_id") || params.get("collection_id") || ""
  const [paidWhatsApp, setPaidWhatsApp] = useState<string | null>(() =>
    mpResult === "success" ? loadPaidWhatsAppUrl() : null,
  )

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
    void fetch("/api/slots")
      .then((r) => r.json())
      .then((data: { slots?: OrderSlot[] }) => {
        if (Array.isArray(data.slots) && data.slots.length) {
          setSlots(data.slots)
        }
      })
      .catch(() => {
        setSlots(decorateSlots().slots)
      })
  }, [])

  useEffect(() => {
    if (mpResult !== "success") return
    clear()

    const existing = loadPaidWhatsAppUrl()
    const order = loadPendingOrder()
    const url =
      existing ||
      (order
        ? whatsappUrl(
            buildWhatsAppMessageFromOrder(order, {
              paid: true,
              paymentId: paymentId || undefined,
            }),
          )
        : null)

    if (!url) return
    savePaidWhatsAppUrl(url)
    setPaidWhatsApp(url)
    clearPendingOrder()
    window.location.assign(url)
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
      slot,
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
    if (!slot) {
      setError("Elegí el horario del pedido.")
      return false
    }
    const chosen = slots.find((s) => s.time === slot)
    if (chosen && !chosen.available) {
      setError("Ese horario ya no está disponible. Elegí otro.")
      return false
    }
    return true
  }

  async function reserveSlot() {
    try {
      const res = await fetch("/api/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slot }),
      })
      const data = (await res.json()) as {
        error?: string
        slots?: OrderSlot[]
      }
      if (Array.isArray(data.slots)) setSlots(data.slots)
      if (!res.ok) {
        setError(data.error || "No se pudo reservar ese horario.")
        return false
      }
    } catch {
      // En local (Vite) no hay API; el pedido igual sale.
    }
    return true
  }

  async function payWithMercadoPago(event: FormEvent) {
    event.preventDefault()
    setError(null)
    if (!validate()) return

    setLoading("mp")
    if (!(await reserveSlot())) {
      setLoading(null)
      return
    }
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

      clearPaidWhatsAppUrl()
      savePendingOrder(
        buildOrderFromCart(
          items,
          {
            name: name.trim(),
            mode,
            address: address.trim(),
            shippingFee: shipping,
            slot,
          },
          getProduct,
          unitPrice,
        ),
      )
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
    if (!(await reserveSlot())) {
      setLoading(null)
      return
    }
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
        slot,
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
        ? paidWhatsApp
          ? "Pago listo. Te estamos abriendo el WhatsApp de Bendito Bajón con el pedido."
          : "¡Pago recibido! Ya figura en MercadoPago."
        : mpResult === "pending"
          ? "Tu pago quedó pendiente. Cuando se acredite, confirmamos el pedido."
          : "El pago no se completó. Podés intentar de nuevo o pedir por WhatsApp."
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
        <h1 className="font-display text-4xl font-bold text-blood">
          {mpResult === "success" ? "Pago listo" : "MercadoPago"}
        </h1>
        <p className="mt-3 text-ink/70">{copy}</p>
        {mpResult === "success" && paidWhatsApp ? (
          <>
            <p className="mt-2 text-sm text-ink/50">
              Si no se abre solo, tocá el botón.
            </p>
            <a
              href={paidWhatsApp}
              className="mt-6 inline-flex h-12 items-center rounded-full bg-blood px-6 font-extrabold text-white"
            >
              Abrir WhatsApp con el pedido
            </a>
          </>
        ) : (
          <Link
            to="/menu"
            className="mt-8 inline-flex h-12 items-center rounded-full bg-blood px-6 font-extrabold text-white"
          >
            Volver al menú
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-4xl font-bold text-blood">Checkout</h1>
      <p className="mt-2 text-ink/70">
        Completá los datos. <strong>Pagar con MercadoPago</strong> cobra el
        pedido y, si el pago sale, te abre el WhatsApp del local con el pedido
        ya pagado.
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

        <fieldset className="space-y-3">
          <legend className="text-sm font-bold text-ink/80">Horario</legend>
          <p className="text-sm text-ink/60">
            De 21 a 23 hs, cada 15 minutos. Delivery o retiro, misma ventana.
          </p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {slots
              .filter((option) => option.reason !== "past")
              .map((option) => {
              const open = option.available
              return (
                <button
                  key={option.time}
                  type="button"
                  disabled={!open}
                  onClick={() => setSlot(option.time)}
                  className={`rounded-2xl border px-2 py-3 text-center text-sm font-extrabold transition ${
                    !open
                      ? "cursor-not-allowed border-blood/10 bg-white/40 text-ink/30"
                      : slot === option.time
                        ? "border-blood bg-blood text-white"
                        : "border-blood/15 bg-white/80 text-blood hover:border-blood/40"
                  }`}
                >
                  {option.time}
                  {!open ? (
                    <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-wide">
                      Completo
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
          {slots.every((s) => !s.available) ? (
            <p className="text-sm font-bold text-blood/80">
              Hoy no quedan horarios. Mañana de 21 a 23 hs.
            </p>
          ) : null}
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
