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
  { value: "price_asc", label: "Low to high" },
  { value: "price_desc", label: "High to low" },
  { value: "name", label: "A to Z" },
];

// The width sits on the label because the .input style always fills its parent
function FilterSelect({ label, value, onChange, options, allLabel = "All" }) {
  return (
    <label className="block text-xs w-32">
      <span className="block mb-1 font-medium text-ink/70">{label}</span>
      <select
        className="input text-sm"
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
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-5xl text-center mb-8">Shop</h1>

      {/* One compact bar: search + all filters */}
      <div className="bg-white rounded-lg shadow-sm p-3 mb-8 flex flex-wrap items-end gap-3">
        <form onSubmit={handleSearch} className="flex items-end gap-2">
          <label className="block text-xs w-48">
            <span className="block mb-1 font-medium text-ink/70">Search</span>
            <input
              className="input text-sm"
              placeholder="Search products"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <button className="btn btn-primary text-sm">Go</button>
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
        <button
          type="button"
          onClick={clearAll}
          className="btn btn-outline text-sm"
        >
          Clear
        </button>
      </div>

      <p className="text-sm text-ink/60 mb-4">
        {loading ? "Loading..." : `${data.total} products`}
      </p>

      {!loading && data.products.length === 0 && (
        <p className="py-10 text-center text-ink/60">
          No products match these filters.
        </p>
      )}

      {/* 4 products per row on large screens */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {data.products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-10">
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
    </div>
  );
}
