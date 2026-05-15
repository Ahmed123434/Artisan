// backend/controllers/orderController.js
const pool = require("../config/db");
const { createNotification } = require("./notificationController");

const getMyOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.id, o.total, o.status, o.shipping_address, o.city, o.country, o.phone, o.payment_method, o.created_at
       FROM orders o WHERE o.customer_id = ? ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(orders);
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

const getArtisanOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.id, o.status, o.total, o.created_at, o.shipping_address, o.city, o.country, o.phone, o.payment_method,
        u.name as customer_name, u.email as customer_email, u.phone as customer_phone,
        p.name as product_name, oi.quantity, oi.price
       FROM orders o JOIN order_items oi ON o.id = oi.order_id JOIN products p ON oi.product_id = p.id
       JOIN users u ON o.customer_id = u.id WHERE p.artisan_id = ? ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(orders);
  } catch (error) {
    console.error("Get artisan orders error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

const createOrder = async (req, res) => {
  try {
    const { items, shipping_address, city, country, phone, payment_method } = req.body;
    const customer_id = req.user.id;

    // First, validate stock for all items
    for (const item of items) {
      const [products] = await pool.query("SELECT price, stock FROM products WHERE id = ?", [item.product_id]);
      if (products.length === 0) {
        return res.status(400).json({ message: `Product ${item.product_id} not found.` });
      }
      if (products[0].stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for product ID ${item.product_id}. Available: ${products[0].stock}, Requested: ${item.quantity}` 
        });
      }
    }

    let total = 0;
    for (const item of items) {
      const [products] = await pool.query("SELECT price FROM products WHERE id = ?", [item.product_id]);
      total += products[0].price * item.quantity;
    }

    const shipping = total > 50 ? 0 : 2;
    const tax = total * 0.1;
    const finalTotal = total + shipping + tax;

    const [orderResult] = await pool.query(
      "INSERT INTO orders (customer_id, total, shipping_address, city, country, phone, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [customer_id, finalTotal, shipping_address, city, country, phone, payment_method]
    );

    for (const item of items) {
      const [products] = await pool.query("SELECT price, artisan_id, name, stock FROM products WHERE id = ?", [item.product_id]);
      await pool.query("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
        [orderResult.insertId, item.product_id, item.quantity, products[0].price]);
      
      // Decrease stock
      const [updateResult] = await pool.query("UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?", 
        [item.quantity, item.product_id, item.quantity]);
      
      // Check if stock was actually updated
      if (updateResult.affectedRows === 0) {
        throw new Error(`Failed to update stock for product ${item.product_id}`);
      }

      // Notify artisan about new order
      await createNotification(products[0].artisan_id, "New Order!", `Someone ordered your product "${products[0].name}" (x${item.quantity})`, "order");
    }

    // Notify customera
    await createNotification(customer_id, "Order Confirmed", `Your order #${orderResult.insertId} has been placed. Total: BHD ${finalTotal.toFixed(2)}`, "order");

    res.status(201).json({ message: "Order placed!", orderId: orderResult.insertId, total: finalTotal });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const [orders] = await pool.query("SELECT customer_id FROM orders WHERE id = ?", [req.params.id]);
    await pool.query("UPDATE orders SET status = ? WHERE id = ?", [status, req.params.id]);

    // Notify customer about status change
    if (orders.length > 0) {
      await createNotification(orders[0].customer_id, "Order Updated", `Your order #${req.params.id} status changed to "${status}"`, "order");
    }

    res.json({ message: `Order status updated to ${status}` });
  } catch (error) {
    console.error("Update order error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(
      "SELECT o.*, u.name as customer_name FROM orders o JOIN users u ON o.customer_id = u.id ORDER BY o.created_at DESC"
    );
    res.json(orders);
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = { getMyOrders, getArtisanOrders, createOrder, updateOrderStatus, getAllOrders };