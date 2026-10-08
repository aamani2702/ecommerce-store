import { Link } from "react-router-dom";
import { discountPercent, formatPrice } from "../utils";
import Stars from "./Stars";
import WishlistButton from "./WishlistButton";

const FOURTEEN_DAYS = 14 * 24 * 60 * 60 * 1000;

export default function ProductCard({ product }) {
  const percent = discountPercent(product.price, product.mrp);
  const soldOut = product.total_stock === 0;
  const fewLeft = product.total_stock > 0 && product.total_stock <= 3;
  const isNew =
    product.created_at &&
    Date.now() - new Date(product.created_at).getTime() < FOURTEEN_DAYS;

  // Only one badge is shown: sold out, then sale, then new
  let badge = null;
  if (soldOut) badge = { text: "Sold out", style: "bg-ink text-cream" };
  else if (percent > 0)
    badge = { text: `${percent}% off`, style: "bg-primary text-cream" };
  else if (isNew) badge = { text: "New", style: "bg-accent text-ink" };

  return (
    <div className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition duration-300">
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-[3/4] bg-sand overflow-hidden">
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className={`w-full h-full object-cover transition duration-500 ${
              product.hover_image
                ? "group-hover:opacity-0"
                : "group-hover:scale-105"
            }`}
          />

          {/* The second photo fades in when the mouse is over the card */}
          {product.hover_image && (
            <img
              src={product.hover_image}
              alt=""
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition duration-500"
            />
          )}

          {badge && (
            <span
              className={`absolute top-3 left-3 text-[10px] tracking-widest uppercase px-2 py-1 ${badge.style}`}
            >
              {badge.text}
            </span>
          )}
        </div>

        <div className="p-4 text-center">
          <p className="text-[11px] uppercase tracking-widest text-ink/50">
            {product.category}
            {product.fabric ? ` · ${product.fabric}` : ""}
          </p>
          <h3 className="text-xl leading-tight mt-1">{product.name}</h3>
          {product.rating_count > 0 && (
            <div className="mt-1 flex items-center justify-center gap-1 text-xs text-ink/60">
              <Stars value={product.rating_avg} />
              <span>({product.rating_count})</span>
            </div>
          )}
          <p className="mt-1 flex items-baseline justify-center gap-2">
            <span className="text-primary font-semibold">
              {formatPrice(product.price)}
            </span>
            {percent > 0 && (
              <span className="text-sm text-ink/50 line-through">
                {formatPrice(product.mrp)}
              </span>
            )}
          </p>
          {fewLeft && (
            <p className="mt-1 text-xs text-red-600">
              Only {product.total_stock} left
            </p>
          )}
        </div>
      </Link>
      <WishlistButton
        productId={product.id}
        className="absolute top-3 right-3"
      />
    </div>
  );
}
