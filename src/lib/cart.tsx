import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type { Size } from "../data/config"
import menu from "../data/menu.json"

export type Product = (typeof menu)[number]

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
  addItem: (productId: string, size: Size) => void
  setQty: (key: string, qty: number) => void
  setNote: (key: string, note: string) => void
  removeItem: (key: string) => void
  clear: () => void
  getProduct: (id: string) => Product | undefined
  lineTotal: (item: CartItem) => number
}

const STORAGE_KEY = "bendito-bajon-cart"
const CartContext = createContext<CartContextValue | null>(null)

function makeKey(productId: string, size: Size) {
  return `${productId}:${size}`
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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const getProduct = (id: string) => menu.find((p) => p.id === id)

  const lineTotal = (item: CartItem) => {
    const product = getProduct(item.productId)
    if (!product) return 0
    return product.prices[item.size] * item.qty
  }

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((acc, item) => acc + item.qty, 0)
    const subtotal = items.reduce((acc, item) => acc + lineTotal(item), 0)

    return {
      items,
      count,
      subtotal,
      getProduct,
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
  }, [items])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider")
  return ctx
}

export { menu }
