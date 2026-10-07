import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { formatDate } from "../utils";
import Stars from "./Stars";

const EMPTY = { count: 0, average: 0, s5: 0, s4: 0, s3: 0, s2: 0, s1: 0 };

export default function ReviewsSection({ productId, onSummary }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [summary, setSummary] = useState(EMPTY);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    return api
      .get(`/products/${productId}/reviews`)
      .then((res) => {
        setSummary(res.data.summary);
        setReviews(res.data.reviews);
        if (onSummary) onSummary(res.data.summary);
      })
      .catch(() => {});
  }, [productId, onSummary]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post(`/products/${productId}/reviews`, {
        rating,
        title,
        comment,
      });
      showToast("Thank you for your review");
      setTitle("");
      setComment("");
      await load();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Could not save your review",
        "error",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      id="reviews"
      className="max-w-6xl mx-auto px-4 py-12 border-t border-pastel-dark"
    >
      <h2 className="section-title">Customer reviews</h2>

      <div className="grid md:grid-cols-3 gap-10">
        {/* Summary and form */}
        <div>
          {summary.count > 0 ? (
            <div className="mb-8">
              <p className="text-5xl font-heading">{summary.average}</p>
              <Stars value={summary.average} size="text-xl" />
              <p className="text-sm text-ink/60 mt-1">
                Based on {summary.count}{" "}
                {summary.count === 1 ? "review" : "reviews"}
              </p>
              <div className="mt-4 space-y-1.5">
                {[5, 4, 3, 2, 1].map((n) => {
                  const count = summary[`s${n}`];
                  const pct = Math.round((count / summary.count) * 100);
                  return (
                    <div key={n} className="flex items-center gap-2 text-xs">
                      <span className="w-8">{n} ★</span>
                      <div className="grow h-2 bg-sand rounded">
                        <div
                          className="h-2 rounded bg-accent"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-6 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-ink/70 mb-8">
              No reviews yet. Be the first to share your thoughts.
            </p>
          )}

          {user ? (
            <form
              onSubmit={handleSubmit}
              className="bg-white p-5 rounded-lg shadow-sm space-y-3"
            >
              <h3 className="text-2xl">Write a review</h3>
              <div className="flex gap-1 text-3xl">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    type="button"
                    key={n}
                    onClick={() => setRating(n)}
                    aria-label={`${n} stars`}
                    style={{
                      color: n <= rating ? "var(--color-accent)" : "#d9d0c8",
                    }}
                  >
                    ★
                  </button>
                ))}
              </div>
              <input
                className="input text-sm"
                placeholder="Title (optional)"
                maxLength={120}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                className="input text-sm h-24"
                placeholder="Tell others about the fit, fabric, and colour"
                maxLength={2000}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <button className="btn btn-primary w-full" disabled={saving}>
                {saving ? "Saving..." : "Submit review"}
              </button>
              <p className="text-xs text-ink/60">
                If you already reviewed this product, this replaces your earlier
                review.
              </p>
            </form>
          ) : (
            <p className="text-sm">
              <Link
                to="/login"
                state={{ from: `/product/${productId}` }}
                className="text-primary underline"
              >
                Log in
              </Link>{" "}
              to write a review.
            </p>
          )}
        </div>

        {/* Review list */}
        <div className="md:col-span-2 space-y-5">
          {reviews.map((r) => (
            <article key={r.id} className="bg-white p-5 rounded-lg shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <Stars value={r.rating} />
                <span className="text-xs text-ink/50">
                  {formatDate(r.created_at)}
                </span>
              </div>
              {r.title && <h3 className="text-xl mt-2">{r.title}</h3>}
              {r.comment && (
                <p className="mt-1 text-sm text-ink/80 whitespace-pre-line">
                  {r.comment}
                </p>
              )}
              <p className="mt-3 text-xs text-ink/60">
                {r.name}
                {r.verified && (
                  <span className="ml-2 text-primary">✓ Verified buyer</span>
                )}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
