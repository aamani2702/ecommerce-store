import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api";
import ProductCard from "../components/ProductCard";

const GENDERS = [
  { value: "women", label: "Women" },
  { value: "men", label: "Men" },
  { value: "kids", label: "Kids" },
];
const OCCASIONS = ["Wedding", "Festive", "Casual"].map((o) => ({
  value: o,
  label: o,
}));
const FABRICS = ["Silk", "Cotton", "Georgette", "Velvet"].map((f) => ({
  value: f,
  label: f,
}));
const SORTS = [
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "name", label: "Name A to Z" },
];

function FilterSelect({ label, value, onChange, options, allLabel = "All" }) {
  return (
    <label className="block text-sm mb-4">
      <span className="block mb-1 font-medium">{label}</span>
      <select
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{allLabel}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [data, setData] = useState({
    products: [],
    total: 0,
    page: 1,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(params.get("search") || "");

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data));
  }, []);

  // Whenever the URL filters change, fetch matching products
  useEffect(() => {
    setLoading(true);
    api
      .get("/products", { params: Object.fromEntries(params) })
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, [params]);

  function setFilter(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    setParams(next);
  }

  function goToPage(page) {
    const next = new URLSearchParams(params);
    next.set("page", page);
    setParams(next);
    window.scrollTo(0, 0);
  }

  function handleSearch(e) {
    e.preventDefault();
    setFilter("search", search.trim());
  }

  function clearAll() {
    setSearch("");
    setParams({});
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl mb-6">Shop</h1>
      <div className="grid md:grid-cols-4 gap-8">
        {/* Filters */}
        <aside className="md:col-span-1">
          <form onSubmit={handleSearch} className="mb-4">
            <input
              className="input"
              placeholder="Search products"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
          <FilterSelect
            label="Category"
            value={params.get("category") || ""}
            onChange={(v) => setFilter("category", v)}
            options={categories.map((c) => ({ value: c.slug, label: c.name }))}
          />
          <FilterSelect
            label="For"
            value={params.get("gender") || ""}
            onChange={(v) => setFilter("gender", v)}
            options={GENDERS}
          />
          <FilterSelect
            label="Occasion"
            value={params.get("occasion") || ""}
            onChange={(v) => setFilter("occasion", v)}
            options={OCCASIONS}
          />
          <FilterSelect
            label="Fabric"
            value={params.get("fabric") || ""}
            onChange={(v) => setFilter("fabric", v)}
            options={FABRICS}
          />
          <FilterSelect
            label="Sort by"
            value={params.get("sort") || ""}
            onChange={(v) => setFilter("sort", v)}
            options={SORTS}
            allLabel="Newest"
          />
          <button onClick={clearAll} className="btn btn-outline w-full text-sm">
            Clear filters
          </button>
        </aside>

        {/* Results */}
        <section className="md:col-span-3">
          <p className="text-sm text-gray-600 mb-4">
            {loading ? "Loading..." : `${data.total} products`}
          </p>
          {!loading && data.products.length === 0 && (
            <p className="py-10 text-center text-gray-500">
              No products match these filters.
            </p>
          )}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {data.products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                className="btn btn-outline"
                disabled={data.page <= 1}
                onClick={() => goToPage(data.page - 1)}
              >
                Previous
              </button>
              <span className="text-sm">
                Page {data.page} of {data.totalPages}
              </span>
              <button
                className="btn btn-outline"
                disabled={data.page >= data.totalPages}
                onClick={() => goToPage(data.page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
