// backend/controllers/wishlistController.js
const pool = require("../config/db");

const getWishlist = async (req, res) => {
  try {
    const [items] = await pool.query(
      "SELECT w.id, w.created_at, p.id as product_id, p.name, p.price, p.category, p.image, p.stock, u.name as artisan_name FROM wishlist w JOIN products p ON w.product_id = p.id JOIN users u ON p.artisan_id = u.id WHERE w.user_id = ? ORDER BY w.created_at DESC",
      [req.user.id]
    );
    res.json(items);
  } catch (error) {
    console.error("Get wishlist error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

const addToWishlist = async (req, res) => {
  try {
    const { product_id } = req.body;
    const [existing] = await pool.query("SELECT * FROM wishlist WHERE user_id = ? AND product_id = ?", [req.user.id, product_id]);
    if (existing.length > 0) return res.status(400).json({ message: "Already in wishlist." });
    await pool.query("INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)", [req.user.id, product_id]);
    res.status(201).json({ message: "Added to wishlist!" });
  } catch (error) {
    console.error("Add wishlist error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    await pool.query("DELETE FROM wishlist WHERE user_id = ? AND product_id = ?", [req.user.id, req.params.productId]);
    res.json({ message: "Removed from wishlist." });
  } catch (error) {
    console.error("Remove wishlist error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };