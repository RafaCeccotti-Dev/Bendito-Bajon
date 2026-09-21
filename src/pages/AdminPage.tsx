import { useEffect, useMemo, useRef, useState, type FormEvent } from "react"
import baseMenu from "../data/menu.json"
import basePromos from "../data/promos.json"
import { burgerSizes, formatMoney, siteConfig, type Size } from "../data/config"
import type { Product, Promo } from "../lib/cart"

const TOKEN_KEY = "bendito-admin-token"

const CATEGORIES = [
  {
    id: "burgers",
    label: "BURGER'S",
    sized: true,
    createName: "Nueva hamburguesa",
  },
  {
    id: "benditas",
    label: "BENDITAS",
    sized: true,
    createName: "Nueva Bendita",
  },
  {
    id: "bajoneras",
    label: "BAJONERAS",
    sized: true,
    createName: "Nueva Bajonera",
  },
  { id: "papas", label: "PAPAS", sized: false, createName: "Nuevas papas" },
  {
    id: "postres",
    label: "POSTRES",
    sized: false,
    createName: "Nuevo postre",
  },
  {
    id: "bebidas",
    label: "BEBIDAS",
    sized: false,
    createName: "Nueva bebida",
  },
] as const

const DEFAULT_SIZED_PRICES = { S: 12000, D: 15000, T: 18000, C: 20000 }

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error("No se pudo leer el archivo"))
    reader.readAsDataURL(file)
  })
}

function mergeProductsFromCatalog(remote: Product[] | undefined): Product[] {
  const map = new Map((remote ?? []).map((p) => [p.id, p] as const))
  const base = (baseMenu as Product[]).map((p) => ({
    ...p,
    ...map.get(p.id),
    id: p.id,
    active: map.get(p.id)?.active ?? true,
  }))
  const extras = (remote ?? []).filter((p) => !base.some((b) => b.id === p.id))
  return [...base, ...extras]
}

function PhotoFields({
  image,
  onUrlChange,
  onFile,
  inputId,
  compact = false,
}: {
  image?: string
  onUrlChange: (url: string) => void
  onFile: (file: File) => void
  inputId: string
  compact?: boolean
}) {
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <div className="mt-3 space-y-2">
      {image ? (
        <div
          className={`overflow-hidden rounded-2xl bg-ink/5 ${
            compact
              ? "mx-auto h-36 w-36 sm:h-40 sm:w-40"
              : "aspect-square w-full max-h-56"
          }`}
        >
          <img
            src={image}
            alt=""
            className="h-full w-full object-cover object-center"
          />
        </div>
      ) : (
        <div
          className={`flex items-center justify-center rounded-2xl bg-sky/20 text-sm font-bold text-blood/70 ${
            compact
              ? "mx-auto h-36 w-36 sm:h-40 sm:w-40"
              : "aspect-square w-full max-h-56"
          }`}
        >
          Sin foto
        </div>
      )}
      <label className="block text-sm font-bold text-ink/70">
        URL de la foto
        <input
          value={image || ""}
          onChange={(e) => onUrlChange(e.target.value)}
          className="mt-1 h-10 w-full rounded-xl border border-blood/15 bg-white px-3 text-sm"
          placeholder="https://... o /menu/..."
        />
      </label>
      <input
        ref={fileRef}
        id={inputId}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onFile(file)
          e.target.value = ""
        }}
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className={`inline-flex h-10 items-center justify-center rounded-full border border-blood/25 bg-white text-sm font-extrabold text-blood transition hover:bg-blood hover:text-white ${
          compact ? "w-full max-w-xs" : "w-full"
        }`}
      >
        Seleccionar foto
      </button>
    </div>
  )
}

