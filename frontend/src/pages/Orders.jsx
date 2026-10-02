import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { formatDate, formatPrice, STATUS_STYLES } from "../utils";

export default function Orders() {
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    api.get("/orders").then((res) => setOrders(res.data));
  }, []);

  if (!orders)
    return <p className="max-w-4xl mx-auto px-4 py-10">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl mb-6">My orders</h1>
      {orders.length === 0 && <p>You have not placed any orders yet.</p>}
      <div className="space-y-3">
        {orders.map((o) => (
          <Link
            key={o.id}
            to={`/orders/${o.id}`}
            className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition"
          >
            <div>
              <p className="font-medium">Order #{o.id}</p>
              <p className="text-sm text-gray-500">
                {formatDate(o.created_at)}
              </p>
            </div>
            <span
              className={`text-xs px-2 py-1 rounded-full ${STATUS_STYLES[o.status] || ""}`}
            >
              {o.status}
            </span>
            <p className="font-semibold text-primary">{formatPrice(o.total)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
