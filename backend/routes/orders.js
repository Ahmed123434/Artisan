// backend/routes/orders.js
const express = require("express");
const router = express.Router();
const { getMyOrders, getArtisanOrders, createOrder, updateOrderStatus, getAllOrders } = require("../controllers/orderController");
const { verifyToken, isArtisan, isAdmin } = require("../middleware/auth");

router.get("/my", verifyToken, getMyOrders);                          // GET /api/orders/my
router.get("/artisan", verifyToken, isArtisan, getArtisanOrders);     // GET /api/orders/artisan
router.get("/all", verifyToken, isAdmin, getAllOrders);                // GET /api/orders/all
router.post("/", verifyToken, createOrder);                           // POST /api/orders
router.put("/:id/status", verifyToken, updateOrderStatus);            // PUT /api/orders/1/status

module.exports = router;