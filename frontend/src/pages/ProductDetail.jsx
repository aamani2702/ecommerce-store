import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import Breadcrumbs from "../components/Breadcrumbs";
import DeliveryCheck from "../components/DeliveryCheck";
import ProductCard from "../components/ProductCard";
import ReviewsSection from "../components/ReviewsSection";
import SizeGuide from "../components/SizeGuide";
import Stars from "../components/Stars";
import WishlistButton from "../components/WishlistButton";
import { BRAND } from "../config";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { addRecentlyViewed } from "../recentlyViewed";
import { discountPercent, formatPrice } from "../utils";

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [zoom, setZoom] = useState({ on: false, x: 50, y: 50 });
  const [related, setRelated] = useState([]);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [color, setColor] = useState("");
  const [variantId, setVariantId] = useState(null);
  const [openPanel, setOpenPanel] = useState("details");

  useEffect(() => {
    setProduct(null);
    setImages([]);
    setActiveImage(0);
    setRelated([]);
    setSummary(null);
    setVariantId(null);
    setError("");

    api
      .get(`/products/${id}`)
      .then((res) => {
        const p = res.data;
        setProduct(p);

        // Start on the first colour, and pick the size automatically if there is only one
        const firstColor = p.variants[0]?.color || "";
        setColor(firstColor);
        const sameColor = p.variants.filter((v) => v.color === firstColor);
        if (sameColor.length === 1 && sameColor[0].stock > 0)
          setVariantId(sameColor[0].id);

        addRecentlyViewed(p);

        // "You may also like": other products from the same category
        if (p.category_slug) {
          api
            .get("/products", {
              params: { category: p.category_slug, limit: 5 },
            })
            .then((r) =>
              setRelated(
                r.data.products
                  .filter((x) => String(x.id) !== String(id))
                  .slice(0, 4),
              ),
            )
            .catch(() => {});
        }
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

  const gallery =
    images.length > 0 ? images : [product.image_url].filter(Boolean);
  const mainImage = gallery[activeImage] || gallery[0];

  const percent = discountPercent(product.price, product.mrp);
  const ratingAvg = summary ? summary.average : product.rating_avg || 0;
  const ratingCount = summary ? summary.count : product.rating_count || 0;

  // Zoom only works with a mouse. Touch screens keep the normal photo.
  const canHover =
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const detailLines = (product.details || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const panels = [
    {
      key: "details",
      title: "Product details",
      content:
        detailLines.length > 0 ? (
          <ul className="list-disc pl-5 space-y-1">
            {detailLines.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        ) : (
          <p>More details are coming soon.</p>
        ),
    },
    {
      key: "shipping",
      title: "Shipping and returns",
      content: (
        <p>
          {BRAND.shippingInfo} {BRAND.returnsInfo}
        </p>
      ),
    },
    { key: "care", title: "Fabric and care", content: <p>{BRAND.careInfo}</p> },
  ];

  function showNext(step) {
    setActiveImage((i) => (i + step + gallery.length) % gallery.length);
  }

  function handleZoomMove(e) {
    if (!canHover) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setZoom({
      on: true,
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }

  function chooseColor(c) {
    setColor(c);
    const same = product.variants.filter((v) => v.color === c);
    setVariantId(same.length === 1 && same[0].stock > 0 ? same[0].id : null);
  }

  async function handleAdd() {
    if (!user) {
      navigate("/login", { state: { from: `/product/${id}` } });
      return;
    }
    if (!selected) {
      showToast("Please choose a size", "error");
      return;
    }
    try {
      await addToCart(selected.id, 1);
      showToast("Added to your cart");
    } catch (err) {
      showToast(
        err.response?.data?.message || "Could not add to cart",
        "error",
      );
    }
  }

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 pt-8 pb-10">
        <Breadcrumbs
          items={[
            { label: "Home", to: "/" },
            { label: "Shop", to: "/shop" },
            ...(product.category
              ? [
                  {
                    label: product.category,
                    to: `/shop?category=${product.category_slug}`,
                  },
                ]
              : []),
            { label: product.name },
          ]}
        />

        <div className="grid md:grid-cols-2 gap-10">
          {/* Image gallery */}
          <div>
            <div
              className={`relative aspect-[3/4] rounded-lg overflow-hidden bg-sand ${
                canHover ? "cursor-zoom-in" : ""
              }`}
              onMouseMove={handleZoomMove}
              onMouseLeave={() => setZoom({ on: false, x: 50, y: 50 })}
            >
              {mainImage && (
                <img
                  src={mainImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  style={{
                    transform: zoom.on ? "scale(1.9)" : "scale(1)",
                    transformOrigin: `${zoom.x}% ${zoom.y}%`,
                    transition: "transform 0.15s ease-out",
                  }}
                />
              )}
              {percent > 0 && (
                <span className="absolute top-3 left-3 bg-primary text-cream text-xs tracking-widest uppercase px-3 py-1.5">
                  {percent}% off
                </span>
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
                      i === activeImage
                        ? "border-primary"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
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

            <a
              href="#reviews"
              className="inline-flex items-center gap-2 mt-2 text-sm"
            >
              {ratingCount > 0 ? (
                <>
                  <Stars value={ratingAvg} size="text-base" />
                  <span>
                    {ratingAvg} ({ratingCount}{" "}
                    {ratingCount === 1 ? "review" : "reviews"})
                  </span>
                </>
              ) : (
                <span className="text-ink/60 underline">
                  Be the first to review
                </span>
              )}
            </a>

            <div className="mt-3 flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl text-primary font-semibold">
                {formatPrice(product.price)}
              </span>
              {percent > 0 && (
                <>
                  <span className="text-lg text-ink/50 line-through">
                    {formatPrice(product.mrp)}
                  </span>
                  <span className="text-sm font-semibold text-cream bg-primary px-2 py-0.5 rounded">
                    {percent}% OFF
                  </span>
                </>
              )}
            </div>

            <p className="mt-4 text-ink/80">{product.description}</p>

            <p className="mt-6 text-sm font-medium">
              Colour: <span className="font-normal">{color}</span>
            </p>
            <div className="flex gap-2 mt-2 flex-wrap">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => chooseColor(c)}
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

            <div className="mt-5 flex items-center justify-between max-w-xs">
              <p className="text-sm font-medium">Size</p>
              <SizeGuide />
            </div>
            <div className="flex gap-2 mt-2 flex-wrap">
              {sizes.map((v) => (
                <button
                  key={v.id}
                  disabled={v.stock === 0}
                  onClick={() => setVariantId(v.id)}
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
                {selected.stock <= 3
                  ? `Only ${selected.stock} left`
                  : "In stock"}
              </p>
            )}

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={handleAdd}
                className="btn btn-primary grow md:grow-0 md:px-12"
              >
                Add to cart
              </button>
              <WishlistButton
                productId={product.id}
                className="border border-pastel-dark"
              />
            </div>

            <DeliveryCheck />

            {/* Information panels */}
            <div className="mt-8 border-t border-pastel-dark">
              {panels.map((panel) => (
                <div key={panel.key} className="border-b border-pastel-dark">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenPanel(openPanel === panel.key ? "" : panel.key)
                    }
                    className="w-full flex items-center justify-between py-3 text-left uppercase tracking-widest text-xs"
                  >
                    {panel.title}
                    <span className="text-lg leading-none">
                      {openPanel === panel.key ? "−" : "+"}
                    </span>
                  </button>
                  {openPanel === panel.key && (
                    <div className="pb-4 text-sm text-ink/80">
                      {panel.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ReviewsSection productId={product.id} onSummary={setSummary} />

      {related.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pb-16">
          <h2 className="section-title">You may also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Phone only: price and Add to cart stay at the bottom of the screen */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-pastel-dark p-3 flex items-center gap-3">
        <div className="leading-tight">
          <p className="text-primary font-semibold">
            {formatPrice(product.price)}
          </p>
          {percent > 0 && (
            <p className="text-xs text-ink/50 line-through">
              {formatPrice(product.mrp)}
            </p>
          )}
        </div>
        <button onClick={handleAdd} className="btn btn-primary grow">
          Add to cart
        </button>
      </div>
    </>
  );
}
