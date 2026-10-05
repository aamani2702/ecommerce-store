import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { payForOrder } from "../payment";
import { formatPrice } from "../utils";

export default function Checkout() {
  const { user } = useAuth();
  const { cart, refreshCart } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);

  async function placeOrder(e) {
    e.preventDefault();
    setError("");
    setPlacing(true);
    let orderId = null;
    try {
      // 1. Create the order (stock is reserved and the cart is emptied)
      const res = await api.post("/orders", { shipping_address: address });
      orderId = res.data.id;
      await refreshCart();

      // 2. Open the payment window
      const paid = await payForOrder(orderId, user);
      navigate(`/orders/${orderId}${paid ? "?paid=1" : ""}`);
    } catch (err) {
      if (orderId) {
        // The order exists, so the customer can pay again from the order page
        navigate(`/orders/${orderId}`);
      } else {
        setError(err.response?.data?.message || "Could not place the order");
      }
    } finally {
      setPlacing(false);
    }
  }

  if (cart.items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <p className="mb-3">Your cart is empty.</p>
        <Link to="/shop" className="btn btn-primary">
          Go to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-8">
      <form
        onSubmit={placeOrder}
        className="bg-white p-6 rounded-lg shadow-sm space-y-4"
      >
        <h1 className="text-3xl">Shipping address</h1>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <textarea
          className="input h-32"
          placeholder="House no, street, city, state, PIN code"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />
        <button className="btn btn-primary w-full" disabled={placing}>
          {placing ? "Please wait..." : "Place order and pay"}
        </button>
        <p className="text-xs text-ink/60">
          Payments run in test mode. No real money is charged.
        </p>
      </form>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl mb-4">Order summary</h2>
        <ul className="space-y-2 text-sm">
          {cart.items.map((item) => (
            <li key={item.id} className="flex justify-between">
              <span>
                {item.name} ({item.color}, {item.size}) x {item.quantity}
              </span>
              <span>{formatPrice(item.line_total)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 pt-4 border-t flex justify-between font-semibold">
          <span>Total</span>
          <span className="text-primary">{formatPrice(cart.subtotal)}</span>
        </p>
      </div>
    </div>
  );
}
