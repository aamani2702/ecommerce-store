import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import ProductCard from "../components/ProductCard";
import { BRAND } from "../config";

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data));
    api
      .get("/products", { params: { limit: 4 } })
      .then((res) => setFeatured(res.data.products));
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="bg-primary text-cream">
        <div className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl leading-tight">
              {BRAND.heroTitle}
            </h1>
            <p className="mt-4 text-cream/80">{BRAND.heroText}</p>
            <Link to="/shop" className="btn bg-accent text-ink mt-6">
              Shop now
            </Link>
          </div>
          <img
            src={BRAND.heroImage}
            alt=""
            className="rounded-lg w-full max-h-[420px] object-cover"
          />
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl mb-6">Shop by category</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/shop?category=${c.slug}`}
              className="border border-primary/20 bg-white rounded-lg py-8 text-center font-heading text-lg hover:bg-primary hover:text-cream transition"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-2xl">New arrivals</h2>
          <Link to="/shop" className="text-primary underline text-sm">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </>
  );
}
