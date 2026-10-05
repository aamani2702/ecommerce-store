import { useCallback, useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { payForOrder } from "../payment";
import { formatDate, formatPrice, STATUS_STYLES } from "../utils";

export default function OrderDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(
    searchParams.get("paid")
      ? "Payment received. Thank you for your order!"
      : "",
  );

  const loadOrder = useCallback(() => {
    return api
      .get(`/orders/${id}`)
      .then((res) => setOrder(res.data))
      .catch(() => setError("Order not found"));
  }, [id]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  async function handlePay() {
    setBusy(true);
    setNotice("");
    try {
      const paid = await payForOrder(order.id, user);
      if (paid) setNotice("Payment received. Thank you for your order!");
      await loadOrder();
    } catch (err) {
      setNotice(
        err.response?.data?.message ||
          err.message ||
          "Payment failed. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleCancel() {
    if (!window.confirm("Cancel this order?")) return;
    setBusy(true);
    setNotice("");
    try {
      await api.post(`/orders/${order.id}/cancel`);
      setNotice("Order cancelled.");
      await loadOrder();
    } catch (err) {
      setNotice(err.response?.data?.message || "Could not cancel the order");
    } finally {
      setBusy(false);
    }
  }

  if (error) return <p className="max-w-4xl mx-auto px-4 py-10">{error}</p>;
  if (!order) return <p className="max-w-4xl mx-auto px-4 py-10">Loading...</p>;

  const isMine = user && order.user_id === user.id;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-4xl">Order #{order.id}</h1>
        <span
          className={`text-xs px-2 py-1 rounded-full ${STATUS_STYLES[order.status] || ""}`}
        >
          {order.status}
        </span>
      </div>
      <p className="text-sm text-ink/60 mb-6">
        Placed on {formatDate(order.created_at)}
      </p>

      {notice && <p className="mb-4 p-3 rounded bg-sand text-sm">{notice}</p>}

      <div className="bg-white rounded-lg shadow-sm divide-y">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between p-4 text-sm">
            <div>
              <p className="font-medium">{item.product_name}</p>
              <p className="text-ink/60">
                {item.color} · {item.size} · Qty {item.quantity}
              </p>
            </div>
            <p>{formatPrice(item.price_at_purchase * item.quantity)}</p>
          </div>
        ))}
        <div className="flex justify-between p-4 font-semibold">
          <span>Total</span>
          <span className="text-primary">{formatPrice(order.total)}</span>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <span className="font-medium">Shipping to:</span>{" "}
        {order.shipping_address}
      </p>

      {isMine && order.status === "pending" && (
        <div className="mt-6 flex gap-3">
          <button
            onClick={handlePay}
            disabled={busy}
            className="btn btn-primary"
          >
            {busy ? "Please wait..." : "Pay now"}
          </button>
          <button
            onClick={handleCancel}
            disabled={busy}
            className="btn btn-outline"
          >
            Cancel order
          </button>
        </div>
      )}

      <Link
        to="/orders"
        className="inline-block mt-6 text-primary underline text-sm"
      >
        Back to my orders
      </Link>
    </div>
  );
}
