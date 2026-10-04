import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { BRAND } from "../config";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  const linkClass = ({ isActive }) =>
    isActive ? "text-primary font-semibold" : "hover:text-primary";

  return (
    <header className="bg-pastel text-ink sticky top-0 z-20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="font-heading text-3xl font-semibold tracking-wide"
        >
          {BRAND.name}
        </Link>
        <nav className="flex items-center gap-3 sm:gap-6 text-sm tracking-wide">
          <NavLink to="/shop" className={linkClass}>
            Shop
          </NavLink>
          {user?.role === "admin" && (
            <NavLink to="/admin/products" className={linkClass}>
              Admin
            </NavLink>
          )}
          {user && (
            <NavLink to="/orders" className={linkClass}>
              Orders
            </NavLink>
          )}
          <Link to="/cart" className="relative hover:text-primary">
            Cart
            {cart.itemCount > 0 && (
              <span className="absolute -top-2 -right-4 bg-accent text-ink text-xs rounded-full px-1.5">
                {cart.itemCount}
              </span>
            )}
          </Link>
          {user ? (
            <button onClick={handleLogout} className="hover:text-primary">
              Logout
            </button>
          ) : (
            <NavLink to="/login" className={linkClass}>
              Login
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
