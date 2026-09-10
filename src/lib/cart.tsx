import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type { Size } from "../data/config"
import baseMenu from "../data/menu.json"
import basePromos from "../data/promos.json"

export type Product = {
  id: string
  category: string
  categoryLabel: string
  name: string
  description: string
  prices?: Partial<Record<"S" | "D" | "T" | "C", number>>
  fixedPrice?: number
  image?: string
  active?: boolean
}

export type Promo = {
  id: string
  title: string
  description: string
  price?: number
  image?: string
  active: boolean
}

export type CatalogPayload = {
  products: Product[]
  promos: Promo[]
}

export type CartItem = {
  key: string
  productId: string
  size: Size
  qty: number
  note: string
}

type CartContextValue = {
  items: CartItem[]
  count: number
  subtotal: number
  products: Product[]
  promos: Promo[]
  loadingCatalog: boolean
  refreshCatalog: () => Promise<void>
  addItem: (productId: string, size: Size) => void
  setQty: (key: string, qty: number) => void
  setNote: (key: string, note: string) => void
  removeItem: (key: string) => void
  clear: () => void
  getProduct: (id: string) => Product | undefined
  unitPrice: (product: Product, size: Size) => number
  lineTotal: (item: CartItem) => number
}

const STORAGE_KEY = "bendito-bajon-cart"
const CartContext = createContext<CartContextValue | null>(null)

function makeKey(productId: string, size: Size) {
  return `${productId}:${size}`
}

function mergeCatalog(
  remote?: Partial<CatalogPayload> | null,
): CatalogPayload {
  const imageMap = new Map(
    (remote?.products ?? []).map((p) => [p.id, p] as const),
  )
  const baseProducts = (baseMenu as Product[]).map((item) => {
    const override = imageMap.get(item.id)
    return {
      ...item,
      ...override,
      id: item.id,
      category: override?.category ?? item.category,
      categoryLabel: override?.categoryLabel ?? item.categoryLabel,
      active: override?.active ?? true,
    }
  })
  const extra = (remote?.products ?? []).filter(
    (p) => !baseProducts.some((b) => b.id === p.id),
  )
  return {
    products: [...baseProducts, ...extra].filter((p) => p.active !== false),
    promos: (remote?.promos?.length ? remote.promos : (basePromos as Promo[])).filter(
      (p) => p.active !== false,
    ),
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as CartItem[]) : []
    } catch {
      return []
    }
  })
  const [products, setProducts] = useState<Product[]>(() => mergeCatalog().products)
  const [promos, setPromos] = useState<Promo[]>(() => mergeCatalog().promos)
  const [loadingCatalog, setLoadingCatalog] = useState(true)

  async function refreshCatalog() {
    try {
      const res = await fetch("/api/catalog", { cache: "no-store" })
      if (res.ok) {
        const data = (await res.json()) as CatalogPayload
        const merged = mergeCatalog(data)
        setProducts(merged.products)
        setPromos(merged.promos)
      }
    } catch {
      // offline / local: keep base catalog
    } finally {
      setLoadingCatalog(false)
    }
  }

  useEffect(() => {
    void refreshCatalog()
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const getProduct = (id: string) => products.find((p) => p.id === id)

  const unitPrice = (product: Product, size: Size) => {
    if (product.fixedPrice != null) return product.fixedPrice
    if (size === "U") return product.fixedPrice ?? 0
    return product.prices?.[size] ?? 0
  }

  const lineTotal = (item: CartItem) => {
    const product = getProduct(item.productId)
    if (!product) return 0
    return unitPrice(product, item.size) * item.qty
  }

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((acc, item) => acc + item.qty, 0)
    const subtotal = items.reduce((acc, item) => acc + lineTotal(item), 0)

    return {
      items,
      count,
      subtotal,
      products,
      promos,
      loadingCatalog,
      refreshCatalog,
      getProduct,
      unitPrice,
      lineTotal,
      addItem(productId, size) {
        setItems((prev) => {
          const key = makeKey(productId, size)
          const existing = prev.find((item) => item.key === key)
          if (existing) {
            return prev.map((item) =>
              item.key === key ? { ...item, qty: item.qty + 1 } : item,
            )
          }
          return [...prev, { key, productId, size, qty: 1, note: "" }]
        })
      },
      setQty(key, qty) {
        setItems((prev) =>
          prev
            .map((item) => (item.key === key ? { ...item, qty } : item))
            .filter((item) => item.qty > 0),
        )
      },
      setNote(key, note) {
        setItems((prev) =>
          prev.map((item) => (item.key === key ? { ...item, note } : item)),
        )
      },
      removeItem(key) {
        setItems((prev) => prev.filter((item) => item.key !== key))
      },
      clear() {
        setItems([])
      },
    }
  }, [items, products, promos, loadingCatalog])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider")
  return ctx
}

export const menu = baseMenu as Product[]
