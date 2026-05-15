-- backend/database.sql
-- Run this in MySQL to create the database and tables

CREATE DATABASE IF NOT EXISTS artisan_db;
USE artisan_db;

-- ─── Users Table ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role ENUM('customer', 'artisan', 'admin') DEFAULT 'customer',
  shop_name VARCHAR(100),
  category VARCHAR(100),
  bio TEXT,
  status ENUM('active', 'suspended', 'pending') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Products Table ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100),
  stock INT DEFAULT 0,
  artisan_id INT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (artisan_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── Orders Table ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  shipping_address TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  phone VARCHAR(20),
  status ENUM('pending', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  payment_method VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── Order Items Table ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ─── Auctions Table ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS auctions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  artisan_id INT NOT NULL,
  start_bid DECIMAL(10, 2) NOT NULL,
  current_bid DECIMAL(10, 2),
  status ENUM('live', 'upcoming', 'closed') DEFAULT 'upcoming',
  start_time DATETIME,
  end_time DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (artisan_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── Bids Table ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bids (
  id INT AUTO_INCREMENT PRIMARY KEY,
  auction_id INT NOT NULL,
  user_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── Sample Data ───────────────────────────────────────────────────────────

-- Admin user (password: admin123)
INSERT INTO users (name, email, password, role) VALUES
('Admin', 'admin@artisan.bh', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkf7xPBOxcF1yGs8JxfP3Onu3q5jK', 'admin');

-- Artisan users (password: artisan123)
INSERT INTO users (name, email, password, phone, role, shop_name, category, bio) VALUES
('Ahmed Al-Rashid', 'ahmed@artisan.bh', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkf7xPBOxcF1yGs8JxfP3Onu3q5jK', '+973 3456 7890', 'artisan', 'Al-Rashid Pottery', 'Pottery & Ceramics', 'Traditional Bahraini pottery artist with over 10 years of experience.'),
('Fatima Hassan', 'fatima@artisan.bh', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkf7xPBOxcF1yGs8JxfP3Onu3q5jK', '+973 3456 1234', 'artisan', 'Fatima Jewelry', 'Jewelry & Metalwork', 'Specializing in traditional Bahraini silver jewelry.'),
('Sara Mahmoud', 'sara@artisan.bh', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkf7xPBOxcF1yGs8JxfP3Onu3q5jK', '+973 3456 5678', 'artisan', 'Sara Textiles', 'Textiles & Weaving', 'Handmade textiles using organic materials.');

-- Customer users (password: customer123)
INSERT INTO users (name, email, password, phone, role) VALUES
('Ali Hassan', 'ali@mail.com', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkf7xPBOxcF1yGs8JxfP3Onu3q5jK', '+973 3333 1111', 'customer'),
('Noor Ahmed', 'noor@mail.com', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkf7xPBOxcF1yGs8JxfP3Onu3q5jK', '+973 3333 2222', 'customer');

-- Sample products
INSERT INTO products (name, description, price, category, stock, artisan_id, status) VALUES
('Handmade Vase', 'Hand-painted blue ceramic vase.', 12.00, 'Pottery', 8, 2, 'approved'),
('Silver Necklace', 'Traditional Bahraini silver necklace.', 25.00, 'Jewelry', 5, 3, 'approved'),
('Woven Basket', 'Made from organic straw.', 8.00, 'Textiles', 15, 4, 'approved'),
('Ceramic Teapot', 'Handcrafted ceramic teapot with floral design.', 22.00, 'Pottery', 3, 2, 'approved'),
('Pearl Earrings', 'Elegant pearl earrings with silver hooks.', 35.00, 'Jewelry', 10, 3, 'approved'),
('Silk Scarf', 'Hand-dyed silk scarf with traditional patterns.', 20.00, 'Textiles', 7, 4, 'approved');
