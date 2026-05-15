// backend/routes/notifications.js
const express = require("express");
const router = express.Router();
const { getNotifications, markAsRead, markAllAsRead, deleteNotification } = require("../controllers/notificationController");
const { verifyToken } = require("../middleware/auth");

router.get("/", verifyToken, getNotifications);              // GET /api/notifications
router.put("/read-all", verifyToken, markAllAsRead);         // PUT /api/notifications/read-all
router.put("/:id/read", verifyToken, markAsRead);            // PUT /api/notifications/1/read
router.delete("/:id", verifyToken, deleteNotification);      // DELETE /api/notifications/1

module.exports = router;