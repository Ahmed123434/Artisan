// backend/controllers/notificationController.js
const pool = require("../config/db");

const getNotifications = async (req, res) => {
  try {
    const [notifications] = await pool.query(
      "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50",
      [req.user.id]
    );
    const [unread] = await pool.query(
      "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0",
      [req.user.id]
    );
    res.json({ notifications, unreadCount: unread[0].count });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

const markAsRead = async (req, res) => {
  try {
    await pool.query("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
    res.json({ message: "Marked as read." });
  } catch (error) {
    console.error("Mark read error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await pool.query("UPDATE notifications SET is_read = 1 WHERE user_id = ?", [req.user.id]);
    res.json({ message: "All marked as read." });
  } catch (error) {
    console.error("Mark all read error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

const deleteNotification = async (req, res) => {
  try {
    await pool.query("DELETE FROM notifications WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
    res.json({ message: "Deleted." });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Helper: create notification (used by other controllers)
const createNotification = async (userId, title, message, type = "info") => {
  try {
    await pool.query("INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)", [userId, title, message, type]);
  } catch (error) {
    console.error("Create notification error:", error);
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead, deleteNotification, createNotification };