// frontend/src/pages/Wishlist.tsx
import { useState, useEffect } from "react";

const C = {
  orange: "#D85A30", orangeLight: "#FAECE7",
  cream: "#FAF8F5", stone50: "#F1EFE8", stone800: "#2C2C2A",
  white: "#ffffff", gray100: "#F5F5F4", gray200: "#E7E5E4",
  gray300: "#D6D3D1", gray400: "#A8A29E", gray500: "#78716C",
  gray700: "#44403C", red500: "#EF4444",
  green50: "#F0FDF4", green800: "#166534",
};

const wrap: React.CSSProperties = { maxWidth: 1100, margin: "0 auto", padding: "0 40px" };
const card: React.CSSProperties = { background: C.white, borderRadius: 12, border: `1px solid ${C.gray200}` };
const outlineBtn: React.CSSProperties = { border: `2px solid ${C.orange}`, color: C.orange, fontWeight: 700, background: C.white, borderRadius: 8, padding: "6px 14px", fontSize: 13, cursor: "pointer" };

const API = "https://artisan-backend-gbby.onrender.com/api";
const BASE = "https://artisan-backend-gbby.onrender.com";

interface WishlistItem { id: number; product_id: number; name: string; price: number; category: string; image: string | null; artisan_name: string; stock: number; created_at: string; }

const Wishlist: React.FC = () => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");

  const token = localStorage.getItem("token") || "";

  const fetchWishlist = async () => {
    try {
      const res = await fetch(`${API}/wishlist`, { headers: { "Authorization": `Bearer ${token}` } });
      if (res.ok) setItems(await res.json());
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchWishlist(); }, []);

  const removeItem = async (productId: number) => {
    try {
      const res = await fetch(`${API}/wishlist/${productId}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
      if (res.ok) { setSuccessMsg("Removed from wishlist"); fetchWishlist(); setTimeout(() => setSuccessMsg(""), 2000); }
    } catch (err) { console.error(err); }
  };

  if (!token) {
    return (
      <div style={{ background: C.cream, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ ...card, padding: 40, textAlign: "center", maxWidth: 400 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.gray700, marginBottom: 8 }}>Please Login</div>
          <div style={{ fontSize: 14, color: C.gray400, marginBottom: 20 }}>Login to see your wishlist.</div>
          <a href="/login" style={{ ...outlineBtn, textDecoration: "none", padding: "10px 24px" }}>Go to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: C.cream, minHeight: "100vh" }}>
      {successMsg && <div style={{ position: "fixed", top: 16, right: 16, background: C.green50, border: `1px solid ${C.green800}`, color: C.green800, padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, zIndex: 9999 }}>✓ {successMsg}</div>}

      <nav style={{ background: C.white, borderBottom: `0.5px solid ${C.gray200}` }}>
        <div style={{ ...wrap, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 40px" }}>
          <a href="/" style={{ color: C.orange, fontWeight: 700, fontSize: 20, textDecoration: "none" }}>Artisan Co-op</a>
          <span style={{ fontSize: 14, color: C.gray500 }}>My Wishlist</span>
        </div>
      </nav>

      <div style={{ ...wrap, padding: "32px 40px" }}>
        <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20, padding: "8px 18px", background: C.white, border: `1.5px solid ${C.orange}`, borderRadius: 20, color: C.orange, fontWeight: 600, fontSize: 13, textDecoration: "none" }}>{"<"} Back to Home</a>

<h2 style={{ fontSize: 24, fontWeight: 700, color: C.gray700, margin: "0 0 8px" }}>My Wishlist ({items.length})</h2>
        <p style={{ fontSize: 14, color: C.gray400, margin: "0 0 24px" }}>Products you've saved for later</p>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: C.orange, fontWeight: 700 }}>Loading wishlist...</div>
        ) : items.length === 0 ? (
          <div style={{ ...card, padding: 60, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>♡</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.gray700, marginBottom: 8 }}>Your wishlist is empty</div>
            <div style={{ fontSize: 14, color: C.gray400, marginBottom: 20 }}>Browse products and click the heart to save them here</div>
            <a href="/catalog" style={{ ...outlineBtn, textDecoration: "none", padding: "10px 24px" }}>Browse Products</a>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {items.map((item) => (
              <div key={item.id} style={{ ...card, overflow: "hidden" }}>
                {item.image ? <img src={`${BASE}${item.image}`} style={{ width: "100%", height: 180, objectFit: "cover" }} /> : <div style={{ height: 180, background: C.orangeLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#712B13" }}>{item.category}</div>}
                <div style={{ padding: 16 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.gray700, marginBottom: 4 }}>{item.name}</div>
                  <div style={{ fontSize: 13, color: C.gray400, marginBottom: 8 }}>by {item.artisan_name}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: C.orange, marginBottom: 4 }}>BHD {Number(item.price).toFixed(2)}</div>
                  <div style={{ fontSize: 12, color: item.stock > 0 ? C.green800 : C.red500, marginBottom: 12 }}>{item.stock > 0 ? `In Stock (${item.stock})` : "Out of Stock"}</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <a href="/checkout" style={{ ...outlineBtn, flex: 1, textAlign: "center", textDecoration: "none", background: C.orange, color: C.white, border: `2px solid ${C.orange}`, padding: "8px 0" }}>Buy Now</a>
                    <button onClick={() => removeItem(item.product_id)} style={{ ...outlineBtn, padding: "8px 14px", borderColor: C.red500, color: C.red500 }}>♡ Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;