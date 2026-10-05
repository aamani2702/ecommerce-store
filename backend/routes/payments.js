const express = require("express");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const pool = require("../db");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

// Created on first use, so the server still starts if the keys are not set yet
let client = null;
function getClient() {
  if (!client) {
    client = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return client;
}

// POST /api/payments/create-order  { order_id }
router.post("/create-order", authenticate, async (req, res) => {
  const orderId = parseInt(req.body.order_id);
  if (isNaN(orderId)) {
    return res.status(400).json({ message: "order_id is required" });
  }

  try {
    // The amount always comes from the database, never from the browser
    const result = await pool.query(
      "SELECT id, total, status FROM orders WHERE id = $1 AND user_id = $2",
      [orderId, req.user.id],
    );
    const order = result.rows[0];
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.status !== "pending") {
      return res
        .status(409)
        .json({ message: "This order is not waiting for payment" });
    }

    const paymentOrder = await getClient().orders.create({
      amount: Math.round(Number(order.total) * 100), // rupees to paise
      currency: "INR",
      receipt: `order_${order.id}`,
    });

    await pool.query("UPDATE orders SET razorpay_order_id = $1 WHERE id = $2", [
      paymentOrder.id,
      order.id,
    ]);

    res.json({
      razorpay_order_id: paymentOrder.id,
      amount: paymentOrder.amount,
      currency: paymentOrder.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not start the payment" });
  }
});

// POST /api/payments/verify  { order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature }
router.post("/verify", authenticate, async (req, res) => {
  const orderId = parseInt(req.body.order_id);
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  if (
    isNaN(orderId) ||
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature
  ) {
    return res.status(400).json({ message: "Payment details are missing" });
  }

  // Razorpay signs "order_id|payment_id" with your secret key
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  const given = Buffer.from(String(razorpay_signature));
  const wanted = Buffer.from(expected);
  const valid =
    given.length === wanted.length && crypto.timingSafeEqual(given, wanted);

  if (!valid) {
    return res.status(400).json({ message: "Payment verification failed" });
  }

  try {
    const result = await pool.query(
      `UPDATE orders
       SET status = 'paid', payment_id = $1
       WHERE id = $2 AND user_id = $3 AND razorpay_order_id = $4 AND status = 'pending'
       RETURNING id, status`,
      [razorpay_payment_id, orderId, req.user.id, razorpay_order_id],
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Order not found or already paid" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
