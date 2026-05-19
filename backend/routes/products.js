// backend/routes/products.js
const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct } = require("../controllers/productController");
const { verifyToken, isArtisan } = require("../middleware/auth");
const { upload } = require("../config/cloudinary");

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

// Accept up to 5 images via Cloudinary
router.post("/", verifyToken, isArtisan, upload.array("images", 5), createProduct);
router.put("/:id", verifyToken, isArtisan, upload.array("images", 5), updateProduct);
router.delete("/:id", verifyToken, isArtisan, deleteProduct);

module.exports = router;