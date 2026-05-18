// frontend/src/pages/Home.tsx
import { useState, useEffect } from "react";

const C = {
  orange: "#D85A30", orangeLight: "#FAECE7", orangeBorder: "#F5C4B3",
  cream: "#FAF8F5", stone50: "#F1EFE8", stone800: "#2C2C2A",
  white: "#ffffff", gray100: "#F5F5F4", gray200: "#E7E5E4",
  gray300: "#D6D3D1", gray400: "#A8A29E", gray500: "#78716C",
  gray600: "#57534E", gray700: "#44403C",
  green50: "#F0FDF4", green800: "#166534",
};

const wrap: React.CSSProperties = { maxWidth: 1100, margin: "0 auto", padding: "0 40px" };
const outlineBtn: React.CSSProperties = { border: `2px solid ${C.orange}`, color: C.orange, fontWeight: 700, background: C.white, borderRadius: 8, padding: "10px 24px", fontSize: 14, cursor: "pointer", textDecoration: "none" };

const API = "https://artisan-backend-gbby.onrender.com/api";
const BASE = "https://artisan-backend-gbby.onrender.com";

interface Product { id: number; name: string; price: number; category: string; artisan_name: string; image: string | null; }
interface Auction { id: number; product_name: string; current_bid: number; status: string; image: string | null; artisan_name: string; end_time: string; bid_count: number; }

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [auctions, setAuctions] = useState<Auction[]>([]);
const [artisanCount, setArtisanCount] = useState(0);
  const [search, setSearch] = useState("");
  const [cartMsg, setCartMsg] = useState("");
  const [wishlistMsg, setWishlistMsg] = useState("");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`${API}/products`).then(r => r.json()).then(setProducts).catch(console.error);
    fetch(`${API}/auctions`).then(r => r.json()).then(setAuctions).catch(console.error);
