import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import HeroSlider from "../components/HeroSlider";
import ProductCard from "../components/ProductCard";
import { SkeletonCard, SkeletonTile } from "../components/Skeletons";
import useSlowLoading from "../hooks/useSlowLoading";
import { BRAND } from "../config";

const CACHE_KEY = "ona_home_cache_v1";

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY)) || null;
  } catch {
    return null;
  }
}

export default function Home() {
  // Start with the last result we saved, so returning visitors see content instantly
  const [categories, setCategories] = useState(
    () => readCache()?.categories || [],
  );
  const [featured, setFeatured] = useState(() => readCache()?.featured || []);
  const [loading, setLoading] = useState(() => !readCache());
  const [failed, setFailed] = useState(false);
  const slow = useSlowLoading(loading);

  const load = useCallback(() => {
    setFailed(false);
    Promise.all([
      api.get("/categories"),
      api.get("/products", { params: { limit: 4 } }),
    ])
      .then(([cat, prod]) => {
        setCategories(cat.data);
        setFeatured(prod.data.products);
        try {
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({
              categories: cat.data,
              featured: prod.data.products,
            }),
          );
        } catch {
          // Storage can be full or blocked. The page still works without the saved copy.
        }
      })
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const showCategorySkeleton = loading && categories.length === 0;
  const showProductSkeleton = loading && featured.length === 0;
  const highlights = BRAND.highlights || [];

  return (
    <>
      <HeroSlider />

      {/* Three short selling points */}
      {highlights.length > 0 && (
        <section className="bg-sand border-y border-pastel-dark">
          <div className="max-w-7xl mx-auto px-4 py-5 grid gap-3 sm:grid-cols-3 sm:divide-x divide-pastel-dark text-center text-xs sm:text-sm uppercase tracking-widest">
            {highlights.map((h) => (
              <p key={h}>{h}</p>
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 pt-16">
        <h2 className="section-title">Shop by category</h2>

        {slow && (
          <p className="text-center text-sm text-ink/60 -mt-4 mb-6">
            Our server is waking up after a quiet period. This can take up to a
            minute. Thank you for waiting.
          </p>
        )}

        {failed && categories.length === 0 && (
          <div className="text-center py-8">
            <p className="mb-3">We could not load the collection right now.</p>
            <button
              onClick={() => {
                setLoading(true);
                load();
              }}
              className="btn btn-outline"
            >
              Try again
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
          {showCategorySkeleton &&
            Array.from({ length: 5 }).map((_, i) => <SkeletonTile key={i} />)}

          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/shop?category=${c.slug}`}
              className="group relative block overflow-hidden rounded-lg aspect-[4/5] bg-sand"
            >
              <img
                src={
                  BRAND.categoryImages[c.slug] ||
                  `https://placehold.co/400x500/f6e4e4/a85c68?text=${encodeURIComponent(c.name)}`
                }
                alt={c.name}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="tile-overlay absolute inset-0" />
              <h3 className="absolute bottom-4 left-0 right-0 text-center text-white text-2xl sm:text-3xl">
                {c.name}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* New arrivals */}
      <section className="max-w-7xl mx-auto px-4 pt-20">
        <h2 className="section-title">New arrivals</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
          {showProductSkeleton &&
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}

          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        <div className="text-center mt-10">
          <Link to="/shop" className="btn btn-outline">
            View all products
          </Link>
        </div>
      </section>
    </>
  );
}
