import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils";

export default function Cart() {
  const { cart, updateItem, removeItem } = useCart();
  const [error, setError] = useState("");

  async function run(action) {
    setError("");
    try {
      await action();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  }

  if (cart.items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl mb-3">Your cart is empty</h1>
        <Link to="/shop" className="btn btn-primary">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl mb-6">Your cart</h1>
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <div className="space-y-4">
        {cart.items.map((item) => (
          <div
            key={item.id}
            className="flex gap-4 bg-white p-3 rounded-lg shadow-sm"
          >
            <img
              src={item.image_url}
              alt={item.name}
              className="w-20 h-28 object-cover rounded bg-gray-100"
            />
            <div className="flex-1">
              <Link
                to={`/product/${item.product_id}`}
                className="font-heading text-lg hover:text-primary"
              >
                {item.name}
              </Link>
              <p className="text-sm text-gray-500">
                {item.color} · {item.size}
              </p>
              <p className="text-primary font-semibold mt-1">
                {formatPrice(item.price)}
              </p>

              <div className="flex items-center gap-3 mt-2">
                <button
                  className="btn btn-outline px-3 py-1"
                  disabled={item.quantity <= 1}
                  onClick={() =>
                    run(() => updateItem(item.id, item.quantity - 1))
                  }
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  className="btn btn-outline px-3 py-1"
                  disabled={item.quantity >= item.stock}
                  onClick={() =>
                    run(() => updateItem(item.id, item.quantity + 1))
                  }
                >
                  +
                </button>
                <button
                  className="text-sm text-red-600 underline ml-4"
                  onClick={() => run(() => removeItem(item.id))}
                >
                  Remove
                </button>
              </div>
            </div>
            <p className="font-semibold">{formatPrice(item.line_total)}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-end gap-3">
        <p className="text-xl">
          Subtotal:{" "}
          <span className="font-semibold text-primary">
            {formatPrice(cart.subtotal)}
          </span>
        </p>
        <Link to="/checkout" className="btn btn-primary">
          Proceed to checkout
        </Link>
      </div>
    </div>
  );
}
