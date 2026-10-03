const express = require("express");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const { authenticate, adminOnly } = require("../middleware/authMiddleware");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const router = express.Router();

// Keep the file in memory (max 10 MB), then stream it to Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Runs multer and turns its errors into clear messages
function receiveFile(req, res, next) {
  upload.single("image")(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json({ message: "Image is too large (maximum 10 MB)" });
      }
      return res.status(400).json({ message: "Could not read the file" });
    }
    next();
  });
}

// POST /api/uploads  (admin only, form field name: image)
router.post("/", authenticate, adminOnly, receiveFile, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No image uploaded" });
  }
  if (!req.file.mimetype.startsWith("image/")) {
    return res.status(400).json({ message: "Only image files are allowed" });
  }

  const stream = cloudinary.uploader.upload_stream(
    { folder: "ecommerce-store" },
    (error, result) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: "Upload failed" });
      }
      res.status(201).json({ url: result.secure_url });
    },
  );
  stream.end(req.file.buffer);
});

module.exports = router;
