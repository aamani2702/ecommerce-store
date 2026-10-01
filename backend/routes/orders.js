const express = require("express");
const pool = require("../db");
const { authenticate, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

const ORDER_STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"];

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// POST /api/orders  (checkout: turns my cart into an order)
router.post("/", authenticate, async (req, res) => {
  const { shipping_address } = req.body;
  if (!shipping_address || !shipping_address.trim()) {
    return res.status(400).json({ message: "Shipping address is required" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Lock the variant rows so two buyers cannot take the last item at the same time
    const cartResult = await client.query(
      `SELECT ci.variant_id, ci.quantity,
                 v.size, v.color, v.stock,
                 p.name, p.price, p.is_active
          FROM cart_items ci
          JOIN product_variants v ON ci.variant_id = v.id
          JOIN products p ON v.product_id = p.id
          WHERE ci.user_id = $1
          ORDER BY v.id
          FOR UPDATE OF v`,
      [req.user.id],
    );
    const items = cartResult.rows;

    if (items.length === 0) {
      throw new HttpError(400, "Your cart is empty");
    }

    let totalCents = 0;
    for (const item of items) {
      if (!item.is_active) {
        throw new HttpError(409, `${item.name} is no longer available`);
      }
      if (item.quantity > item.stock) {
        throw new HttpError(
          409,
          `Not enough stock for ${item.name} (${item.size}, ${item.color}). Available: ${item.stock}`,
        );
      }
      totalCents += Math.round(Number(item.price) * 100) * item.quantity;
    }

    const orderResult = await client.query(
      `INSERT INTO orders (user_id, total, shipping_address)
          VALUES ($1, $2, $3)
          RETURNING id, total, status, shipping_address, created_at`,
      [req.user.id, totalCents / 100, shipping_address.trim()],
    );
    const order = orderResult.rows[0];

    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, variant_id, product_name, size, color, quantity, price_at_purchase)
            VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          order.id,
          item.variant_id,
          item.name,
          item.size,
          item.color,
          item.quantity,
          item.price,
        ],
      );
      await client.query(
        "UPDATE product_variants SET stock = stock - $1 WHERE id = $2",
        [item.quantity, item.variant_id],
      );
    }

    await client.query("DELETE FROM cart_items WHERE user_id = $1", [
      req.user.id,
    ]);

    await client.query("COMMIT");
    res.status(201).json(order);
  } catch (err) {
    await client.query("ROLLBACK");
    if (err instanceof HttpError) {
      return res.status(err.status).json({ message: err.message });
    }
    console.error(err);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
});

// GET /api/orders  (my order history)
router.get("/", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, total, status, shipping_address, created_at
          FROM orders
          WHERE user_id = $1
          ORDER BY created_at DESC`,
      [req.user.id],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/orders/admin/all  (admin: every order, optional ?status=)
router.get("/admin/all", authenticate, adminOnly, async (req, res) => {
  const { status } = req.query;
  const values = [];
  let where = "";
  if (status) {
    values.push(status);
    where = "WHERE o.status = $1";
  }
  try {
    const result = await pool.query(
      `SELECT o.id, o.total, o.status, o.shipping_address, o.created_at,
                 u.name AS customer_name, u.email AS customer_email
          FROM orders o
          JOIN users u ON o.user_id = u.id
          ${where}
          ORDER BY o.created_at DESC
          LIMIT 100`,
      values,
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/orders/:id  (one order with its items; owner or admin only)
router.get("/:id", authenticate, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid order id" });
  }
  try {
    const orderResult = await pool.query(
      `SELECT id, user_id, total, status, shipping_address, created_at
          FROM orders
          WHERE id = $1 AND ($2 = 'admin' OR user_id = $3)`,
      [id, req.user.role, req.user.id],
    );
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }
    const itemsResult = await pool.query(
      `SELECT id, variant_id, product_name, size, color, quantity, price_at_purchase
          FROM order_items
          WHERE order_id = $1
          ORDER BY id`,
      [id],
    );
    res.json({ ...orderResult.rows[0], items: itemsResult.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/orders/:id/status  (admin: change order status)
router.put("/:id/status", authenticate, adminOnly, async (req, res) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;
  if (isNaN(id) || !ORDER_STATUSES.includes(status)) {
    return res.status(400).json({
      message: `Status must be one of: ${ORDER_STATUSES.join(", ")}`,
    });
  }
  try {
    const result = await pool.query(
      "UPDATE orders SET status = $1 WHERE id = $2 RETURNING id, status",
      [status, id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
