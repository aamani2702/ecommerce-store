import { useEffect, useState } from "react";
import api from "../../api";
import AdminNav from "../../components/AdminNav";
import { formatDate, formatPrice } from "../../utils";

const STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("");

  function loadOrders() {
    api
      .get("/orders/admin/all", { params: filter ? { status: filter } : {} })
      .then((res) => setOrders(res.data));
  }

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function changeStatus(id, status) {
    await api.put(`/orders/${id}/status`, { status });
    loadOrders();
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl mb-6">Admin</h1>
      <AdminNav />

      <div className="flex items-center gap-3 mb-4">
        <span className="text-sm">Show:</span>
        <select
          className="input w-48"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">All orders</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Order</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Date</th>
              <th className="p-3">Total</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t">
                <td className="p-3">#{o.id}</td>
                <td className="p-3">
                  {o.customer_name}
                  <br />
                  <span className="text-gray-500">{o.customer_email}</span>
                </td>
                <td className="p-3">{formatDate(o.created_at)}</td>
                <td className="p-3">{formatPrice(o.total)}</td>
                <td className="p-3">
                  <select
                    className="input w-36"
                    value={o.status}
                    onChange={(e) => changeStatus(o.id, e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <p className="p-6 text-center text-gray-500">No orders.</p>
        )}
      </div>
    </div>
  );
}
