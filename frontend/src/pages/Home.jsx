import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import HeroSlider from "../components/HeroSlider";
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
      <HeroSlider />

      {/* Categories with pictures */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <h2 className="text-4xl text-center mb-8">Shop by category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/shop?category=${c.slug}`}
              className="group block text-center"
            >
              <div className="aspect-[4/5] overflow-hidden rounded-lg bg-sand">
                <img
                  src={
                    BRAND.categoryImages[c.slug] ||
                    `https://placehold.co/400x500/f2e9df/9a5b63?text=${encodeURIComponent(c.name)}`
                  }
                  alt={c.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
              </div>
              <h3 className="mt-3 text-2xl group-hover:text-primary transition">
                {c.name}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* New arrivals */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-4xl">New arrivals</h2>
          <Link to="/shop" className="text-primary underline text-sm">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </>
  );
}
