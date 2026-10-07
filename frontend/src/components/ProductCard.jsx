import { Link } from "react-router-dom";
import { formatPrice } from "../utils";

export default function ProductCard({ product }) {
  return (
    <Link
      to={`/product/${product.id}`}
      className="group block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition duration-300"
    >
      <div className="relative aspect-[3/4] bg-sand overflow-hidden">
        <img
          src={product.image_url}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />
        {product.total_stock === 0 && (
          <span className="absolute top-3 left-3 bg-ink text-cream text-[10px] tracking-widest uppercase px-2 py-1">
            Sold out
          </span>
        )}
      </div>
      <div className="p-4 text-center">
        <p className="text-[11px] uppercase tracking-widest text-ink/50">
          {product.category}
          {product.fabric ? ` · ${product.fabric}` : ""}
        </p>
        <h3 className="text-xl leading-tight mt-1">{product.name}</h3>
        <p className="text-primary font-semibold mt-1">
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
}
