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
    `pb-0.5 border-b ${isActive ? "text-primary border-primary" : "border-transparent hover:text-primary"}`;

  return (
    <>
      {/* Thin announcement bar */}
      {BRAND.announcement && (
        <div className="bg-primary text-cream text-center text-[11px] sm:text-xs tracking-widest uppercase py-2 px-3">
          {BRAND.announcement}
        </div>
      )}

      {/* Row 1: the brand name, centred and smaller */}
      <div className="bg-cream text-center pt-3 pb-2 px-4">
        <Link to="/" className="inline-block">
          {BRAND.logo ? (
            <img
              src={BRAND.logo}
              alt={BRAND.name}
              className="h-12 sm:h-14 mx-auto"
            />
          ) : (
            <span className="font-brand text-4xl sm:text-5xl text-primary leading-none">
              {BRAND.name}
            </span>
          )}
        </Link>
      </div>

      {/* Row 2: the links, in the right corner (stays visible while scrolling) */}
      <nav className="sticky top-0 z-30 bg-cream/95 backdrop-blur border-y border-pastel-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-end gap-x-5 sm:gap-x-8 gap-y-2 text-xs sm:text-sm uppercase tracking-widest">
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
          <Link
            to="/cart"
            className="relative pb-0.5 border-b border-transparent hover:text-primary"
          >
            Cart
            {cart.itemCount > 0 && (
              <span className="absolute -top-2 -right-4 bg-accent text-ink text-[10px] font-semibold rounded-full px-1.5 py-0.5 leading-none">
                {cart.itemCount}
              </span>
            )}
          </Link>
          {user ? (
            <button
              onClick={handleLogout}
              className="uppercase tracking-widest hover:text-primary"
            >
              Logout
            </button>
          ) : (
            <NavLink to="/login" className={linkClass}>
              Login
            </NavLink>
          )}
        </div>
      </nav>
    </>
  );
}
