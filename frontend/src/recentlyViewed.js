const KEY = "ona_recently_viewed_v1";

export function getRecentlyViewed() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

// Remember the last 8 products the visitor opened (kept in this browser only)
export function addRecentlyViewed(product) {
  try {
    const item = {
      id: product.id,
      name: product.name,
      price: product.price,
      mrp: product.mrp,
      image_url: product.image_url,
      category: product.category,
      fabric: product.fabric,
    };
    const list = getRecentlyViewed().filter((p) => p.id !== item.id);
    localStorage.setItem(KEY, JSON.stringify([item, ...list].slice(0, 8)));
  } catch {
    // Storage can be blocked. The site still works without it.
  }
}
