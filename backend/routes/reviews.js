// backend/routes/reviews.js
const express = require("express");
const router = express.Router();
const { getProductReviews, addReview, deleteReview, getMyReviews } = require("../controllers/reviewController");
const { verifyToken } = require("../middleware/auth");

router.get("/my", verifyToken, getMyReviews);
router.get("/:id", getProductReviews);                           // GET /api/reviews/1
router.post("/:id", verifyToken, addReview);                     // POST /api/reviews/1
router.delete("/:id/:reviewId", verifyToken, deleteReview);      // DELETE /api/reviews/1/5

module.exports = router;