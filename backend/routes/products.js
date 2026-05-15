// backend/routes/products.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const pool = require("../config/db");
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct } = require("../controllers/productController");
const { verifyToken, isArtisan } = require("../middleware/auth");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + Math.random().toString(36).substr(2,6) + path.extname(file.originalname)),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

// Public routes
router.get("/", getProducts);

// Artisan's own products
router.get("/my/all", verifyToken, isArtisan, async (req, res) => {
  try {
    const [products] = await pool.query(
      "SELECT p.*, u.name as artisan_name FROM products p JOIN users u ON p.artisan_id = u.id WHERE p.artisan_id = ? ORDER BY p.created_at DESC",
      [req.user.id]
    );
    for (const product of products) {
      const [images] = await pool.query("SELECT image FROM product_images WHERE product_id = ? ORDER BY is_primary DESC", [product.id]);
      product.extra_images = images.map(i => i.image);
    }
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
});

router.get("/:id", getProduct);

// Accept up to 5 images
router.post("/", verifyToken, isArtisan, upload.array("images", 5), createProduct);
router.put("/:id", verifyToken, isArtisan, upload.array("images", 5), updateProduct);
router.delete("/:id", verifyToken, isArtisan, deleteProduct);

module.exports = router;