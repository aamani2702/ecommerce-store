import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminProductImages from "./pages/admin/AdminProductImages";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminOrders from "./pages/admin/AdminOrders";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Navbar />
          <main className="min-h-[70vh]">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/cart"
                element={
                  <ProtectedRoute>
                    <Cart />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders/:id"
                element={
                  <ProtectedRoute>
                    <OrderDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/products"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminProducts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/products/:id/images"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminProductImages />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/categories"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminCategories />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/orders"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminOrders />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
