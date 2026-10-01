const express = require("express");
const pool = require("../db");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

// Every cart route needs a logged-in user
router.use(authenticate);

// GET /api/cart  (my cart with totals)
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ci.id, ci.quantity,
                 v.id AS variant_id, v.size, v.color, v.stock,
                 p.id AS product_id, p.name, p.price, p.image_url,
                 (p.price * ci.quantity) AS line_total
          FROM cart_items ci
          JOIN product_variants v ON ci.variant_id = v.id
          JOIN products p ON v.product_id = p.id
          WHERE ci.user_id = $1 AND p.is_active = TRUE
          ORDER BY ci.id`,
      [req.user.id],
    );

    const subtotalCents = result.rows.reduce(
      (sum, item) => sum + Math.round(Number(item.line_total) * 100),
      0,
    );

    res.json({
      items: result.rows,
      itemCount: result.rows.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: subtotalCents / 100,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/cart  (add a variant; adds to the quantity if already in cart)
router.post("/", async (req, res) => {
  const variantId = parseInt(req.body.variant_id);
  const quantity = parseInt(req.body.quantity) || 1;

  if (isNaN(variantId) || quantity < 1) {
    return res
      .status(400)
      .json({ message: "Valid variant_id and quantity are required" });
  }

  try {
    const variantResult = await pool.query(
      `SELECT v.id, v.stock
          FROM product_variants v
          JOIN products p ON v.product_id = p.id
          WHERE v.id = $1 AND p.is_active = TRUE`,
      [variantId],
    );
    if (variantResult.rows.length === 0) {
      return res.status(404).json({ message: "Product variant not found" });
    }
    const stock = variantResult.rows[0].stock;

    const existing = await pool.query(
      "SELECT quantity FROM cart_items WHERE user_id = $1 AND variant_id = $2",
      [req.user.id, variantId],
    );
    const newQuantity =
      (existing.rows[0] ? existing.rows[0].quantity : 0) + quantity;

    if (newQuantity > stock) {
      return res.status(409).json({ message: `Only ${stock} in stock` });
    }

    const result = await pool.query(
      `INSERT INTO cart_items (user_id, variant_id, quantity)
          VALUES ($1, $2, $3)
          ON CONFLICT (user_id, variant_id)
          DO UPDATE SET quantity = $3
          RETURNING id, variant_id, quantity`,
      [req.user.id, variantId, newQuantity],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/cart/:itemId  (set a new quantity)
router.put("/:itemId", async (req, res) => {
  const itemId = parseInt(req.params.itemId);
  const quantity = parseInt(req.body.quantity);

  if (isNaN(itemId) || isNaN(quantity) || quantity < 1) {
    return res
      .status(400)
      .json({ message: "Quantity must be 1 or more (use DELETE to remove)" });
  }

  try {
    const item = await pool.query(
      `SELECT ci.id, v.stock
          FROM cart_items ci
          JOIN product_variants v ON ci.variant_id = v.id
          WHERE ci.id = $1 AND ci.user_id = $2`,
      [itemId, req.user.id],
    );
    if (item.rows.length === 0) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    if (quantity > item.rows[0].stock) {
      return res
        .status(409)
        .json({ message: `Only ${item.rows[0].stock} in stock` });
    }

    const result = await pool.query(
      "UPDATE cart_items SET quantity = $1 WHERE id = $2 AND user_id = $3 RETURNING id, variant_id, quantity",
      [quantity, itemId, req.user.id],
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/cart/:itemId  (remove one item)
router.delete("/:itemId", async (req, res) => {
  const itemId = parseInt(req.params.itemId);
  if (isNaN(itemId)) {
    return res.status(400).json({ message: "Invalid cart item id" });
  }
  try {
    const result = await pool.query(
      "DELETE FROM cart_items WHERE id = $1 AND user_id = $2 RETURNING id",
      [itemId, req.user.id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    res.json({ message: "Item removed from cart" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/cart  (empty the whole cart)
router.delete("/", async (req, res) => {
  try {
    await pool.query("DELETE FROM cart_items WHERE user_id = $1", [
      req.user.id,
    ]);
    res.json({ message: "Cart cleared" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
