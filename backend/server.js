require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const pool = require("./db");

const authRoutes = require("./routes/auth");
const categoryRoutes = require("./routes/categories");
const productRoutes = require("./routes/products");
const productImageRoutes = require("./routes/productImages");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/orders");
const uploadRoutes = require("./routes/uploads");

const app = express();

// Render runs behind a proxy. This lets rate limiting see the real visitor address.
app.set("trust proxy", 1);

// Safer default HTTP headers
app.use(helmet());

// Only your own website may call this API from a browser.
// FRONTEND_URL can hold several addresses separated by commas.
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((url) => url.trim());
app.use(cors({ origin: allowedOrigins }));

app.use(express.json());

// Slow down password guessing: 50 login/register attempts per 15 minutes per visitor
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again in a few minutes." },
});

app.get("/", (req, res) => {
  res.send("E-commerce API is running");
});

app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ status: "ok", dbTime: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/products", productImageRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/uploads", uploadRoutes);

// Unknown address
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Any error that was not handled elsewhere
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
