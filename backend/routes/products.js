const express = require("express");
const pool = require("../db");
const { authenticate, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

const SORT_OPTIONS = {
  newest: "p.created_at DESC",
  price_asc: "p.price ASC",
  price_desc: "p.price DESC",
  name: "p.name ASC",
  rating: "rating_avg DESC NULLS LAST",
};

// Average rating and number of reviews, added to product queries
const RATING_COLUMNS = `
     (SELECT ROUND(AVG(r.rating), 1)::float FROM reviews r WHERE r.product_id = p.id) AS rating_avg,
     (SELECT COUNT(*)::int FROM reviews r WHERE r.product_id = p.id) AS rating_count`;

function handleDbError(err, res) {
  if (err.code === "23514") {
    return res
      .status(400)
      .json({ message: "Invalid value (check price, stock or gender)" });
  }
  if (err.code === "23505") {
    return res.status(409).json({ message: "This record already exists" });
  }
  if (err.code === "23503") {
    return res.status(400).json({ message: "Related record does not exist" });
  }
  console.error(err);
  return res.status(500).json({ message: "Server error" });
}

// GET /api/products  (public: search, filters, sort, pagination)
router.get("/", async (req, res) => {
  const {
    search,
    category,
    gender,
    fabric,
    occasion,
    minPrice,
    maxPrice,
    sort,
    sale,
  } = req.query;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 12, 1), 50);
  const offset = (page - 1) * limit;

  const conditions = ["p.is_active = TRUE"];
  const values = [];

  if (search) {
    values.push(`%${search}%`);
    conditions.push(
      `(p.name ILIKE $${values.length} OR p.description ILIKE $${values.length})`,
    );
  }
  if (category) {
    values.push(category);
    conditions.push(`c.slug = $${values.length}`);
  }
  if (gender) {
    values.push(gender);
    conditions.push(`p.gender = $${values.length}`);
  }
  if (fabric) {
    values.push(fabric);
    conditions.push(`LOWER(p.fabric) = LOWER($${values.length})`);
  }
  if (occasion) {
    values.push(occasion);
    conditions.push(`LOWER(p.occasion) = LOWER($${values.length})`);
  }
  if (minPrice) {
    values.push(Number(minPrice));
    conditions.push(`p.price >= $${values.length}`);
  }
  if (maxPrice) {
    values.push(Number(maxPrice));
    conditions.push(`p.price <= $${values.length}`);
  }
  if (sale) {
    conditions.push("p.mrp IS NOT NULL AND p.mrp > p.price");
  }

  const where = "WHERE " + conditions.join(" AND ");
  const orderBy = SORT_OPTIONS[sort] || SORT_OPTIONS.newest;

  try {
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM products p
          LEFT JOIN categories c ON p.category_id = c.id
          ${where}`,
      values,
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT p.id, p.name, p.description, p.price, p.mrp, p.gender, p.fabric,
                 p.occasion, p.image_url, p.created_at,
                 c.name AS category, c.slug AS category_slug,
                 COALESCE((SELECT SUM(v.stock) FROM product_variants v
                           WHERE v.product_id = p.id), 0)::int AS total_stock,
                 ${RATING_COLUMNS}
          FROM products p
          LEFT JOIN categories c ON p.category_id = c.id
          ${where}
          ORDER BY ${orderBy}, p.id
          LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
      [...values, limit, offset],
    );

    res.json({
      products: result.rows,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/products/:id  (public: one product with its variants)
router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid product id" });
  }
  try {
    const productResult = await pool.query(
      `SELECT p.*, c.name AS category, c.slug AS category_slug,
                 ${RATING_COLUMNS}
          FROM products p
          LEFT JOIN categories c ON p.category_id = c.id
          WHERE p.id = $1 AND p.is_active = TRUE`,
      [id],
    );
    if (productResult.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    const variantResult = await pool.query(
      "SELECT id, size, color, stock FROM product_variants WHERE product_id = $1 ORDER BY color, size",
      [id],
    );
    res.json({ ...productResult.rows[0], variants: variantResult.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/products  (admin: create product with variants)
router.post("/", authenticate, adminOnly, async (req, res) => {
  const {
    name,
    description,
    price,
    mrp,
    details,
    category_id,
    gender,
    fabric,
    occasion,
    image_url,
    variants,
  } = req.body;

  if (!name || price === undefined || Number(price) < 0) {
    return res
      .status(400)
      .json({ message: "Name and a valid price are required" });
  }

  // The original price (MRP) is optional, but it cannot be lower than the selling price
  const mrpValue =
    mrp === undefined || mrp === null || mrp === "" ? null : Number(mrp);
  if (
    mrpValue !== null &&
    (Number.isNaN(mrpValue) || mrpValue < Number(price))
  ) {
    return res
      .status(400)
      .json({
        message: "MRP must be a number that is not lower than the price",
      });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const productResult = await client.query(
      `INSERT INTO products (name, description, price, mrp, details, category_id, gender, fabric, occasion, image_url)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING *`,
      [
        name,
        description || null,
        price,
        mrpValue,
        details || null,
        category_id || null,
        gender || "women",
        fabric || null,
        occasion || null,
        image_url || null,
      ],
    );
    const product = productResult.rows[0];

    const createdVariants = [];
    for (const v of variants || []) {
      const variantResult = await client.query(
        `INSERT INTO product_variants (product_id, size, color, stock)
            VALUES ($1, $2, $3, $4)
            RETURNING id, size, color, stock`,
        [product.id, v.size, v.color, v.stock || 0],
      );
      createdVariants.push(variantResult.rows[0]);
    }

    await client.query("COMMIT");
    res.status(201).json({ ...product, variants: createdVariants });
  } catch (err) {
    await client.query("ROLLBACK");
    handleDbError(err, res);
  } finally {
    client.release();
  }
});

// PUT /api/products/:id  (admin: update any product fields)
router.put("/:id", authenticate, adminOnly, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid product id" });
  }
  const b = req.body;
  try {
    const result = await pool.query(
      `UPDATE products SET
            name = COALESCE($1, name),
            description = COALESCE($2, description),
            price = COALESCE($3, price),
            mrp = COALESCE($4, mrp),
            details = COALESCE($5, details),
            category_id = COALESCE($6, category_id),
            gender = COALESCE($7, gender),
            fabric = COALESCE($8, fabric),
            occasion = COALESCE($9, occasion),
            image_url = COALESCE($10, image_url),
            is_active = COALESCE($11, is_active)
          WHERE id = $12
          RETURNING *`,
      [
        b.name ?? null,
        b.description ?? null,
        b.price ?? null,
        b.mrp ?? null,
        b.details ?? null,
        b.category_id ?? null,
        b.gender ?? null,
        b.fabric ?? null,
        b.occasion ?? null,
        b.image_url ?? null,
        b.is_active ?? null,
        id,
      ],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    handleDbError(err, res);
  }
});

// DELETE /api/products/:id  (admin: soft delete, hides the product)
router.delete("/:id", authenticate, adminOnly, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid product id" });
  }
  try {
    const result = await pool.query(
      "UPDATE products SET is_active = FALSE WHERE id = $1 RETURNING id",
      [id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product hidden from the store" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/products/:id/variants  (admin: add a size/color)
router.post("/:id/variants", authenticate, adminOnly, async (req, res) => {
  const id = parseInt(req.params.id);
  const { size, color, stock } = req.body;
  if (isNaN(id) || !size || !color) {
    return res
      .status(400)
      .json({ message: "Valid product id, size and color are required" });
  }
  try {
    const result = await pool.query(
      `INSERT INTO product_variants (product_id, size, color, stock)
          VALUES ($1, $2, $3, $4)
          RETURNING id, product_id, size, color, stock`,
      [id, size, color, stock || 0],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    handleDbError(err, res);
  }
});

// PUT /api/products/variants/:variantId  (admin: update stock)
router.put(
  "/variants/:variantId",
  authenticate,
  adminOnly,
  async (req, res) => {
    const variantId = parseInt(req.params.variantId);
    const { stock } = req.body;
    if (isNaN(variantId) || stock === undefined) {
      return res
        .status(400)
        .json({ message: "Valid variant id and stock are required" });
    }
    try {
      const result = await pool.query(
        "UPDATE product_variants SET stock = $1 WHERE id = $2 RETURNING id, size, color, stock",
        [stock, variantId],
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Variant not found" });
      }
      res.json(result.rows[0]);
    } catch (err) {
      handleDbError(err, res);
    }
  },
);

module.exports = router;
