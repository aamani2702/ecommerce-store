const express = require("express");
const pool = require("../db");
const { authenticate, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();
const MAX_IMAGES = 10;

// GET /api/products/:id/images (public): cover image first, then the extra images
router.get("/:id/images", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid product id" });
  }
  try {
    const product = await pool.query(
      "SELECT image_url FROM products WHERE id = $1",
      [id],
    );
    if (product.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    const extras = await pool.query(
      "SELECT url FROM product_images WHERE product_id = $1 ORDER BY position, id",
      [id],
    );
    const images = [
      product.rows[0].image_url,
      ...extras.rows.map((r) => r.url),
    ].filter(Boolean);
    res.json({ images });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/products/:id/images (admin): replace all images. The first one becomes the cover.
router.put("/:id/images", authenticate, adminOnly, async (req, res) => {
  const id = parseInt(req.params.id);
  const { images } = req.body;

  if (isNaN(id) || !Array.isArray(images)) {
    return res.status(400).json({ message: "images must be a list of links" });
  }

  const clean = images
    .map((u) => (typeof u === "string" ? u.trim() : ""))
    .filter(Boolean);

  if (clean.length > MAX_IMAGES) {
    return res
      .status(400)
      .json({ message: `Maximum ${MAX_IMAGES} images per product` });
  }
  if (clean.some((u) => !/^https?:\/\//i.test(u))) {
    return res
      .status(400)
      .json({
        message: "Every image must be a full link starting with http or https",
      });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const updated = await client.query(
      "UPDATE products SET image_url = $1 WHERE id = $2 RETURNING id",
      [clean[0] || null, id],
    );
    if (updated.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Product not found" });
    }

    await client.query("DELETE FROM product_images WHERE product_id = $1", [
      id,
    ]);
    for (let i = 1; i < clean.length; i++) {
      await client.query(
        "INSERT INTO product_images (product_id, url, position) VALUES ($1, $2, $3)",
        [id, clean[i], i],
      );
    }

    await client.query("COMMIT");
    res.json({ images: clean });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
});

module.exports = router;
