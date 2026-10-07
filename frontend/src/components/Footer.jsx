import { Link } from "react-router-dom";
import { BRAND } from "../config";

export default function Footer() {
  return (
    <footer className="bg-sand border-t border-pastel-dark mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12 grid gap-8 md:grid-cols-3 text-sm text-center md:text-left">
        <div>
          <p className="font-brand text-5xl text-primary leading-none">
            {BRAND.name}
          </p>
          <p className="mt-3 text-ink/70 max-w-xs mx-auto md:mx-0">
            {BRAND.tagline}
          </p>
        </div>
        <div>
          <h3 className="text-2xl mb-3">Explore</h3>
          <ul className="space-y-2 text-ink/80">
            <li>
              <Link to="/shop" className="hover:text-primary">
                Shop
              </Link>
            </li>
            <li>
              <Link to="/cart" className="hover:text-primary">
                Cart
              </Link>
            </li>
            <li>
              <Link to="/orders" className="hover:text-primary">
                My orders
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-2xl mb-3">Contact</h3>
          <p className="text-ink/80">{BRAND.email}</p>
        </div>
      </div>
      <div className="border-t border-pastel-dark text-center text-xs text-ink/60 py-4 pb-20 md:pb-4">
        © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
      </div>
    </footer>
  );
}
