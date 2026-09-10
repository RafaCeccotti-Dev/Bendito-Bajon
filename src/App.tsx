import { BrowserRouter, Route, Routes } from "react-router-dom"
import type { ReactNode } from "react"
import { Shell } from "./components/Shell"
import { CartProvider } from "./lib/cart"
import { AdminPage } from "./pages/AdminPage"
import { CartPage } from "./pages/CartPage"
import { CheckoutPage } from "./pages/CheckoutPage"
import { HomePage } from "./pages/HomePage"
import { MenuPage } from "./pages/MenuPage"

function WithShell({ children }: { children: ReactNode }) {
  return <Shell>{children}</Shell>
}

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/admin" element={<AdminPage />} />
          <Route
            path="/"
            element={
              <WithShell>
                <HomePage />
              </WithShell>
            }
          />
          <Route
            path="/menu"
            element={
              <WithShell>
                <MenuPage />
              </WithShell>
            }
          />
          <Route
            path="/carrito"
            element={
              <WithShell>
                <CartPage />
              </WithShell>
            }
          />
          <Route
            path="/checkout"
            element={
              <WithShell>
                <CheckoutPage />
              </WithShell>
            }
          />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  )
}
