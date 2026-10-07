import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api";
import ProductCard from "../components/ProductCard";
import { SkeletonCard } from "../components/Skeletons";
import useSlowLoading from "../hooks/useSlowLoading";

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
  { value: "rating", label: "Top rated" },
  { value: "name", label: "A to Z" },
];
const PRICE_RANGES = [
  { key: "u2", label: "Under ₹2,000", min: "", max: "2000" },
  { key: "2-5", label: "₹2,000 to ₹5,000", min: "2000", max: "5000" },
  { key: "5-10", label: "₹5,000 to ₹10,000", min: "5000", max: "10000" },
  { key: "o10", label: "Above ₹10,000", min: "10000", max: "" },
];

function FilterSelect({ label, value, onChange, options, allLabel = "All" }) {
  return (
    <label className="block text-xs w-full md:w-32">
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
  const [showFilters, setShowFilters] = useState(false);
  const slow = useSlowLoading(loading);

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

  // The price filter uses two URL values (minPrice and maxPrice)
  function setPrice(key) {
    const next = new URLSearchParams(params);
    next.delete("minPrice");
    next.delete("maxPrice");
    next.delete("page");
    const range = PRICE_RANGES.find((r) => r.key === key);
    if (range) {
      if (range.min) next.set("minPrice", range.min);
      if (range.max) next.set("maxPrice", range.max);
    }
    setParams(next);
  }

  function removeKeys(keys) {
    const next = new URLSearchParams(params);
    keys.forEach((k) => next.delete(k));
    next.delete("page");
    setParams(next);
    if (keys.includes("search")) setSearch("");
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

  const currentRange =
    PRICE_RANGES.find(
      (r) =>
        r.min === (params.get("minPrice") || "") &&
        r.max === (params.get("maxPrice") || ""),
    ) || null;

  // The small removable tags that show which filters are active
  const chips = [];
  if (params.get("search"))
    chips.push({ label: `Search: ${params.get("search")}`, keys: ["search"] });
  if (params.get("category")) {
    const cat = categories.find((c) => c.slug === params.get("category"));
    chips.push({
      label: cat ? cat.name : params.get("category"),
      keys: ["category"],
    });
  }
  if (params.get("gender")) {
    const g = GENDERS.find((x) => x.value === params.get("gender"));
    chips.push({ label: g ? g.label : params.get("gender"), keys: ["gender"] });
  }
  if (params.get("occasion"))
    chips.push({ label: params.get("occasion"), keys: ["occasion"] });
  if (params.get("fabric"))
    chips.push({ label: params.get("fabric"), keys: ["fabric"] });
  if (params.get("sale")) chips.push({ label: "On sale", keys: ["sale"] });
  if (currentRange)
    chips.push({ label: currentRange.label, keys: ["minPrice", "maxPrice"] });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="section-title">{params.get("sale") ? "Sale" : "Shop"}</h1>

      {/* One compact bar: search + filters (filters sit behind a button on phones) */}
      <div className="bg-white rounded-lg shadow-sm p-3 mb-4">
        <div className="flex flex-wrap items-end gap-3">
          <form
            onSubmit={handleSearch}
            className="flex items-end gap-2 grow md:grow-0"
          >
            <label className="block text-xs grow md:w-48">
              <span className="block mb-1 font-medium text-ink/70">Search</span>
              <input
                className="input text-sm"
                placeholder="Search products"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <button className="btn btn-primary">Go</button>
          </form>

          <button
            type="button"
            onClick={() => setShowFilters((s) => !s)}
            className="btn btn-outline md:hidden"
          >
            {showFilters ? "Hide filters" : "Filters"}
          </button>

          <div
            className={`${
              showFilters ? "grid" : "hidden"
            } grid-cols-2 gap-3 w-full md:flex md:flex-wrap md:items-end md:w-auto`}
          >
            <FilterSelect
              label="Category"
              value={params.get("category") || ""}
              onChange={(v) => setFilter("category", v)}
              options={categories.map((c) => ({
                value: c.slug,
                label: c.name,
              }))}
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
              label="Price"
              value={currentRange ? currentRange.key : ""}
              onChange={setPrice}
              options={PRICE_RANGES.map((r) => ({
                value: r.key,
                label: r.label,
              }))}
              allLabel="Any"
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
              className="btn btn-outline"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Active filters as removable tags */}
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {chips.map((chip) => (
            <button
              key={chip.label}
              onClick={() => removeKeys(chip.keys)}
              className="inline-flex items-center gap-2 bg-pastel text-ink text-xs px-3 py-1.5 rounded-full"
            >
              {chip.label}
              <span aria-hidden="true">×</span>
            </button>
          ))}
        </div>
      )}

      {slow && (
        <p className="text-center text-sm text-ink/60 mb-6">
          Our server is waking up after a quiet period. This can take up to a
          minute. Thank you for waiting.
        </p>
      )}

      <p className="text-sm text-ink/60 mb-4">
        {loading ? "Loading..." : `${data.total} products`}
      </p>

      {!loading && data.products.length === 0 && (
        <p className="py-10 text-center text-ink/60">
          No products match these filters.
        </p>
      )}

      {/* 2 per row on phones, 4 per row on large screens */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : data.products.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>

      {!loading && data.totalPages > 1 && (
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
