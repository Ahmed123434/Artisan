// frontend/src/pages/Auctions.tsx
import { useState, useEffect } from "react";

const C = {
  orange: "#D85A30", orangeLight: "#FAECE7", orangeBorder: "#F5C4B3",
  cream: "#FAF8F5", stone50: "#F1EFE8", stone800: "#2C2C2A",
  white: "#ffffff", gray100: "#F5F5F4", gray200: "#E7E5E4",
  gray300: "#D6D3D1", gray400: "#A8A29E", gray500: "#78716C",
  gray600: "#57534E", gray700: "#44403C",
  red500: "#EF4444", green50: "#F0FDF4", green800: "#166534",
};

const wrap: React.CSSProperties = { maxWidth: 1100, margin: "0 auto", padding: "0 40px" };
const card: React.CSSProperties = { background: C.white, borderRadius: 12, border: `1px solid ${C.gray200}`, overflow: "hidden" };
const outlineBtn: React.CSSProperties = { border: `2px solid ${C.orange}`, color: C.orange, fontWeight: 700, background: C.white, borderRadius: 8, padding: "6px 14px", fontSize: 13, cursor: "pointer" };
const badge: React.CSSProperties = { fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20 };

const API = "https://artisan-backend-gbby.onrender.com/api";
const BASE = "https://artisan-backend-gbby.onrender.com";

interface Auction { id: number; product_name: string; product_description: string; category: string; image: string | null; artisan_name: string; start_bid: number; current_bid: number; status: string; start_time: string; end_time: string; bid_count: number; }

const Auctions: React.FC = () => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedAuction, setSelectedAuction] = useState<number | null>(null);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const res = await fetch(`${API}/auctions`);
        if (res.ok) setAuctions(await res.json());
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchAuctions();
  }, []);

  const getStatusStyle = (status: string): React.CSSProperties => {
    switch (status) {
      case "live": return { background: "#DCFCE7", color: "#14532D" };
      case "upcoming": return { background: "#FEF3C7", color: "#92400E" };
      case "closed": return { background: "#FEE2E2", color: "#7F1D1D" };
      default: return { background: C.stone50, color: C.gray500 };
    }
  };

  const getTimeLeft = (endTime: string): string => {
    const diff = new Date(endTime).getTime() - Date.now();
    if (diff <= 0) return "Ended";
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h left`;
    return `${hours}h ${mins}m left`;
  };

  const filtered = filter === "all" ? auctions : auctions.filter((a) => a.status === filter);

  if (selectedAuction !== null) {
    window.location.href = `/auction-detail?id=${selectedAuction}`;
    return null;
  }

  return (
    <div style={{ background: C.cream, minHeight: "100vh" }}>
      <nav style={{ background: C.white, borderBottom: `0.5px solid ${C.gray200}` }}>
        <div style={{ ...wrap, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 40px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ color: C.orange, fontWeight: 700, fontSize: 20 }}>Artisan Co-op</span>
            <a href="/" style={{ padding: "6px 16px", border: `1.5px solid ${C.orange}`, borderRadius: 20, color: C.orange, fontWeight: 600, fontSize: 13, textDecoration: "none" }}>Home</a>
          </div>
          <span style={{ fontSize: 14, color: C.gray500 }}>Auctions</span>
        </div>
      </nav>

      <div style={{ ...wrap, padding: "32px 40px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: C.gray700, margin: "0 0 8px" }}>Live Auctions</h2>
            <p style={{ fontSize: 15, color: C.gray400, margin: 0 }}>Bid on unique handmade artisan products</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {["all", "live", "upcoming", "closed"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: "6px 16px", borderRadius: 20, fontSize: 13, cursor: "pointer", border: `1.5px solid ${filter === f ? C.orange : C.gray300}`, background: filter === f ? C.orangeLight : C.white, color: filter === f ? C.orange : C.gray600, fontWeight: filter === f ? 700 : 400, textTransform: "capitalize" as const }}>{f === "all" ? "All Auctions" : f}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60 }}><div style={{ fontSize: 18, fontWeight: 700, color: C.orange }}>Loading auctions...</div></div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔨</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.gray700, marginBottom: 8 }}>No auctions found</div>
            <div style={{ fontSize: 14, color: C.gray400 }}>Check back later or create one from the Artisan Dashboard</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {filtered.map((a) => (
              <div key={a.id} style={card} onClick={() => setSelectedAuction(a.id)}>
                {a.image ? (
                  <img src={a.image?.startsWith('http') ? a.image : `${BASE}${a.image}`} style={{ width: "100%", height: 180, objectFit: "cover" }} />
                ) : (
                  <div style={{ height: 180, background: C.orangeLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#712B13" }}>{a.category} auction</div>
                )}
                <div style={{ padding: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ ...badge, ...getStatusStyle(a.status) }}>{a.status}</span>
                    <span style={{ fontSize: 12, color: C.gray400 }}>{a.bid_count} bids</span>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.gray700, marginBottom: 4 }}>{a.product_name}</div>
                  <div style={{ fontSize: 13, color: C.gray400, marginBottom: 12 }}>by {a.artisan_name}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 11, color: C.gray400 }}>Current bid</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: C.orange }}>BHD {Number(a.current_bid).toFixed(2)}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 11, color: C.gray400 }}>Time left</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: a.status === "live" ? C.green800 : C.gray500 }}>{a.status === "closed" ? "Ended" : getTimeLeft(a.end_time)}</div>
                    </div>
                  </div>
                  <button style={{ ...outlineBtn, width: "100%", marginTop: 12, padding: "10px 0", fontSize: 14 }}>
                    {a.status === "live" ? "Place Bid →" : a.status === "upcoming" ? "View Details" : "View Results"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Auctions;