import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import api from "../api";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    const res = await api.get("/wishlist");
    setItems(res.data);
  }, [user]);

  useEffect(() => {
    refresh().catch(() => {});
  }, [refresh]);

  const ids = useMemo(() => new Set(items.map((p) => p.id)), [items]);

  // Adds the product if it is not saved, removes it if it is. Returns true when it was added.
  async function toggle(productId) {
    const adding = !ids.has(productId);
    if (adding) await api.post(`/wishlist/${productId}`);
    else await api.delete(`/wishlist/${productId}`);
    await refresh();
    return adding;
  }

  return (
    <WishlistContext.Provider
      value={{
        items,
        count: items.length,
        has: (id) => ids.has(id),
        toggle,
        refresh,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
