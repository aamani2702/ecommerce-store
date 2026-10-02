import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import Register from "./pages/Register";

function Placeholder({ title }) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <h1 className="text-3xl">{title}</h1>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Navbar />
          <main className="min-h-[70vh]">
            <Routes>
              <Route path="/" element={<Placeholder title="Home" />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              {/* More routes are added in the next phases */}
            </Routes>
          </main>
          <Footer />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
