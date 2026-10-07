import { Link } from "react-router-dom";
import { discountPercent, formatPrice } from "../utils";
import Stars from "./Stars";
import WishlistButton from "./WishlistButton";

export default function ProductCard({ product }) {
  const percent = discountPercent(product.price, product.mrp);
  const soldOut = product.total_stock === 0;

  return (
    <div className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition duration-300">
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-[3/4] bg-sand overflow-hidden">
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
          {soldOut ? (
            <span className="absolute top-3 left-3 bg-ink text-cream text-[10px] tracking-widest uppercase px-2 py-1">
              Sold out
            </span>
          ) : (
            percent > 0 && (
              <span className="absolute top-3 left-3 bg-primary text-cream text-[10px] tracking-widest uppercase px-2 py-1">
                {percent}% off
              </span>
            )
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
        </div>
      </Link>
      <WishlistButton
        productId={product.id}
        className="absolute top-3 right-3"
      />
    </div>
  );
}
