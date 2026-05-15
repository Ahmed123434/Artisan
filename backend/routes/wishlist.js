// backend/routes/wishlist.js
const express = require("express");
const router = express.Router();
const { getWishlist, addToWishlist, removeFromWishlist } = require("../controllers/wishlistController");
const { verifyToken } = require("../middleware/auth");

router.get("/", verifyToken, getWishlist);                        // GET /api/wishlist
router.post("/", verifyToken, addToWishlist);                     // POST /api/wishlist
router.delete("/:productId", verifyToken, removeFromWishlist);    // DELETE /api/wishlist/5

module.exports = router;