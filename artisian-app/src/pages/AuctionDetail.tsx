// frontend/src/pages/AuctionDetail.tsx
import { useState, useEffect } from "react";

const C = {
  orange: "#D85A30", orangeLight: "#FAECE7", orangeBorder: "#F5C4B3",
  cream: "#FAF8F5", stone50: "#F1EFE8", stone800: "#2C2C2A",
  white: "#ffffff", gray100: "#F5F5F4", gray200: "#E7E5E4",
  gray300: "#D6D3D1", gray400: "#A8A29E", gray500: "#78716C",
  gray600: "#57534E", gray700: "#44403C",
  red50: "#FEF2F2", red500: "#EF4444",
  green50: "#F0FDF4", green800: "#166534",
};

const wrap: React.CSSProperties = { maxWidth: 1100, margin: "0 auto", padding: "0 40px" };
const card: React.CSSProperties = { background: C.white, borderRadius: 12, border: `1px solid ${C.gray200}`, padding: 16 };
const outlineBtn: React.CSSProperties = { border: `2px solid ${C.orange}`, color: C.orange, fontWeight: 700, background: C.white, borderRadius: 8, padding: "6px 14px", fontSize: 13, cursor: "pointer" };
const badge: React.CSSProperties = { fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20 };

const API = "https://artisan-backend-gbby.onrender.com/api";
const BASE = "https://artisan-backend-gbby.onrender.com";

interface Bid { id: number; bidder_name: string; amount: number; created_at: string; }
interface AuctionData { id: number; product_name: string; product_description: string; category: string; image: string | null; artisan_name: string; start_bid: number; current_bid: number; status: string; start_time: string; end_time: string; bids: Bid[]; }