fetch(`${API}/users/artisan-count`).then(r => r.json()).then(d => setArtisanCount(d.count)).catch(console.error);
  }, []);

  const categories = [
    { name: "Pottery", icon: "🏺" },
    { name: "Textiles", icon: "🧶" },
    { name: "Jewelry", icon: "💍" },
    { name: "Painting", icon: "🎨" },
    { name: "Woodwork", icon: "🪵" },
  ];

  const liveAuctions = auctions.filter(a => a.status === "live" || a.status === "upcoming");
  const featuredProducts = products.slice(0, 6);

  const handleSearch = () => {
    window.location.href = `/catalog?search=${encodeURIComponent(search)}`;
  };

  const addToWishlist = async (productId: number) => {
    if (!token) { setWishlistMsg("Please login first"); setTimeout(() => setWishlistMsg(""), 2000); return; }
    try {
      const res = await fetch(`${API}/wishlist`, { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }, body: JSON.stringify({ product_id: productId }) });
      const data = await res.json();
      setWishlistMsg(data.message);
      setTimeout(() => setWishlistMsg(""), 2000);
    } catch (err) { setWishlistMsg("Cannot connect"); setTimeout(() => setWishlistMsg(""), 2000); }
  };

  return (
    <div style={{ background: C.cream, minHeight: "100vh" }}>
      {cartMsg && <div style={{ position: "fixed", top: 16, right: 16, background: C.green50, border: `1px solid ${C.green800}`, color: C.green800, padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, zIndex: 9999 }}>✓ {cartMsg}</div>}
      {wishlistMsg && <div style={{ position: "fixed", top: 16, right: 16, background: C.orangeLight, border: `1px solid ${C.orange}`, color: "#712B13", padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, zIndex: 9999 }}>♡ {wishlistMsg}</div>}

      {/* Navbar */}
      <nav style={{ background: C.white, borderBottom: `0.5px solid ${C.gray200}` }}>
        <div style={{ ...wrap, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 40px" }}>
          <span style={{ color: C.orange, fontWeight: 700, fontSize: 22 }}>Artisan Co-op</span>
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <a href="/" style={{ fontSize: 14, color: C.orange, fontWeight: 700, textDecoration: "none" }}>Home</a>
            <a href="/catalog" style={{ fontSize: 14, color: C.gray500, textDecoration: "none" }}>Products</a>
            <a href="/auctions" style={{ fontSize: 14, color: C.gray500, textDecoration: "none" }}>Auctions</a>
            <a href="/wishlist" style={{ fontSize: 14, color: C.gray500, textDecoration: "none" }}> Wishlist</a>
            <a href="/notifications" style={{ fontSize: 14, color: C.gray500, textDecoration: "none" }}> Notifications</a>
            <a href="/chat" style={{ fontSize: 14, color: C.gray500, textDecoration: "none" }}> Chat</a>
            <a href="/checkout" style={{ fontSize: 14, color: C.gray500, textDecoration: "none" }}> Cart</a>
          </div>
          {token ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <a href="/profile" style={{ fontSize: 13, color: C.gray500, textDecoration: "none" }}>{user.name}</a>
              <a href={user.role === "artisan" ? "/artisan" : user.role === "admin" ? "/admin" : "/profile"} style={{ ...outlineBtn, padding: "6px 16px", fontSize: 12 }}>Dashboard</a>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
  <a href="/login" style={{ ...outlineBtn, padding: "6px 16px", fontSize: 12 }}>Sign in</a>
  <a href="/login" style={{ background: C.orange, color: C.white, border: `2px solid ${C.orange}`, borderRadius: 8, padding: "6px 16px", fontSize: 12, fontWeight: 700, textDecoration: "none", cursor: "pointer" }}>Register</a>
</div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${C.orange} 0%, #B94A26 100%)`, padding: "60px 0" }}>
        <div style={{ ...wrap, padding: "0 40px", textAlign: "center" }}>
          <h1 style={{ fontSize: 42, fontWeight: 700, color: C.white, margin: "0 0 16px", lineHeight: 1.2 }}>Discover Handmade Treasures<br />from Bahrain's Finest Artisans</h1>
          <p style={{ fontSize: 17, color: "#FFEDD5", margin: "0 0 32px", maxWidth: 600, marginLeft: "auto", marginRight: "auto" }}>Shop unique handcrafted products, bid on exclusive auctions, and support local craftspeople</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", maxWidth: 500, margin: "0 auto" }}>
            <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} placeholder="Search products, artisans..." style={{ flex: 1, border: "none", borderRadius: 8, padding: "14px 18px", fontSize: 14, outline: "none" }} />
            <button onClick={handleSearch} style={{ background: C.white, color: C.orange, border: "none", borderRadius: 8, padding: "14px 24px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Search</button>
          </div>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 24 }}>
            <a href="/auctions" style={{ background: "rgba(255,255,255,0.2)", color: C.white, border: "1px solid rgba(255,255,255,0.4)", borderRadius: 8, padding: "10px 24px", fontWeight: 700, fontSize: 14, cursor: "pointer", textDecoration: "none" }}>Browse Auctions</a>
            <a href="/login" style={{ background: C.white, color: C.orange, border: "none", borderRadius: 8, padding: "10px 24px", fontWeight: 700, fontSize: 14, cursor: "pointer", textDecoration: "none" }}>Start Selling</a>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ background: C.white, borderBottom: `0.5px solid ${C.gray200}` }}>
        <div style={{ ...wrap, display: "flex", justifyContent: "space-around", padding: "20px 40px" }}>
          {[{ val: String(products.length), lbl: "Products" }, { val: String(auctions.length), lbl: "Auctions" }, { val: String(artisanCount), lbl: "Artisans" }, { val: "100%", lbl: "Handmade" }].map((s) => (
            <div key={s.lbl} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: C.orange }}>{s.val}</div>
              <div style={{ fontSize: 13, color: C.gray500 }}>{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div style={{ ...wrap, padding: "40px 40px 0" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: C.gray700, margin: "0 0 20px" }}>Shop by Category</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14 }}>
          {categories.map((cat) => (
            <a key={cat.name} href="/catalog" style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.gray200}`, padding: "20px 16px", textAlign: "center", cursor: "pointer", textDecoration: "none" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{cat.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.gray700 }}>{cat.name}</div>
              <div style={{ fontSize: 12, color: C.gray400, marginTop: 4 }}>{products.filter(p => p.category === cat.name).length} items</div>
            </a>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div style={{ ...wrap, padding: "40px 40px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: C.gray700, margin: 0 }}>Featured Products</h2>
          <a href="/catalog" style={{ fontSize: 13, color: C.orange, fontWeight: 700, textDecoration: "none" }}>View all →</a>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {featuredProducts.map((p) => (
            <div key={p.id} style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.gray200}`, overflow: "hidden", position: "relative" }}>
              {/* Wishlist heart */}
              <button onClick={() => addToWishlist(p.id)} style={{ position: "absolute", top: 10, right: 10, width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: "none", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>♡</button>
              <a href="/catalog" style={{ textDecoration: "none" }}>
                {p.image ? <img src={`${BASE}${p.image}`} style={{ width: "100%", height: 180, objectFit: "cover" }} /> : <div style={{ height: 180, background: C.orangeLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#712B13" }}>{p.category}</div>}
              </a>
              <div style={{ padding: 16 }}>
                <a href="/catalog" style={{ textDecoration: "none" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.gray700, marginBottom: 4 }}>{p.name}</div>
                </a>
                <div style={{ fontSize: 13, color: C.gray400, marginBottom: 8 }}>by {p.artisan_name}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: C.orange }}>BHD {Number(p.price).toFixed(2)}</span>
                  <a href="/catalog" style={{ fontSize: 11, color: C.orange, fontWeight: 700, border: `1px solid ${C.orange}`, borderRadius: 6, padding: "4px 12px", textDecoration: "none", cursor: "pointer" }}>View details</a>
                  <a href="/chat" style={{ fontSize: 11, color: C.orange, fontWeight: 700, border: `1px solid ${C.orange}`, borderRadius: 6, padding: "4px 12px", textDecoration: "none", cursor: "pointer", marginLeft: 4 }}>💬</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Auctions */}
      {liveAuctions.length > 0 && (
        <div style={{ ...wrap, padding: "40px 40px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: C.gray700, margin: 0 }}>Live & Upcoming Auctions</h2>
            <a href="/auctions" style={{ fontSize: 13, color: C.orange, fontWeight: 700, textDecoration: "none" }}>View all →</a>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {liveAuctions.slice(0, 3).map((a) => (
              <a key={a.id} href={`/auction-detail?id=${a.id}`} style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.gray200}`, overflow: "hidden", textDecoration: "none" }}>
                {a.image ? <img src={`${BASE}${a.image}`} style={{ width: "100%", height: 160, objectFit: "cover" }} /> : <div style={{ height: 160, background: C.orangeLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#712B13" }}>Auction</div>}
                <div style={{ padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: a.status === "live" ? "#DCFCE7" : "#FEF3C7", color: a.status === "live" ? "#14532D" : "#92400E" }}>{a.status}</span>
                    <span style={{ fontSize: 12, color: C.gray400 }}>{a.bid_count} bids</span>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.gray700, marginBottom: 4 }}>{a.product_name}</div>
                  <div style={{ fontSize: 13, color: C.gray400, marginBottom: 8 }}>by {a.artisan_name}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.orange }}>BHD {Number(a.current_bid).toFixed(2)}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* How It Works */}
      <div style={{ ...wrap, padding: "48px 40px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: C.gray700, margin: "0 0 24px", textAlign: "center" }}>How It Works</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
          {[
            { icon: "🔍", title: "Browse", desc: "Explore unique handmade products from local artisans" },
            { icon: "🛒", title: "Shop", desc: "Add items to cart and checkout securely" },
            { icon: "🔨", title: "Bid", desc: "Join live auctions and bid on exclusive items" },
            { icon: "📦", title: "Receive", desc: "Get your handcrafted items delivered to your door" },
          ].map((step, i) => (
            <div key={step.title} style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.gray200}`, padding: 24, textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{step.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.orange, marginBottom: 6 }}>STEP {i + 1}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.gray700, marginBottom: 8 }}>{step.title}</div>
              <div style={{ fontSize: 13, color: C.gray500, lineHeight: 1.5 }}>{step.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: C.stone800, padding: "40px 0" }}>
        <div style={{ ...wrap, padding: "0 40px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 32 }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: C.white, marginBottom: 12 }}>Artisan Co-op</div>
              <div style={{ fontSize: 13, color: C.gray400, lineHeight: 1.7 }}>Supporting local artisans in Bahrain by providing a platform to showcase and sell their handmade creations.</div>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.white, marginBottom: 12 }}>Shop</div>
              {[["All Products", "/catalog"], ["Auctions", "/auctions"], ["Wishlist", "/wishlist"]].map(([l, h]) => <a key={l} href={h} style={{ display: "block", fontSize: 13, color: C.gray400, marginBottom: 8, textDecoration: "none" }}>{l}</a>)}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.white, marginBottom: 12 }}>Sell</div>
              {[["Become an Artisan", "/login"], ["Artisan Dashboard", "/artisan"]].map(([l, h]) => <a key={l} href={h} style={{ display: "block", fontSize: 13, color: C.gray400, marginBottom: 8, textDecoration: "none" }}>{l}</a>)}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.white, marginBottom: 12 }}>Contact</div>
              {["Manama, Bahrain", "info@artisancoop.bh", "+973 1234 5678"].map((l) => <div key={l} style={{ fontSize: 13, color: C.gray400, marginBottom: 8 }}>{l}</div>)}
            </div>
          </div>
          <div style={{ borderTop: `1px solid ${C.gray700}`, marginTop: 32, paddingTop: 20, textAlign: "center", fontSize: 12, color: C.gray500 }}>© 2026 Artisan Cooperative. All rights reserved.</div>
        </div>
      </div>
    </div>
  );
};

export default Home;