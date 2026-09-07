import { BrowserRouter, Route, Routes } from "react-router-dom"
import { Shell } from "./components/Shell"
import { CartProvider } from "./lib/cart"
import { CartPage } from "./pages/CartPage"
import { CheckoutPage } from "./pages/CheckoutPage"
import { HomePage } from "./pages/HomePage"
import { MenuPage } from "./pages/MenuPage"

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Shell>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/carrito" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
          </Routes>
        </Shell>
      </BrowserRouter>
    </CartProvider>
  )
}
