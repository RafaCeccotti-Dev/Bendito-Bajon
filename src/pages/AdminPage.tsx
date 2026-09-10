import { useEffect, useMemo, useState, type FormEvent } from "react"
import baseMenu from "../data/menu.json"
import basePromos from "../data/promos.json"
import { formatMoney, siteConfig } from "../data/config"
import type { Product, Promo } from "../lib/cart"

const TOKEN_KEY = "bendito-admin-token"

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error("No se pudo leer el archivo"))
    reader.readAsDataURL(file)
  })
}

export function AdminPage() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "")
  const [password, setPassword] = useState("")
  const [products, setProducts] = useState<Product[]>(baseMenu as Product[])
  const [promos, setPromos] = useState<Promo[]>(basePromos as Promo[])
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const authHeaders = useMemo(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    [token],
  )

  useEffect(() => {
    if (!token) return
    void (async () => {
      try {
        const res = await fetch("/api/catalog", { cache: "no-store" })
        if (!res.ok) return
        const data = (await res.json()) as {
          products?: Product[]
          promos?: Promo[]
        }
        if (data.products?.length) {
          const map = new Map(data.products.map((p) => [p.id, p]))
          setProducts(
            (baseMenu as Product[]).map((p) => ({ ...p, ...map.get(p.id) })),
          )
        }
        if (data.promos?.length) setPromos(data.promos)
      } catch {
        // keep base
      }
    })()
  }, [token])

  async function login(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    })
    const data = (await res.json()) as { token?: string; error?: string }
    if (!res.ok || !data.token) {
      setError(data.error || "No se pudo entrar")
      return
    }
    localStorage.setItem(TOKEN_KEY, data.token)
    setToken(data.token)
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    setToken("")
  }

  async function uploadImage(id: string, file: File) {
    setStatus(`Subiendo imagen de ${id}…`)
    setError(null)
    const dataUrl = await fileToDataUrl(file)
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ id, dataUrl }),
    })
    const data = (await res.json()) as { url?: string; error?: string }
    if (!res.ok || !data.url) {
      setError(data.error || "Error al subir")
      setStatus(null)
      return
    }
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, image: data.url } : p)),
    )
    setStatus("Imagen lista (acordate de Guardar cambios)")
  }

  async function uploadPromoImage(id: string, file: File) {
    setStatus(`Subiendo promo ${id}…`)
    setError(null)
    const dataUrl = await fileToDataUrl(file)
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ id: `promo-${id}`, dataUrl }),
    })
    const data = (await res.json()) as { url?: string; error?: string }
    if (!res.ok || !data.url) {
      setError(data.error || "Error al subir")
      setStatus(null)
      return
    }
    setPromos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, image: data.url } : p)),
    )
    setStatus("Imagen de promo lista (Guardar cambios)")
  }

  async function saveAll() {
    setSaving(true)
    setError(null)
    setStatus(null)
    const res = await fetch("/api/admin/save", {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({ products, promos }),
    })
    const data = (await res.json()) as { error?: string; ok?: boolean }
    setSaving(false)
    if (!res.ok) {
      setError(data.error || "No se pudo guardar")
      return
    }
    setStatus("Guardado ✓ Ya se ve en la web")
  }

  function addPromo() {
    const id = `promo-${Date.now()}`
    setPromos((prev) => [
      ...prev,
      {
        id,
        title: "Nueva promo",
        description: "Descripción de la promo",
        price: 0,
        image: "",
        active: true,
      },
    ])
  }

  if (!token) {
    return (
      <div className="sky-bg flex min-h-dvh items-center justify-center px-4">
        <form
          onSubmit={login}
          className="w-full max-w-md rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-lg backdrop-blur"
        >
          <img
            src={siteConfig.mascotSrc}
            alt=""
            className="mx-auto h-20 w-20 rounded-full object-cover"
          />
          <h1 className="mt-4 text-center font-display text-3xl font-bold text-blood">
            Panel Bendito
          </h1>
          <p className="mt-2 text-center text-sm text-ink/65">
            Solo el dueño. Fotos, precios extras y promos.
          </p>
          <label className="mt-6 block text-sm font-bold text-ink/80">
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 h-12 w-full rounded-2xl border border-blood/20 bg-white px-4"
              required
            />
          </label>
          {error ? (
            <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-full bg-blood font-extrabold text-white"
          >
            Entrar
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="sky-bg min-h-dvh px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-4xl font-bold text-blood">
              Panel del dueño
            </h1>
            <p className="mt-1 text-sm text-ink/65">
              Subí fotos a hamburguesas / papas / postres / bebidas y armá promos.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void saveAll()}
              disabled={saving}
              className="h-11 rounded-full bg-blood px-5 text-sm font-extrabold text-white disabled:opacity-60"
            >
              {saving ? "Guardando…" : "Guardar cambios"}
            </button>
            <button
              type="button"
              onClick={logout}
              className="h-11 rounded-full border border-blood/25 bg-white/70 px-5 text-sm font-bold text-blood"
            >
              Salir
            </button>
          </div>
        </div>

        {status ? (
          <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
            {status}
          </p>
        ) : null}
        {error ? (
          <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {error}
          </p>
        ) : null}

        <section className="mt-8">
          <h2 className="font-display text-2xl font-bold text-blood">Productos</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {products.map((product) => (
              <article
                key={product.id}
                className="rounded-3xl border border-white/70 bg-white/75 p-4"
              >
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="mb-3 h-36 w-full rounded-2xl object-cover"
                  />
                ) : (
                  <div className="mb-3 flex h-28 items-center justify-center rounded-2xl bg-sky/20 text-sm font-bold text-blood/70">
                    Sin foto
                  </div>
                )}
                <p className="text-xs font-bold uppercase tracking-wide text-blood/60">
                  {product.categoryLabel}
                </p>
                <h3 className="font-display text-xl font-bold text-blood">
                  {product.name}
                </h3>
                <p className="mt-1 text-xs text-ink/55">
                  {product.fixedPrice != null
                    ? formatMoney(product.fixedPrice)
                    : "Precios S/D/T/C"}
                </p>
                {product.fixedPrice != null ? (
                  <label className="mt-2 block text-sm font-bold text-ink/70">
                    Precio
                    <input
                      type="number"
                      value={product.fixedPrice}
                      onChange={(e) =>
                        setProducts((prev) =>
                          prev.map((p) =>
                            p.id === product.id
                              ? {
                                  ...p,
                                  fixedPrice: Number(e.target.value) || 0,
                                }
                              : p,
                          ),
                        )
                      }
                      className="mt-1 h-10 w-full rounded-xl border border-blood/15 bg-white px-3"
                    />
                  </label>
                ) : null}
                <label className="mt-3 block text-sm font-bold text-ink/70">
                  Subir imagen
                  <input
                    type="file"
                    accept="image/*"
                    className="mt-1 block w-full text-xs"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) void uploadImage(product.id, file)
                    }}
                  />
                </label>
                <label className="mt-3 block text-sm font-bold text-ink/70">
                  O pegá URL de imagen
                  <input
                    value={product.image || ""}
                    onChange={(e) =>
                      setProducts((prev) =>
                        prev.map((p) =>
                          p.id === product.id
                            ? { ...p, image: e.target.value }
                            : p,
                        ),
                      )
                    }
                    className="mt-1 h-10 w-full rounded-xl border border-blood/15 bg-white px-3 text-sm"
                    placeholder="https://..."
                  />
                </label>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 pb-16">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-bold text-blood">Promos</h2>
            <button
              type="button"
              onClick={addPromo}
              className="h-10 rounded-full bg-halo px-4 text-sm font-extrabold text-ink"
            >
              + Nueva promo
            </button>
          </div>
          <div className="mt-4 space-y-4">
            {promos.map((promo) => (
              <article
                key={promo.id}
                className="rounded-3xl border border-white/70 bg-white/75 p-4"
              >
                {promo.image ? (
                  <img
                    src={promo.image}
                    alt={promo.title}
                    className="mb-3 h-36 w-full rounded-2xl object-cover"
                  />
                ) : null}
                <input
                  value={promo.title}
                  onChange={(e) =>
                    setPromos((prev) =>
                      prev.map((p) =>
                        p.id === promo.id ? { ...p, title: e.target.value } : p,
                      ),
                    )
                  }
                  className="h-11 w-full rounded-xl border border-blood/15 bg-white px-3 font-display text-xl font-bold text-blood"
                />
                <textarea
                  value={promo.description}
                  onChange={(e) =>
                    setPromos((prev) =>
                      prev.map((p) =>
                        p.id === promo.id
                          ? { ...p, description: e.target.value }
                          : p,
                      ),
                    )
                  }
                  className="mt-2 min-h-20 w-full rounded-xl border border-blood/15 bg-white px-3 py-2 text-sm"
                />
                <div className="mt-2 flex flex-wrap gap-3">
                  <label className="text-sm font-bold text-ink/70">
                    Precio
                    <input
                      type="number"
                      value={promo.price ?? 0}
                      onChange={(e) =>
                        setPromos((prev) =>
                          prev.map((p) =>
                            p.id === promo.id
                              ? { ...p, price: Number(e.target.value) || 0 }
                              : p,
                          ),
                        )
                      }
                      className="ml-2 h-10 w-28 rounded-xl border border-blood/15 bg-white px-2"
                    />
                  </label>
                  <label className="flex items-center gap-2 text-sm font-bold text-ink/70">
                    <input
                      type="checkbox"
                      checked={promo.active}
                      onChange={(e) =>
                        setPromos((prev) =>
                          prev.map((p) =>
                            p.id === promo.id
                              ? { ...p, active: e.target.checked }
                              : p,
                          ),
                        )
                      }
                    />
                    Activa
                  </label>
                </div>
                <label className="mt-3 block text-sm font-bold text-ink/70">
                  Imagen promo
                  <input
                    type="file"
                    accept="image/*"
                    className="mt-1 block w-full text-xs"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) void uploadPromoImage(promo.id, file)
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setPromos((prev) => prev.filter((p) => p.id !== promo.id))
                  }
                  className="mt-3 text-sm font-bold text-blood-hot"
                >
                  Eliminar promo
                </button>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
