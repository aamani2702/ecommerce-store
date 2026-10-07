const express = require("express");
const pool = require("../db");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

// Every wishlist route needs a logged-in user
router.use(authenticate);

// GET /api/wishlist  (my saved products, newest first)
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.id, p.name, p.price, p.mrp, p.image_url, p.fabric,
                 c.name AS category,
                 COALESCE((SELECT SUM(v.stock) FROM product_variants v
                           WHERE v.product_id = p.id), 0)::int AS total_stock,
                 (SELECT ROUND(AVG(r.rating), 1)::float FROM reviews r WHERE r.product_id = p.id) AS rating_avg,
                 (SELECT COUNT(*)::int FROM reviews r WHERE r.product_id = p.id) AS rating_count
          FROM wishlist_items w
          JOIN products p ON p.id = w.product_id
          LEFT JOIN categories c ON c.id = p.category_id
          WHERE w.user_id = $1 AND p.is_active = TRUE
          ORDER BY w.created_at DESC`,
      [req.user.id],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/wishlist/:productId  (save a product; saving twice does nothing)
router.post("/:productId", async (req, res) => {
  const productId = parseInt(req.params.productId);
  if (isNaN(productId)) {
    return res.status(400).json({ message: "Invalid product id" });
  }
  try {
    await pool.query(
      `INSERT INTO wishlist_items (user_id, product_id)
          VALUES ($1, $2)
          ON CONFLICT (user_id, product_id) DO NOTHING`,
      [req.user.id, productId],
    );
    res.status(201).json({ message: "Saved to wishlist" });
  } catch (err) {
    if (err.code === "23503") {
      return res.status(404).json({ message: "Product not found" });
    }
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/wishlist/:productId
router.delete("/:productId", async (req, res) => {
  const productId = parseInt(req.params.productId);
  if (isNaN(productId)) {
    return res.status(400).json({ message: "Invalid product id" });
  }
  try {
    await pool.query(
      "DELETE FROM wishlist_items WHERE user_id = $1 AND product_id = $2",
      [req.user.id, productId],
    );
    res.json({ message: "Removed from wishlist" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
