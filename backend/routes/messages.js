// backend/routes/messages.js
const express = require("express");
const router = express.Router();
const { getConversations, getMessages, sendMessage, getChatUsers, getUnreadCount } = require("../controllers/messageController");
const { verifyToken } = require("../middleware/auth");

router.get("/conversations", verifyToken, getConversations);
router.get("/users", verifyToken, getChatUsers);
router.get("/unread", verifyToken, getUnreadCount);
router.get("/:userId", verifyToken, getMessages);
router.post("/", verifyToken, sendMessage);

module.exports = router;