export function AdminPage() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "")
  const [password, setPassword] = useState("")
  const [products, setProducts] = useState<Product[]>(baseMenu as Product[])
  const [promos, setPromos] = useState<Promo[]>(basePromos as Promo[])
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [activeCat, setActiveCat] =
    useState<(typeof CATEGORIES)[number]["id"]>("burgers")

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
          setProducts(mergeProductsFromCatalog(data.products))
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

  function updateProduct(id: string, patch: Partial<Product>) {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    )
  }

  async function uploadImage(id: string, file: File, kind: "product" | "promo") {
    setStatus(`Subiendo foto…`)
    setError(null)
    const dataUrl = await fileToDataUrl(file)
    const uploadId = kind === "promo" ? `promo-${id}` : id
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ id: uploadId, dataUrl }),
    })
    const data = (await res.json()) as { url?: string; error?: string }
    if (!res.ok || !data.url) {
      setError(data.error || "Error al subir")
      setStatus(null)
      return
    }
    if (kind === "promo") {
      setPromos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, image: data.url } : p)),
      )
    } else {
      updateProduct(id, { image: data.url })
    }
    setStatus("Foto lista — acordate de Guardar cambios")
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

  function addProduct(categoryId: (typeof CATEGORIES)[number]["id"]) {
    const cat = CATEGORIES.find((c) => c.id === categoryId)!
    const stamp = Date.now()
    const id = `${categoryId}-${stamp}`
    const product: Product = {
      id,
      category: cat.id,
      categoryLabel: cat.label,
      name: cat.createName,
      description: "Descripción del producto",
      image: "",
      active: true,
      ...(cat.sized
        ? { prices: { ...DEFAULT_SIZED_PRICES } }
        : { fixedPrice: 4000 }),
    }
    setProducts((prev) => [...prev, product])
    setActiveCat(categoryId)
    setStatus(`Agregado: ${cat.createName}. Completá datos y Guardá cambios.`)
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

  function removeProduct(id: string) {
    const isBase = (baseMenu as Product[]).some((p) => p.id === id)
    if (isBase) {
      updateProduct(id, { active: false })
      setStatus("Producto ocultado del menú (Guardá cambios)")
      return
    }
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  const visibleInCat = products.filter(
    (p) => p.category === activeCat && p.active !== false,
  )
  const currentCat = CATEGORIES.find((c) => c.id === activeCat)!

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
            Creá productos, subí fotos y armá promos.
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
              Agregá hamburguesas, papas, postres, bebidas y promos. Foto por URL
              o archivo.
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-bold text-blood">
              Menú
            </h2>
            <button
              type="button"
              onClick={() => addProduct(activeCat)}
              className="h-10 rounded-full bg-halo px-4 text-sm font-extrabold text-ink"
            >
              + Agregar en {currentCat.label}
            </button>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCat(cat.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-extrabold transition ${
                  activeCat === cat.id
                    ? "bg-blood text-white"
                    : "bg-white/70 text-blood hover:bg-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {visibleInCat.map((product) => (
              <article
                key={product.id}
                className="rounded-3xl border border-white/70 bg-white/75 p-4"
              >
                <PhotoFields
                  image={product.image}
                  inputId={`file-${product.id}`}
                  onUrlChange={(url) => updateProduct(product.id, { image: url })}
                  onFile={(file) => void uploadImage(product.id, file, "product")}
                />

                <label className="mt-3 block text-sm font-bold text-ink/70">
                  Nombre
                  <input
                    value={product.name}
                    onChange={(e) =>
                      updateProduct(product.id, { name: e.target.value })
                    }
                    className="mt-1 h-11 w-full rounded-xl border border-blood/15 bg-white px-3 font-display text-xl font-bold text-blood"
                  />
                </label>

                <label className="mt-2 block text-sm font-bold text-ink/70">
                  Descripción
                  <textarea
                    value={product.description}
                    onChange={(e) =>
                      updateProduct(product.id, { description: e.target.value })
                    }
                    className="mt-1 min-h-20 w-full rounded-xl border border-blood/15 bg-white px-3 py-2 text-sm"
                  />
                </label>

                {product.prices ? (
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {burgerSizes.map((size: Size) => (
                      <label
                        key={size}
                        className="text-center text-xs font-bold text-ink/70"
                      >
                        {size}
                        <input
                          type="number"
                          value={product.prices?.[size] ?? 0}
                          onChange={(e) =>
                            updateProduct(product.id, {
                              prices: {
                                ...product.prices,
                                [size]: Number(e.target.value) || 0,
                              },
                            })
                          }
                          className="mt-1 h-9 w-full rounded-lg border border-blood/15 bg-white px-1 text-center text-sm"
                        />
                      </label>
                    ))}
                  </div>
                ) : (
                  <label className="mt-3 block text-sm font-bold text-ink/70">
                    Precio
                    <input
                      type="number"
                      value={product.fixedPrice ?? 0}
                      onChange={(e) =>
                        updateProduct(product.id, {
                          fixedPrice: Number(e.target.value) || 0,
                        })
                      }
                      className="mt-1 h-10 w-full rounded-xl border border-blood/15 bg-white px-3"
                    />
                    <span className="mt-1 block text-xs font-normal text-ink/50">
                      {formatMoney(product.fixedPrice ?? 0)}
                    </span>
                  </label>
                )}

                <button
                  type="button"
                  onClick={() => removeProduct(product.id)}
                  className="mt-3 text-sm font-bold text-blood-hot"
                >
                  {(baseMenu as Product[]).some((b) => b.id === product.id)
                    ? "Ocultar del menú"
                    : "Eliminar"}
                </button>
              </article>
            ))}
          </div>

          {visibleInCat.length === 0 ? (
            <p className="mt-6 rounded-2xl bg-white/60 px-4 py-6 text-center text-sm font-bold text-ink/60">
              No hay productos en {currentCat.label}. Tocá “+ Agregar”.
            </p>
          ) : null}
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
                <PhotoFields
                  image={promo.image}
                  inputId={`promo-file-${promo.id}`}
                  compact
                  onUrlChange={(url) =>
                    setPromos((prev) =>
                      prev.map((p) =>
                        p.id === promo.id ? { ...p, image: url } : p,
                      ),
                    )
                  }
                  onFile={(file) => void uploadImage(promo.id, file, "promo")}
                />
                <input
                  value={promo.title}
                  onChange={(e) =>
                    setPromos((prev) =>
                      prev.map((p) =>
                        p.id === promo.id ? { ...p, title: e.target.value } : p,
                      ),
                    )
                  }
                  className="mt-3 h-11 w-full rounded-xl border border-blood/15 bg-white px-3 font-display text-xl font-bold text-blood"
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
