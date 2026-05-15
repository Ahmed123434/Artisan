// backend/routes/auctions.js
const express = require("express");
const router = express.Router();
const { getAuctions, getAuction, createAuction, placeBid, getMyAuctions } = require("../controllers/auctionController");
const { verifyToken, isArtisan } = require("../middleware/auth");

router.get("/", getAuctions);                                    // GET /api/auctions
router.get("/my", verifyToken, isArtisan, getMyAuctions);        // GET /api/auctions/my
router.get("/:id", getAuction);                                  // GET /api/auctions/1
router.post("/", verifyToken, isArtisan, createAuction);         // POST /api/auctions
router.post("/:id/bid", verifyToken, placeBid);                  // POST /api/auctions/1/bid

module.exports = router;