const AuctionDetail: React.FC = () => {
  const [auction, setAuction] = useState<AuctionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState("");
  const [bidError, setBidError] = useState("");
  const [bidSuccess, setBidSuccess] = useState("");
  const [bidLoading, setBidLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  const token = localStorage.getItem("token") || "";
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const auctionId = new URLSearchParams(window.location.search).get("id");

  const fetchAuction = async () => {
    if (!auctionId) return;
    try {
      const res = await fetch(`${API}/auctions/${auctionId}`);
      if (res.ok) {
        const data = await res.json();
        setAuction(data);
        setBidAmount(String((Number(data.current_bid) + 1).toFixed(2)));
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchAuction(); }, []);

  // Countdown timer
  useEffect(() => {
    if (!auction || auction.status === "closed") return;
    const timer = setInterval(() => {
      const end = new Date(auction.end_time).getTime();
      const diff = end - Date.now();
      if (diff <= 0) { setTimeLeft("Ended"); clearInterval(timer); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(timer);
  }, [auction]);

  const handleBid = async () => {
    if (!token) { setBidError("Please login to bid"); return; }
    if (!bidAmount || Number(bidAmount) <= 0) { setBidError("Enter a valid amount"); return; }
    setBidLoading(true); setBidError(""); setBidSuccess("");
    try {
      const res = await fetch(`${API}/auctions/${auctionId}/bid`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ amount: Number(bidAmount) }),
      });
      const data = await res.json();
      if (res.ok) {
        setBidSuccess("Bid placed successfully!");
        fetchAuction();
        setTimeout(() => setBidSuccess(""), 3000);
      } else {
        setBidError(data.message);
      }
    } catch (err) { setBidError("Cannot connect to server"); }
    setBidLoading(false);
  };

  const getStatusStyle = (status: string): React.CSSProperties => {
    switch (status) {
      case "live": return { background: "#DCFCE7", color: "#14532D" };
      case "upcoming": return { background: "#FEF3C7", color: "#92400E" };
      case "closed": return { background: "#FEE2E2", color: "#7F1D1D" };
      default: return { background: C.stone50, color: C.gray500 };
    }
  };

  if (loading) return <div style={{ background: C.cream, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ fontSize: 18, fontWeight: 700, color: C.orange }}>Loading auction...</div></div>;
  if (!auction) return <div style={{ background: C.cream, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ fontSize: 18, fontWeight: 700, color: C.gray700 }}>Auction not found. Go to Auctions page and click on one.</div></div>;

  return (
    <div style={{ background: C.cream, minHeight: "100vh" }}>
      {bidSuccess && <div style={{ position: "fixed", top: 16, right: 16, background: C.green50, border: `1px solid ${C.green800}`, color: C.green800, padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, zIndex: 9999 }}>✓ {bidSuccess}</div>}

      <nav style={{ background: C.white, borderBottom: `0.5px solid ${C.gray200}` }}>
        <div style={{ ...wrap, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 40px" }}>
          <span style={{ color: C.orange, fontWeight: 700, fontSize: 20 }}>Artisan Co-op</span>
          <a href="/auctions" style={{ ...outlineBtn, textDecoration: "none" }}>← Back to auctions</a>
        </div>
      </nav>

      <div style={{ ...wrap, padding: "32px 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
          {/* Left: Image */}
          <div>
            {auction.image ? (
              <img src={`${BASE}${auction.image}`} style={{ width: "100%", height: 400, objectFit: "contain", borderRadius: 12, background: "#F1EFE8" }} />
            ) : (
              <div style={{ height: 400, background: C.orangeLight, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#712B13" }}>{auction.category} auction</div>
            )}
          </div>

          {/* Right: Details */}
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <span style={{ ...badge, ...getStatusStyle(auction.status) }}>{auction.status.toUpperCase()}</span>
              <span style={{ ...badge, background: C.orangeLight, color: "#712B13" }}>{auction.category}</span>
            </div>

            <h1 style={{ fontSize: 28, fontWeight: 700, color: C.gray700, margin: "0 0 8px" }}>{auction.product_name}</h1>
            <p style={{ fontSize: 14, color: C.gray400, margin: "0 0 16px" }}>by <span style={{ color: C.orange, fontWeight: 600 }}>{auction.artisan_name}</span></p>
            <p style={{ fontSize: 14, color: C.gray500, lineHeight: 1.7, margin: "0 0 24px" }}>{auction.product_description}</p>

            {/* Bid Info */}
            <div style={{ ...card, padding: 20, marginBottom: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, textAlign: "center" }}>
                <div>
                  <div style={{ fontSize: 12, color: C.gray400 }}>Current Bid</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: C.orange }}>BHD {Number(auction.current_bid).toFixed(2)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: C.gray400 }}>Total Bids</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: C.gray700 }}>{auction.bids.length}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: C.gray400 }}>Time Left</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: auction.status === "live" ? C.green800 : C.gray500 }}>{timeLeft || (auction.status === "closed" ? "Ended" : "Not started")}</div>
                </div>
              </div>
            </div>

            {/* Place Bid */}
            {auction.status === "live" && (
              <div style={{ ...card, padding: 20, marginBottom: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.gray700, marginBottom: 12 }}>Place Your Bid</div>
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ flex: 1, position: "relative" }}>
                    <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: C.gray400 }}>BHD</span>
                    <input type="number" value={bidAmount} onChange={(e) => { setBidAmount(e.target.value.replace(/[eE]/g, "")); setBidError(""); }} onKeyDown={(e) => { if (e.key === "e" || e.key === "E" || e.key === "+" || e.key === "-") e.preventDefault(); }} style={{ width: "100%", border: `1px solid ${bidError ? C.red500 : C.gray300}`, borderRadius: 8, padding: "12px 12px 12px 44px", fontSize: 16, fontWeight: 700, color: C.stone800, background: C.white, boxSizing: "border-box", outline: "none" }} />
                  </div>
                  <button onClick={handleBid} disabled={bidLoading} style={{ ...outlineBtn, background: C.orange, color: C.white, border: `2px solid ${C.orange}`, padding: "12px 24px", fontSize: 15, opacity: bidLoading ? 0.6 : 1 }}>
                    {bidLoading ? "Bidding..." : "Place Bid"}
                  </button>
                </div>
                {bidError && <div style={{ fontSize: 12, color: C.red500, marginTop: 8 }}>✕ {bidError}</div>}
                <div style={{ fontSize: 12, color: C.gray400, marginTop: 8 }}>Minimum bid: BHD {(Number(auction.current_bid) + 0.5).toFixed(2)}</div>
              </div>
            )}

            {auction.status === "upcoming" && (
              <div style={{ ...card, padding: 20, textAlign: "center" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.gray700, marginBottom: 8 }}>Auction starts at</div>
                <div style={{ fontSize: 16, color: C.orange, fontWeight: 600 }}>{new Date(auction.start_time).toLocaleString()}</div>
              </div>
            )}

            {auction.status === "closed" && auction.bids.length > 0 && (
              <div style={{ ...card, padding: 20, background: C.green50, border: `1px solid ${C.green800}` }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.green800, marginBottom: 8 }}>Auction Winner</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: C.gray700 }}>{auction.bids[0].bidder_name}</div>
                <div style={{ fontSize: 16, color: C.orange, fontWeight: 700 }}>BHD {Number(auction.bids[0].amount).toFixed(2)}</div>
              </div>
            )}
          </div>
        </div>

        {/* Bid History */}
        <div style={{ ...card, marginTop: 32, padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.gray200}`, fontSize: 17, fontWeight: 700, color: C.gray700 }}>Bid History ({auction.bids.length})</div>
          {auction.bids.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: C.gray400 }}>No bids yet. Be the first to bid!</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead><tr style={{ background: C.stone50 }}>{["Rank", "Bidder", "Amount", "Time"].map((h) => (<th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: 12, fontWeight: 600, color: C.gray500, textTransform: "uppercase" as const }}>{h}</th>))}</tr></thead>
              <tbody>
                {auction.bids.map((bid, i) => (
                  <tr key={bid.id} style={{ borderBottom: `0.5px solid ${C.gray100}`, background: i === 0 ? C.green50 : "transparent" }}>
                    <td style={{ padding: "12px 20px", fontWeight: 700, color: i === 0 ? C.green800 : C.gray500 }}>{i === 0 ? "🏆 #1" : `#${i + 1}`}</td>
                    <td style={{ padding: "12px 20px", fontWeight: 600, color: C.gray700 }}>{bid.bidder_name}{bid.bidder_name === user.name ? " (you)" : ""}</td>
                    <td style={{ padding: "12px 20px", fontWeight: 700, color: C.orange }}>BHD {Number(bid.amount).toFixed(2)}</td>
                    <td style={{ padding: "12px 20px", color: C.gray400, fontSize: 13 }}>{new Date(bid.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuctionDetail;