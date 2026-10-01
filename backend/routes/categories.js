const express = require("express");
const pool = require("../db");
const { authenticate, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/categories (public)
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, slug FROM categories ORDER BY name",
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/categories (admin only)
router.post("/", authenticate, adminOnly, async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: "Category name is required" });
  }
  const slug = (req.body.slug || name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  try {
    const result = await pool.query(
      "INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING id, name, slug",
      [name, slug],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ message: "Category already exists" });
    }
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
