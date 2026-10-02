import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils";

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [color, setColor] = useState("");
  const [variantId, setVariantId] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api
      .get(`/products/${id}`)
      .then((res) => {
        setProduct(res.data);
        setColor(res.data.variants[0]?.color || "");
      })
      .catch(() => setError("Product not found"));
  }, [id]);

  if (error) return <p className="max-w-6xl mx-auto px-4 py-16">{error}</p>;
  if (!product)
    return <p className="max-w-6xl mx-auto px-4 py-16">Loading...</p>;

  const colors = [...new Set(product.variants.map((v) => v.color))];
  const sizes = product.variants.filter((v) => v.color === color);
  const selected = product.variants.find((v) => v.id === variantId);

  async function handleAdd() {
    if (!user) {
      navigate("/login", { state: { from: `/product/${id}` } });
      return;
    }
    if (!selected) {
      setMessage("Please choose a size");
      return;
    }
    try {
      await addToCart(selected.id, 1);
      setMessage("Added to cart");
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not add to cart");
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-10">
      <img
        src={product.image_url}
        alt={product.name}
        className="w-full rounded-lg aspect-[3/4] object-cover bg-gray-100"
      />
      <div>
        <p className="text-sm text-gray-500">
          {product.category}
          {product.fabric ? ` · ${product.fabric}` : ""}
          {product.occasion ? ` · ${product.occasion}` : ""}
        </p>
        <h1 className="text-3xl mt-1">{product.name}</h1>
        <p className="text-2xl text-primary font-semibold mt-3">
          {formatPrice(product.price)}
        </p>
        <p className="mt-4 text-gray-700">{product.description}</p>

        <p className="mt-6 text-sm font-medium">Colour</p>
        <div className="flex gap-2 mt-2 flex-wrap">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => {
                setColor(c);
                setVariantId(null);
                setMessage("");
              }}
              className={`px-3 py-1.5 rounded border text-sm ${
                c === color
                  ? "bg-primary text-cream border-primary"
                  : "border-gray-300 bg-white"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <p className="mt-5 text-sm font-medium">Size</p>
        <div className="flex gap-2 mt-2 flex-wrap">
          {sizes.map((v) => (
            <button
              key={v.id}
              disabled={v.stock === 0}
              onClick={() => {
                setVariantId(v.id);
                setMessage("");
              }}
              className={`px-3 py-1.5 rounded border text-sm disabled:opacity-40 disabled:line-through ${
                v.id === variantId
                  ? "bg-primary text-cream border-primary"
                  : "border-gray-300 bg-white"
              }`}
            >
              {v.size}
            </button>
          ))}
        </div>

        {selected && (
          <p className="text-sm mt-3 text-gray-600">
            {selected.stock <= 3 ? `Only ${selected.stock} left` : "In stock"}
          </p>
        )}

        <button
          onClick={handleAdd}
          className="btn btn-primary mt-6 w-full md:w-auto"
        >
          Add to cart
        </button>
        {message && <p className="mt-3 text-sm">{message}</p>}
      </div>
    </div>
  );
}
