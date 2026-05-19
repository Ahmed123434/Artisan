// backend/controllers/productController.js
const pool = require("../config/db");

const getProducts = async (req, res) => {
  try {
    const [products] = await pool.query(
      "SELECT p.*, u.name as artisan_name FROM products p JOIN users u ON p.artisan_id = u.id WHERE p.status = 'approved' ORDER BY p.created_at DESC"
    );
    for (const product of products) {
      const [images] = await pool.query("SELECT image FROM product_images WHERE product_id = ? ORDER BY is_primary DESC", [product.id]);
      product.extra_images = images.map(i => i.image);
    }
    res.json(products);
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

const getProduct = async (req, res) => {
  try {
    const [products] = await pool.query(
      "SELECT p.*, u.name as artisan_name FROM products p JOIN users u ON p.artisan_id = u.id WHERE p.id = ?",
      [req.params.id]
    );
    if (products.length === 0) return res.status(404).json({ message: "Product not found." });
    const [images] = await pool.query("SELECT image FROM product_images WHERE product_id = ? ORDER BY is_primary DESC", [req.params.id]);
    products[0].extra_images = images.map(i => i.image);
    res.json(products[0]);
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;
    const artisan_id = req.user.id;
    const files = req.files || [];

    // Use Cloudinary URL instead of local path
    const primaryImage = files.length > 0 ? files[0].path : null;

    const [result] = await pool.query(
      "INSERT INTO products (name, description, price, category, stock, artisan_id, image, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'approved')",
      [name, description, price, category, stock || 0, artisan_id, primaryImage]
    );

    for (let i = 0; i < files.length; i++) {
      const imgPath = files[i].path; // Cloudinary URL
      await pool.query(
        "INSERT INTO product_images (product_id, image, is_primary) VALUES (?, ?, ?)",
        [result.insertId, imgPath, i === 0 ? 1 : 0]
      );
    }

    res.status(201).json({ message: "Product created!", productId: result.insertId });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;
    const [products] = await pool.query("SELECT * FROM products WHERE id = ? AND artisan_id = ?", [req.params.id, req.user.id]);
    if (products.length === 0) return res.status(404).json({ message: "Product not found or not yours." });

    const files = req.files || [];
    let primaryImage = products[0].image;

    if (files.length > 0) {
      primaryImage = files[0].path; // Cloudinary URL
      await pool.query("DELETE FROM product_images WHERE product_id = ?", [req.params.id]);
      for (let i = 0; i < files.length; i++) {
        const imgPath = files[i].path;
        await pool.query(
          "INSERT INTO product_images (product_id, image, is_primary) VALUES (?, ?, ?)",
          [req.params.id, imgPath, i === 0 ? 1 : 0]
        );
      }
    }

    await pool.query(
      "UPDATE products SET name = ?, description = ?, price = ?, category = ?, stock = ?, image = ?, status = ? WHERE id = ?",
      [name, description, price, category, stock, primaryImage, req.body.status || products[0].status, req.params.id]
    );
    res.json({ message: "Product updated!" });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const [products] = await pool.query("SELECT * FROM products WHERE id = ? AND artisan_id = ?", [req.params.id, req.user.id]);
    if (products.length === 0) return res.status(404).json({ message: "Product not found or not yours." });
    await pool.query("DELETE FROM product_images WHERE product_id = ?", [req.params.id]);
    await pool.query("DELETE FROM products WHERE id = ?", [req.params.id]);
    res.json({ message: "Product deleted!" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };