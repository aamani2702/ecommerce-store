export const formatPrice = (n) => "₹" + Number(n).toLocaleString("en-IN");

export const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

// Percentage off, or 0 when there is no discount
export function discountPercent(price, mrp) {
  const p = Number(price);
  const m = Number(mrp);
  if (!m || m <= p) return 0;
  return Math.round((1 - p / m) * 100);
}

export const STATUS_STYLES = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-700",
};
