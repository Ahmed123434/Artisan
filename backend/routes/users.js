// backend/routes/users.js
const express = require("express");
const router = express.Router();
const { getAllUsers, toggleUserStatus, getArtisanStats, getAdminStats, getAllProductsAdmin, updateProductStatus, getArtisanCount } = require("../controllers/userController");
const { verifyToken, isArtisan, isAdmin } = require("../middleware/auth");

router.get("/artisan-count", getArtisanCount);  // GET /api/users/artisan-count (public)

// Artisan routes
router.get("/artisan/stats", verifyToken, isArtisan, getArtisanStats);    // GET /api/users/artisan/stats

// Admin routes
router.get("/", verifyToken, isAdmin, getAllUsers);                        // GET /api/users
router.put("/:id/toggle", verifyToken, isAdmin, toggleUserStatus);        // PUT /api/users/1/toggle
router.get("/admin/stats", verifyToken, isAdmin, getAdminStats);          // GET /api/users/admin/stats
router.get("/admin/products", verifyToken, isAdmin, getAllProductsAdmin);  // GET /api/users/admin/products
router.put("/admin/products/:id", verifyToken, isAdmin, updateProductStatus); // PUT /api/users/admin/products/1

router.delete("/admin/products/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM product_images WHERE product_id = ?", [req.params.id]);
    await pool.query("DELETE FROM products WHERE id = ?", [req.params.id]);
    res.json({ message: "Product deleted!" });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
});
module.exports = router;