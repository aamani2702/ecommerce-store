import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { formatPrice } from "../utils";

// A search bar that slides down over the page and suggests products as you type
export default function SearchOverlay({ onClose }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Put the cursor in the box when the bar opens
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close with the Escape key
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Ask the server for suggestions 250 ms after the visitor stops typing
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setSearching(false);
      return undefined;
    }

    let cancelled = false;
    setSearching(true);
    const timer = setTimeout(() => {
      api
        .get("/products/suggest", { params: { q } })
        .then((res) => {
          if (!cancelled) setResults(res.data);
        })
        .catch(() => {
          if (!cancelled) setResults([]);
        })
        .finally(() => {
          if (!cancelled) setSearching(false);
        });
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  function goToResults() {
    const q = query.trim();
    if (!q) return;
    onClose();
    navigate(`/shop?search=${encodeURIComponent(q)}`);
  }

  function handleSubmit(e) {
    e.preventDefault();
    goToResults();
  }

  const typed = query.trim().length >= 2;

  return (
    <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose}>
      <div
        className="fade-up bg-cream shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-w-3xl mx-auto px-4 py-6">
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-3 border-b-2 border-primary pb-2"
          >
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a saree, kurta, fabric..."
              className="grow bg-transparent outline-none text-2xl font-heading"
            />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close search"
              className="text-3xl leading-none"
            >
              ×
            </button>
          </form>

          {!typed && (
            <p className="mt-4 text-sm text-ink/60">
              Type at least two letters to see suggestions.
            </p>
          )}

          {typed && searching && (
            <p className="mt-4 text-sm text-ink/60">Searching...</p>
          )}

          {typed && !searching && results.length === 0 && (
            <p className="mt-4 text-sm text-ink/60">
              No matches yet. Try another word.
            </p>
          )}

          {results.length > 0 && (
            <ul className="mt-4 divide-y divide-pastel-dark">
              {results.map((p) => (
                <li key={p.id}>
                  <Link
                    to={`/product/${p.id}`}
                    onClick={onClose}
                    className="flex items-center gap-4 py-3 px-2 rounded hover:bg-pastel/60"
                  >
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt=""
                        className="w-12 h-16 object-cover rounded bg-sand"
                      />
                    ) : (
                      <div className="w-12 h-16 rounded bg-sand" />
                    )}
                    <div className="grow">
                      <p className="font-heading text-xl leading-tight">
                        {p.name}
                      </p>
                      <p className="text-xs uppercase tracking-widest text-ink/50">
                        {p.category}
                      </p>
                    </div>
                    <p className="text-primary font-semibold">
                      {formatPrice(p.price)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {typed && (
            <button
              type="button"
              onClick={goToResults}
              className="btn btn-outline mt-4"
            >
              See all results for "{query.trim()}"
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
