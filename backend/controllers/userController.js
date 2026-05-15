// backend/controllers/userController.js
const pool = require("../config/db");

// Get all users (admin)
const getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query(
      "SELECT id, name, email, phone, role, shop_name, category, bio, status, created_at FROM users ORDER BY created_at DESC"
    );
    res.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Suspend/restore user (admin)
const toggleUserStatus = async (req, res) => {
  try {
    const [users] = await pool.query("SELECT status FROM users WHERE id = ?", [req.params.id]);
    if (users.length === 0) return res.status(404).json({ message: "User not found." });
    const newStatus = users[0].status === "active" ? "suspended" : "active";
    await pool.query("UPDATE users SET status = ? WHERE id = ?", [newStatus, req.params.id]);
    res.json({ message: `User ${newStatus}`, status: newStatus });
  } catch (error) {
    console.error("Toggle user error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Get artisan stats
const getArtisanStats = async (req, res) => {
  try {
    const artisan_id = req.user.id;
    const [productCount] = await pool.query("SELECT COUNT(*) as count FROM products WHERE artisan_id = ?", [artisan_id]);
    const [orderData] = await pool.query(
      `SELECT COUNT(DISTINCT o.id) as order_count, COALESCE(SUM(oi.price * oi.quantity), 0) as revenue
       FROM orders o JOIN order_items oi ON o.id = oi.order_id JOIN products p ON oi.product_id = p.id
       WHERE p.artisan_id = ?`,
      [artisan_id]
    );
    res.json({
      products: productCount[0].count,
      orders: orderData[0].order_count,
      revenue: orderData[0].revenue,
    });
  } catch (error) {
    console.error("Get artisan stats error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Get admin stats
const getAdminStats = async (req, res) => {
  try {
    const [users] = await pool.query("SELECT COUNT(*) as count FROM users");
    const [artisans] = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'artisan'");
    const [orders] = await pool.query("SELECT COUNT(*) as count FROM orders");
    const [products] = await pool.query("SELECT COUNT(*) as count FROM products");
    res.json({
      totalUsers: users[0].count,
      activeArtisans: artisans[0].count,
      totalOrders: orders[0].count,
      totalProducts: products[0].count,
    });
  } catch (error) {
    console.error("Get admin stats error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Get all products for admin (including pending)
const getAllProductsAdmin = async (req, res) => {
  try {
    const [products] = await pool.query(
      "SELECT p.*, u.name as artisan_name FROM products p JOIN users u ON p.artisan_id = u.id ORDER BY p.created_at DESC"
    );
    res.json(products);
  } catch (error) {
    console.error("Get all products error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Approve/reject product (admin)
const updateProductStatus = async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query("UPDATE products SET status = ? WHERE id = ?", [status, req.params.id]);
    res.json({ message: `Product ${status}` });
  } catch (error) {
    console.error("Update product status error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Get artisan count (public)
const getArtisanCount = async (req, res) => {
  try {
    const [[{ count }]] = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'artisan' AND status = 'active'");
    res.json({ count });
  } catch (error) {
    console.error("Get artisan count error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = { getAllUsers, toggleUserStatus, getArtisanStats, getAdminStats, getAllProductsAdmin, updateProductStatus, getArtisanCount };