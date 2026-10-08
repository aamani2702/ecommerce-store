import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { BRAND } from "../config";
import SearchOverlay from "./SearchOverlay";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const { count: wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api
      .get("/categories")
      .then((res) => setCategories(res.data))
      .catch(() => {});
  }, []);

  function handleLogout() {
    logout();
    navigate("/");
  }

  const linkClass = ({ isActive }) =>
    `pb-0.5 border-b ${isActive ? "text-primary border-primary" : "border-transparent hover:text-primary"}`;

  const badge = (n) =>
    n > 0 && (
      <span className="absolute -top-2 -right-4 bg-accent text-ink text-[10px] font-semibold rounded-full px-1.5 py-0.5 leading-none">
        {n}
      </span>
    );

  return (
    <>
      {/* Thin announcement bar */}
      {BRAND.announcement && (
        <div className="bg-primary text-cream text-center text-[11px] sm:text-xs tracking-widest uppercase py-2 px-3">
          {BRAND.announcement}
        </div>
      )}

      {/* Row 1: the brand name, centred */}
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

      {/* Row 2: Search on the left, links on the right (stays visible while scrolling) */}
      <nav className="sticky top-0 z-30 bg-cream/95 backdrop-blur border-y border-pastel-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 text-xs sm:text-sm uppercase tracking-widest">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            className="flex items-center gap-2 hover:text-primary shrink-0"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
            <span className="hidden sm:inline">Search</span>
          </button>

          <div className="flex flex-wrap items-center justify-end gap-x-5 sm:gap-x-8 gap-y-2">
            {/* Laptop: Shop with a drop-down menu */}
            <div
              className="relative hidden md:block"
              onMouseEnter={() => setMenuOpen(true)}
              onMouseLeave={() => setMenuOpen(false)}
            >
              <NavLink to="/shop" className={linkClass}>
                Shop
              </NavLink>
              {menuOpen && (
                <div className="absolute left-0 top-full pt-4 z-40">
                  <div className="bg-white border border-pastel-dark shadow-xl rounded-lg p-6 grid grid-cols-2 gap-10 min-w-[440px] normal-case tracking-normal text-sm">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-ink/50 mb-3">
                        Shop by category
                      </p>
                      <ul className="space-y-2">
                        {categories.map((c) => (
                          <li key={c.id}>
                            <Link
                              to={`/shop?category=${c.slug}`}
                              onClick={() => setMenuOpen(false)}
                              className="hover:text-primary"
                            >
                              {c.name}
                            </Link>
                          </li>
                        ))}
                        <li>
                          <Link
                            to="/shop"
                            onClick={() => setMenuOpen(false)}
                            className="text-primary underline"
                          >
                            View all
                          </Link>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-ink/50 mb-3">
                        Shop by occasion
                      </p>
                      <ul className="space-y-2">
                        {(BRAND.occasions || []).map((o) => (
                          <li key={o.value}>
                            <Link
                              to={`/shop?occasion=${o.value}`}
                              onClick={() => setMenuOpen(false)}
                              className="hover:text-primary"
                            >
                              {o.name}
                            </Link>
                          </li>
                        ))}
                        <li>
                          <Link
                            to="/shop?sort=popular&sold=1"
                            onClick={() => setMenuOpen(false)}
                            className="text-primary underline"
                          >
                            Bestsellers
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/shop?sale=1"
                            onClick={() => setMenuOpen(false)}
                            className="text-primary underline"
                          >
                            Sale
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Phone: plain Shop link */}
            <NavLink
              to="/shop"
              className={({ isActive }) =>
                `md:hidden ${linkClass({ isActive })}`
              }
            >
              Shop
            </NavLink>

            <Link
              to="/shop?sale=1"
              className="pb-0.5 border-b border-transparent text-primary hover:border-primary"
            >
              Sale
            </Link>

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
              to="/wishlist"
              aria-label="Wishlist"
              className="relative pb-0.5 border-b border-transparent hover:text-primary"
            >
              <span className="hidden sm:inline">Wishlist</span>
              <span className="sm:hidden text-base normal-case">♡</span>
              {badge(wishlistCount)}
            </Link>

            <Link
              to="/cart"
              className="relative pb-0.5 border-b border-transparent hover:text-primary"
            >
              Cart
              {badge(cart.itemCount)}
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
        </div>
      </nav>

      {/* The search bar sits outside the navbar so it can cover the whole screen */}
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </>
  );
}
