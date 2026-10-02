import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import api from "../api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);
const EMPTY_CART = { items: [], itemCount: 0, subtotal: 0 };

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(EMPTY_CART);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart(EMPTY_CART);
      return;
    }
    const res = await api.get("/cart");
    setCart(res.data);
  }, [user]);

  useEffect(() => {
    refreshCart().catch(() => {});
  }, [refreshCart]);

  async function addToCart(variantId, quantity = 1) {
    await api.post("/cart", { variant_id: variantId, quantity });
    await refreshCart();
  }

  async function updateItem(itemId, quantity) {
    await api.put(`/cart/${itemId}`, { quantity });
    await refreshCart();
  }

  async function removeItem(itemId) {
    await api.delete(`/cart/${itemId}`);
    await refreshCart();
  }

  return (
    <CartContext.Provider
      value={{ cart, refreshCart, addToCart, updateItem, removeItem }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
