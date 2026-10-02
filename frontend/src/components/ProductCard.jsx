import { Link } from "react-router-dom";
import { formatPrice } from "../utils";

export default function ProductCard({ product }) {
  return (
    <Link
      to={`/product/${product.id}`}
      className="group block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition"
    >
      <div className="aspect-[3/4] bg-gray-100 overflow-hidden">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />
      </div>
      <div className="p-3">
        <p className="text-xs text-gray-500">
          {product.category}
          {product.fabric ? ` · ${product.fabric}` : ""}
        </p>
        <h3 className="text-lg leading-tight">{product.name}</h3>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-primary font-semibold">
            {formatPrice(product.price)}
          </span>
          {product.total_stock === 0 && (
            <span className="text-xs text-red-600">Sold out</span>
          )}
        </div>
      </div>
    </Link>
  );
}
