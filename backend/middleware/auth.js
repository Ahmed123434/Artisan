// backend/middleware/auth.js
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Verify token — protects routes that need login
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ message: "No token provided. Please login." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role }
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

// Check if user is artisan
const isArtisan = (req, res, next) => {
  if (req.user.role !== "artisan") {
    return res.status(403).json({ message: "Access denied. Artisans only." });
  }
  next();
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};

module.exports = { verifyToken, isArtisan, isAdmin };