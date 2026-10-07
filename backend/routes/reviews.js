const express = require("express");
const pool = require("../db");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

function cleanText(value, max) {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text ? text.slice(0, max) : null;
}

// GET /api/products/:id/reviews  (public: star summary and the reviews)
router.get("/products/:id/reviews", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid product id" });
  }
  try {
    const summary = await pool.query(
      `SELECT COUNT(*)::int AS count,
                 COALESCE(ROUND(AVG(rating), 1), 0)::float AS average,
                 COUNT(*) FILTER (WHERE rating = 5)::int AS s5,
                 COUNT(*) FILTER (WHERE rating = 4)::int AS s4,
                 COUNT(*) FILTER (WHERE rating = 3)::int AS s3,
                 COUNT(*) FILTER (WHERE rating = 2)::int AS s2,
                 COUNT(*) FILTER (WHERE rating = 1)::int AS s1
          FROM reviews
          WHERE product_id = $1`,
      [id],
    );

    // Only the first name is shown. "Verified" means the reviewer bought this product.
    const reviews = await pool.query(
      `SELECT r.id, r.rating, r.title, r.comment, r.created_at,
                 split_part(u.name, ' ', 1) AS name,
                 EXISTS (
                   SELECT 1
                   FROM orders o
                   JOIN order_items oi ON oi.order_id = o.id
                   JOIN product_variants v ON v.id = oi.variant_id
                   WHERE o.user_id = r.user_id AND v.product_id = r.product_id AND o.status <> 'cancelled'
                 ) AS verified
          FROM reviews r
          JOIN users u ON u.id = r.user_id
          WHERE r.product_id = $1
          ORDER BY r.created_at DESC
          LIMIT 50`,
      [id],
    );

    res.json({ summary: summary.rows[0], reviews: reviews.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/products/:id/reviews  (logged in: add or update my review)
router.post("/products/:id/reviews", authenticate, async (req, res) => {
  const id = parseInt(req.params.id);
  const rating = parseInt(req.body.rating);
  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid product id" });
  }
  if (!(rating >= 1 && rating <= 5)) {
    return res.status(400).json({ message: "Rating must be from 1 to 5" });
  }

  const title = cleanText(req.body.title, 120);
  const comment = cleanText(req.body.comment, 2000);

  try {
    await pool.query(
      `INSERT INTO reviews (product_id, user_id, rating, title, comment)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (product_id, user_id)
          DO UPDATE SET rating = EXCLUDED.rating,
                        title = EXCLUDED.title,
                        comment = EXCLUDED.comment,
                        created_at = NOW()`,
      [id, req.user.id, rating, title, comment],
    );
    res.status(201).json({ message: "Review saved" });
  } catch (err) {
    if (err.code === "23503") {
      return res.status(404).json({ message: "Product not found" });
    }
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/products/:id/reviews  (logged in: delete my review)
router.delete("/products/:id/reviews", authenticate, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid product id" });
  }
  try {
    await pool.query(
      "DELETE FROM reviews WHERE product_id = $1 AND user_id = $2",
      [id, req.user.id],
    );
    res.json({ message: "Review deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/reviews/latest  (public: recent good reviews for the home page)
router.get("/reviews/latest", async (req, res) => {
  try {
    const overall = await pool.query(
      `SELECT COUNT(*)::int AS count,
                 COALESCE(ROUND(AVG(rating), 1), 0)::float AS average
          FROM reviews`,
    );
    const latest = await pool.query(
      `SELECT r.id, r.rating, r.title, r.comment,
                 split_part(u.name, ' ', 1) AS name,
                 p.id AS product_id, p.name AS product_name
          FROM reviews r
          JOIN users u ON u.id = r.user_id
          JOIN products p ON p.id = r.product_id
          WHERE r.rating >= 4 AND p.is_active = TRUE AND r.comment IS NOT NULL
          ORDER BY r.created_at DESC
          LIMIT 6`,
    );
    res.json({ ...overall.rows[0], reviews: latest.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
