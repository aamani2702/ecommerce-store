import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useWishlist } from "../context/WishlistContext";

export default function WishlistButton({ productId, className = "" }) {
  const { user } = useAuth();
  const { has, toggle } = useWishlist();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const active = has(productId);

  async function handleClick() {
    if (!user) {
      navigate("/login", { state: { from: "/wishlist" } });
      return;
    }
    try {
      const added = await toggle(productId);
      showToast(
        added ? "Saved to your wishlist" : "Removed from your wishlist",
      );
    } catch {
      showToast("Could not update your wishlist", "error");
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      className={`flex items-center justify-center w-9 h-9 rounded-full bg-white/90 shadow hover:bg-white transition ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        className="w-5 h-5"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        style={{ color: active ? "var(--color-primary)" : "var(--color-ink)" }}
      >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    </button>
  );
}
