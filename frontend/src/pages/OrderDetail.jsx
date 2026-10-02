import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api";
import { formatDate, formatPrice, STATUS_STYLES } from "../utils";

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/orders/${id}`)
      .then((res) => setOrder(res.data))
      .catch(() => setError("Order not found"));
  }, [id]);

  if (error) return <p className="max-w-4xl mx-auto px-4 py-10">{error}</p>;
  if (!order) return <p className="max-w-4xl mx-auto px-4 py-10">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl">Order #{order.id}</h1>
        <span
          className={`text-xs px-2 py-1 rounded-full ${STATUS_STYLES[order.status] || ""}`}
        >
          {order.status}
        </span>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Placed on {formatDate(order.created_at)}
      </p>

      <div className="bg-white rounded-lg shadow-sm divide-y">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between p-4 text-sm">
            <div>
              <p className="font-medium">{item.product_name}</p>
              <p className="text-gray-500">
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
      <Link
        to="/orders"
        className="inline-block mt-6 text-primary underline text-sm"
      >
        Back to my orders
      </Link>
    </div>
  );
}
