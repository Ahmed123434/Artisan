// backend/controllers/messageController.js
const pool = require("../config/db");

// Get conversations list (unique users you've chatted with)
const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const [conversations] = await pool.query(
      `SELECT u.id, u.name, u.role, u.shop_name,
        (SELECT message FROM messages WHERE (sender_id = u.id AND receiver_id = ?) OR (sender_id = ? AND receiver_id = u.id) ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM messages WHERE (sender_id = u.id AND receiver_id = ?) OR (sender_id = ? AND receiver_id = u.id) ORDER BY created_at DESC LIMIT 1) as last_time,
        (SELECT COUNT(*) FROM messages WHERE sender_id = u.id AND receiver_id = ? AND is_read = 0) as unread
       FROM users u
       WHERE u.id != ? AND u.id IN (
         SELECT DISTINCT sender_id FROM messages WHERE receiver_id = ?
         UNION
         SELECT DISTINCT receiver_id FROM messages WHERE sender_id = ?
       )
       ORDER BY last_time DESC`,
      [userId, userId, userId, userId, userId, userId, userId, userId]
    );
    res.json(conversations);
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Get messages between two users
const getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const otherId = req.params.userId;

    // Mark messages as read
    await pool.query("UPDATE messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ?", [otherId, userId]);

    const [messages] = await pool.query(
      `SELECT m.*, u.name as sender_name FROM messages m JOIN users u ON m.sender_id = u.id
       WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
       ORDER BY m.created_at ASC`,
      [userId, otherId, otherId, userId]
    );
    res.json(messages);
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Send a message
const sendMessage = async (req, res) => {
  try {
    const { receiver_id, message } = req.body;
    const sender_id = req.user.id;

    if (!message || !receiver_id) return res.status(400).json({ message: "Message and receiver required." });

    await pool.query("INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)", [sender_id, receiver_id, message]);
    res.status(201).json({ message: "Message sent!" });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Get all users to start new conversation
const getChatUsers = async (req, res) => {
  try {
    const [users] = await pool.query(
      "SELECT id, name, role, shop_name FROM users WHERE id != ? ORDER BY name",
      [req.user.id]
    );
    res.json(users);
  } catch (error) {
    console.error("Get chat users error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Get unread count
const getUnreadCount = async (req, res) => {
  try {
    const [result] = await pool.query(
      "SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = 0",
      [req.user.id]
    );
    res.json({ unread: result[0].count });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = { getConversations, getMessages, sendMessage, getChatUsers, getUnreadCount };