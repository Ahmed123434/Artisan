// backend/controllers/reviewController.js
const pool = require("../config/db");

// Get reviews for a product
const getProductReviews = async (req, res) => {
  try {
    const [reviews] = await pool.query(
      "SELECT r.*, u.name as user_name FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.product_id = ? ORDER BY r.created_at DESC",
      [req.params.id]
    );
    const [avg] = await pool.query(
      "SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM reviews WHERE product_id = ?",
      [req.params.id]
    );
    res.json({ reviews, avg_rating: avg[0].avg_rating || 0, count: avg[0].count });
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Add a review
const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product_id = req.params.id;
    const user_id = req.user.id;

    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: "Rating must be 1-5" });

    // Check if already reviewed
    const [existing] = await pool.query("SELECT * FROM reviews WHERE product_id = ? AND user_id = ?", [product_id, user_id]);
    if (existing.length > 0) return res.status(400).json({ message: "You already reviewed this product." });

    await pool.query("INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)", [product_id, user_id, rating, comment]);
    res.status(201).json({ message: "Review added!" });
  } catch (error) {
    console.error("Add review error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Delete a review (own review only)
const deleteReview = async (req, res) => {
  try {
    const [reviews] = await pool.query("SELECT * FROM reviews WHERE id = ? AND user_id = ?", [req.params.reviewId, req.user.id]);
    if (reviews.length === 0) return res.status(404).json({ message: "Review not found." });
    await pool.query("DELETE FROM reviews WHERE id = ?", [req.params.reviewId]);
    res.json({ message: "Review deleted." });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

const getMyReviews = async (req, res) => {
  try {
    const [reviews] = await pool.query(
      "SELECT * FROM reviews WHERE user_id = ?",
      [req.user.id]
    );
    res.json(reviews);
  } catch (error) {
    console.error("Get my reviews error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = { getProductReviews, addReview, deleteReview, getMyReviews };