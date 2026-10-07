// Shows a rating as five stars (rounded to the nearest whole star)
export default function Stars({ value = 0, size = "text-sm" }) {
  const filled = Math.round(Number(value) || 0);
  return (
    <span
      className={`inline-flex ${size}`}
      aria-label={`${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          style={{ color: n <= filled ? "var(--color-accent)" : "#d9d0c8" }}
        >
          ★
        </span>
      ))}
    </span>
  );
}
