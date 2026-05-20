// backend/controllers/auctionController.js
const pool = require("../config/db");
const { createNotification } = require("./notificationController");

// Get all auctions (public)
const getAuctions = async (req, res) => {
  try {
    const [auctions] = await pool.query(
      `SELECT a.*, p.name as product_name, p.description as product_description, p.category, p.image,
        u.name as artisan_name,
        (SELECT COUNT(*) FROM bids WHERE auction_id = a.id) as bid_count
       FROM auctions a
       JOIN products p ON a.product_id = p.id
       JOIN users u ON a.artisan_id = u.id
       ORDER BY a.created_at DESC`
    );
    // Auto-update status based on time
    const now = new Date();
    for (const auction of auctions) {
      const start = new Date(auction.start_time);
      const end = new Date(auction.end_time);
      let newStatus = auction.status;
      if (now >= start && now < end && auction.status !== 'live') newStatus = 'live';
      else if (now >= end && auction.status !== 'closed') newStatus = 'closed';
      if (newStatus !== auction.status) {
        await pool.query("UPDATE auctions SET status = ? WHERE id = ?", [newStatus, auction.id]);
        auction.status = newStatus;
        // Notify winner when auction closes
        if (newStatus === "closed") {
          const [winningBid] = await pool.query("SELECT user_id, amount FROM bids WHERE auction_id = ? ORDER BY amount DESC LIMIT 1", [auction.id]);
          if (winningBid.length > 0) {
            await createNotification(winningBid[0].user_id, "You Won! 🎉", `Congratulations! You won the auction for "${auction.product_name}" with BHD ${winningBid[0].amount}`, "auction");
            await createNotification(auction.artisan_id, "Auction Ended", `Your auction for "${auction.product_name}" ended. Winner bid: BHD ${winningBid[0].amount}`, "auction");
          }
        }
      }
    }
    res.json(auctions);
  } catch (error) {
    console.error("Get auctions error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Get single auction with bids
const getAuction = async (req, res) => {
  try {
    const [auctions] = await pool.query(
      `SELECT a.*, p.name as product_name, p.description as product_description, p.category, p.image,
        u.name as artisan_name
       FROM auctions a
       JOIN products p ON a.product_id = p.id
       JOIN users u ON a.artisan_id = u.id
       WHERE a.id = ?`,
      [req.params.id]
    );
    if (auctions.length === 0) return res.status(404).json({ message: "Auction not found." });

    const [bids] = await pool.query(
      `SELECT b.*, u.name as bidder_name FROM bids b JOIN users u ON b.user_id = u.id WHERE b.auction_id = ? ORDER BY b.amount DESC`,
      [req.params.id]
    );

    res.json({ ...auctions[0], bids });
  } catch (error) {
    console.error("Get auction error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Create auction (artisan only)
const createAuction = async (req, res) => {
  try {
    const { product_id, start_bid, start_time, end_time } = req.body;
    const artisan_id = req.user.id;

    // Convert Bahrain time (UTC+3) to UTC for storage
    const toUTC = (localTime) => {
      const date = new Date(localTime);
      date.setHours(date.getHours() - 3);
      return date.toISOString().slice(0, 19).replace('T', ' ');
    };

    const utcStartTime = toUTC(start_time);
    const utcEndTime = toUTC(end_time);

    // Check product belongs to artisan
    const [products] = await pool.query("SELECT * FROM products WHERE id = ? AND artisan_id = ?", [product_id, artisan_id]);
    if (products.length === 0) return res.status(400).json({ message: "Product not found or not yours." });

    // Check product not already in active auction
    const [existing] = await pool.query("SELECT * FROM auctions WHERE product_id = ? AND status != 'closed'", [product_id]);
    if (existing.length > 0) return res.status(400).json({ message: "Product already has an active auction." });

    const [result] = await pool.query(
      "INSERT INTO auctions (product_id, artisan_id, start_bid, current_bid, status, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [product_id, artisan_id, start_bid, start_bid, 'upcoming', utcStartTime, utcEndTime]
    );

    res.status(201).json({ message: "Auction created!", auctionId: result.insertId });
  } catch (error) {
    console.error("Create auction error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Place bid
const placeBid = async (req, res) => {
  try {
    const { amount } = req.body;
    const user_id = req.user.id;
    const auction_id = req.params.id;

    // Get auction
    const [auctions] = await pool.query("SELECT * FROM auctions WHERE id = ?", [auction_id]);
    if (auctions.length === 0) return res.status(404).json({ message: "Auction not found." });

    const auction = auctions[0];

    // Check auction is live
    if (auction.status !== 'live') return res.status(400).json({ message: "Auction is not live." });

    // Check bid is higher than current
    if (amount <= auction.current_bid) return res.status(400).json({ message: `Bid must be higher than BHD ${auction.current_bid}` });

    // Check not bidding on own auction
    if (user_id === auction.artisan_id) return res.status(400).json({ message: "Cannot bid on your own auction." });

    // Place bid
    await pool.query("INSERT INTO bids (auction_id, user_id, amount) VALUES (?, ?, ?)", [auction_id, user_id, amount]);
    await pool.query("UPDATE auctions SET current_bid = ? WHERE id = ?", [amount, auction_id]);

    // Notify artisan about new bid
    await createNotification(auction.artisan_id, "New Bid!", `Someone bid BHD ${amount} on your auction`, "bid");

    // Notify previous highest bidder they were outbid
    const [prevBids] = await pool.query("SELECT user_id FROM bids WHERE auction_id = ? AND user_id != ? ORDER BY amount DESC LIMIT 1", [auction_id, user_id]);
    if (prevBids.length > 0) {
      await createNotification(prevBids[0].user_id, "Outbid!", `Someone placed a higher bid of BHD ${amount}. Bid again!`, "bid");
    }

    res.json({ message: "Bid placed!", newBid: amount });
  } catch (error) {
    console.error("Place bid error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Get artisan's auctions
const getMyAuctions = async (req, res) => {
  try {
    const [auctions] = await pool.query(
      `SELECT a.*, p.name as product_name, p.image,
        (SELECT COUNT(*) FROM bids WHERE auction_id = a.id) as bid_count
       FROM auctions a JOIN products p ON a.product_id = p.id
       WHERE a.artisan_id = ? ORDER BY a.created_at DESC`,
      [req.user.id]
    );
    res.json(auctions);
  } catch (error) {
    console.error("Get my auctions error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

const deleteAuction = async (req, res) => {
  try {
    await pool.query("DELETE FROM bids WHERE auction_id = ?", [req.params.id]);
    await pool.query("DELETE FROM auctions WHERE id = ?", [req.params.id]);
    res.json({ message: "Auction deleted!" });
  } catch (error) {
    console.error("Delete auction error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = { getAuctions, getAuction, createAuction, placeBid, getMyAuctions, deleteAuction };