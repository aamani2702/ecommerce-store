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
  const [images, setImages] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [error, setError] = useState("");
  const [color, setColor] = useState("");
  const [variantId, setVariantId] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setActiveImage(0);
    api
      .get(`/products/${id}`)
      .then((res) => {
        setProduct(res.data);
        setColor(res.data.variants[0]?.color || "");
      })
      .catch(() => setError("Product not found"));
    api
      .get(`/products/${id}/images`)
      .then((res) => setImages(res.data.images))
      .catch(() => setImages([]));
  }, [id]);

  if (error) return <p className="max-w-6xl mx-auto px-4 py-16">{error}</p>;
  if (!product)
    return <p className="max-w-6xl mx-auto px-4 py-16">Loading...</p>;

  const colors = [...new Set(product.variants.map((v) => v.color))];
  const sizes = product.variants.filter((v) => v.color === color);
  const selected = product.variants.find((v) => v.id === variantId);

  // Gallery: all images, or just the cover if the extra list is empty
  const gallery =
    images.length > 0 ? images : [product.image_url].filter(Boolean);
  const mainImage = gallery[activeImage] || gallery[0];

  function showNext(step) {
    setActiveImage((i) => (i + step + gallery.length) % gallery.length);
  }

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
      {/* Image gallery */}
      <div>
        <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-sand">
          {mainImage && (
            <img
              src={mainImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          )}
          {gallery.length > 1 && (
            <>
              <button
                onClick={() => showNext(-1)}
                aria-label="Previous image"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-cream/80 hover:bg-cream rounded-full w-9 h-9 text-xl"
              >
                ‹
              </button>
              <button
                onClick={() => showNext(1)}
                aria-label="Next image"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-cream/80 hover:bg-cream rounded-full w-9 h-9 text-xl"
              >
                ›
              </button>
            </>
          )}
        </div>

        {gallery.length > 1 && (
          <div className="flex gap-3 mt-3 flex-wrap">
            {gallery.map((url, i) => (
              <button
                key={url + i}
                onClick={() => setActiveImage(i)}
                className={`w-20 h-24 rounded overflow-hidden border-2 ${
                  i === activeImage ? "border-primary" : "border-transparent"
                }`}
              >
                <img src={url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Details */}
      <div>
        <p className="text-sm text-ink/60">
          {product.category}
          {product.fabric ? ` · ${product.fabric}` : ""}
          {product.occasion ? ` · ${product.occasion}` : ""}
        </p>
        <h1 className="text-4xl mt-1">{product.name}</h1>
        <p className="text-2xl text-primary font-semibold mt-3">
          {formatPrice(product.price)}
        </p>
        <p className="mt-4 text-ink/80">{product.description}</p>

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
          <p className="text-sm mt-3 text-ink/70">
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
