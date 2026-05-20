// backend/routes/auctions.js
const express = require("express");
const router = express.Router();
const { getAuctions, getAuction, createAuction, placeBid, getMyAuctions, deleteAuction } = require("../controllers/auctionController");
const { verifyToken, isArtisan } = require("../middleware/auth");

router.get("/", getAuctions);
router.get("/my", verifyToken, isArtisan, getMyAuctions);
router.get("/:id", getAuction);
router.post("/", verifyToken, isArtisan, createAuction);
router.post("/:id/bid", verifyToken, placeBid);
router.delete("/:id", verifyToken, deleteAuction);

module.exports = router;