import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useWishlist } from "../context/WishlistContext";

export default function Wishlist() {
  const { items } = useWishlist();

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="section-title">My wishlist</h1>

      {items.length === 0 ? (
        <div className="text-center py-10">
          <p className="mb-4 text-ink/70">
            You have not saved anything yet. Tap the heart on a product to save
            it here.
          </p>
          <Link to="/shop" className="btn btn-primary">
            Browse the shop
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
