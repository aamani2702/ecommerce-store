import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import HeroSlider from "../components/HeroSlider";
import ProductCard from "../components/ProductCard";
import { SkeletonCard, SkeletonTile } from "../components/Skeletons";
import Stars from "../components/Stars";
import useSlowLoading from "../hooks/useSlowLoading";
import { getRecentlyViewed } from "../recentlyViewed";
import { BRAND } from "../config";

const CACHE_KEY = "ona_home_cache_v2";

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY)) || null;
  } catch {
    return null;
  }
}

function saveCache(partial) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ ...(readCache() || {}), ...partial }),
    );
  } catch {
    // Storage can be full or blocked. The page still works without the saved copy.
  }
}

export default function Home() {
  // Start with the last saved result, so returning visitors see content instantly
  const [categories, setCategories] = useState(
    () => readCache()?.categories || [],
  );
  const [featured, setFeatured] = useState(() => readCache()?.featured || []);
  const [sale, setSale] = useState(() => readCache()?.sale || []);
  const [community, setCommunity] = useState(
    () => readCache()?.community || null,
  );
  const [loading, setLoading] = useState(() => !readCache()?.categories);
  const [failed, setFailed] = useState(false);
  const [recent] = useState(() => getRecentlyViewed());
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
        saveCache({ categories: cat.data, featured: prod.data.products });
      })
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));

    // Extras: the page works without them
    api
      .get("/products", { params: { sale: 1, limit: 4 } })
      .then((res) => {
        setSale(res.data.products);
        saveCache({ sale: res.data.products });
      })
      .catch(() => {});
    api
      .get("/reviews/latest")
      .then((res) => {
        setCommunity(res.data);
        saveCache({ community: res.data });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const showCategorySkeleton = loading && categories.length === 0;
  const showProductSkeleton = loading && featured.length === 0;
  const highlights = BRAND.highlights || [];
  const occasions = BRAND.occasions || [];

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

      {/* Shop by occasion */}
      {occasions.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pt-20">
          <h2 className="section-title">Shop by occasion</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {occasions.map((o) => (
              <Link
                key={o.value}
                to={`/shop?occasion=${o.value}`}
                className="group relative block overflow-hidden rounded-lg aspect-[16/10]"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-pastel), var(--color-pastel-dark))",
                }}
              >
                {o.image && (
                  <img
                    src={o.image}
                    alt={o.name}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                )}
                <div className="tile-overlay absolute inset-0" />
                <h3 className="absolute bottom-4 left-0 right-0 text-center text-white text-3xl">
                  {o.name}
                </h3>
              </Link>
            ))}
          </div>
        </section>
      )}

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

      {/* Offers */}
      {sale.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pt-20">
          <h2 className="section-title">Offers for you</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
            {sale.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/shop?sale=1" className="btn btn-outline">
              See all offers
            </Link>
          </div>
        </section>
      )}

      {/* Community reviews (shown once customers have written some) */}
      {community && community.count > 0 && community.reviews.length > 0 && (
        <section className="bg-sand mt-20 py-14">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="section-title">From our community</h2>
            <p className="text-center text-sm text-ink/70 -mt-4 mb-8">
              {community.average} out of 5 from {community.count}{" "}
              {community.count === 1 ? "review" : "reviews"}
            </p>
            <div className="grid md:grid-cols-3 gap-5">
              {community.reviews.slice(0, 3).map((r) => (
                <article
                  key={r.id}
                  className="bg-white p-6 rounded-lg shadow-sm"
                >
                  <Stars value={r.rating} size="text-lg" />
                  {r.title && <h3 className="text-xl mt-2">{r.title}</h3>}
                  <p className="mt-2 text-sm text-ink/80 line-clamp-4">
                    {r.comment}
                  </p>
                  <p className="mt-4 text-xs text-ink/60">
                    {r.name} on{" "}
                    <Link
                      to={`/product/${r.product_id}`}
                      className="text-primary underline"
                    >
                      {r.product_name}
                    </Link>
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recently viewed (only for visitors who have looked at products) */}
      {recent.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pt-20">
          <h2 className="section-title">Recently viewed</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
            {recent.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
