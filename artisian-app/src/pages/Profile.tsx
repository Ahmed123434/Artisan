// frontend/src/pages/Profile.tsx
import { useState, useEffect } from "react";

const C = {
  orange: "#D85A30", orangeLight: "#FAECE7",
  cream: "#FAF8F5", stone50: "#F1EFE8", stone800: "#2C2C2A",
  white: "#ffffff", gray100: "#F5F5F4", gray200: "#E7E5E4",
  gray300: "#D6D3D1", gray400: "#A8A29E", gray500: "#78716C",
  gray600: "#57534E", gray700: "#44403C",
  red50: "#FEF2F2", red500: "#EF4444",
  green50: "#F0FDF4", green800: "#166534",
  amber50: "#FFFBEB", amber700: "#B45309",
};

const wrap: React.CSSProperties = { maxWidth: 1100, margin: "0 auto", padding: "0 40px" };
const card: React.CSSProperties = { background: C.white, borderRadius: 12, border: `1px solid ${C.gray200}`, padding: 24 };
const outlineBtn: React.CSSProperties = { border: `2px solid ${C.orange}`, color: C.orange, fontWeight: 700, background: C.white, borderRadius: 8, padding: "6px 14px", fontSize: 13, cursor: "pointer" };
const inputBase: React.CSSProperties = { width: "100%", border: `1px solid ${C.gray300}`, borderRadius: 8, padding: "9px 12px", fontSize: 13, color: C.stone800, background: C.white, boxSizing: "border-box", outline: "none" };
const labelStyle: React.CSSProperties = { display: "block", fontSize: 12, color: C.gray600, fontWeight: 500, marginBottom: 5 };
const badge: React.CSSProperties = { fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20 };

const API = "http://localhost:5000/api";

interface Order { id: number; total: number; status: string; created_at: string; shipping_address?: string; city?: string; country?: string; phone?: string; payment_method?: string; }

const Profile: React.FC = () => {
  const [active, setActive] = useState<string>("Profile");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
const [wishlistCount, setWishlistCount] = useState(0);
const [reviewCount, setReviewCount] = useState(0);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token") || "";

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API}/orders/my`, { headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    if (token) {
      fetchOrders();
      fetch(`${API}/wishlist`, { headers: { "Authorization": `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : []).then(d => setWishlistCount(Array.isArray(d) ? d.length : 0));
      fetch(`${API}/reviews/my`, { headers: { "Authorization": `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : []).then(d => setReviewCount(Array.isArray(d) ? d.length : 0));
    }
    else setLoading(false);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const getStatusStyle = (status: string): React.CSSProperties => {
    switch (status) {
      case "pending": return { background: "#FEF3C7", color: "#92400E" };
      case "shipped": return { background: "#CCFBF1", color: "#134E4A" };
      case "delivered": return { background: "#DCFCE7", color: "#14532D" };
      case "cancelled": return { background: "#FEE2E2", color: "#7F1D1D" };
      default: return { background: C.amber50, color: C.amber700 };
    }
  };

  if (!token) {
    return (
      <div style={{ background: C.cream, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ ...card, textAlign: "center", maxWidth: 400 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.gray700, marginBottom: 8 }}>Please Login</div>
          <div style={{ fontSize: 14, color: C.gray400, marginBottom: 20 }}>You need to be logged in to view your profile.</div>
          <a href="/login" style={{ ...outlineBtn, textDecoration: "none", padding: "10px 24px" }}>Go to Login</a>
        </div>
      </div>
    );
  }

  const sidebarItems = ["Profile", "My Orders", "Settings"];

  const renderContent = () => {
    switch (active) {
      case "Profile":
        return (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24 }}>
            {/* Profile Card */}
            <div style={{ ...card, textAlign: "center" }}>
              <div style={{ width: 100, height: 100, borderRadius: "50%", background: C.orangeLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, fontWeight: 700, color: "#712B13", margin: "0 auto 16px" }}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: C.gray700, marginBottom: 4 }}>{user.name}</div>
              <div style={{ fontSize: 13, color: C.gray400, marginBottom: 8 }}>{user.email}</div>
              <span style={{ ...badge, background: C.orangeLight, color: "#712B13", fontSize: 12, padding: "4px 14px", textTransform: "capitalize" as const }}>{user.role}</span>
              {user.shop_name && <div style={{ fontSize: 13, color: C.gray500, marginTop: 12 }}>Shop: {user.shop_name}</div>}
              <div style={{ marginTop: 20 }}>
                {user.role === "artisan" && <a href="/artisan" style={{ ...outlineBtn, textDecoration: "none", display: "block", padding: "10px 0", marginBottom: 8, textAlign: "center" }}>Artisan Dashboard</a>}
                {user.role === "admin" && <a href="/admin" style={{ ...outlineBtn, textDecoration: "none", display: "block", padding: "10px 0", marginBottom: 8, textAlign: "center" }}>Admin Dashboard</a>}
                <button onClick={handleSignOut} style={{ ...outlineBtn, width: "100%", padding: "10px 0", borderColor: C.red500, color: C.red500 }}>Sign Out</button>
              </div>
            </div>

            {/* Account Details */}
            <div>
              <div style={card}>
                <div style={{ fontSize: 17, fontWeight: 700, color: C.orange, marginBottom: 20 }}>Account Information</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {([
                    ["Full Name", user.name],
                    ["Email", user.email],
                    ["Phone", user.phone || "Not set"],
                    ["Role", user.role],
                    ["Shop Name", user.shop_name || "N/A"],
                    ["Member Since", "2026"],
                  ] as string[][]).map(([k, v]) => (
                    <div key={k}>
                      <div style={{ fontSize: 12, color: C.gray400, marginBottom: 4 }}>{k}</div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: C.gray700 }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginTop: 20 }}>
                <div style={{ ...card, textAlign: "center", padding: 16 }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: C.orange }}>{orders.length}</div>
                  <div style={{ fontSize: 13, color: C.gray500 }}>Orders</div>
                </div>
                <div style={{ ...card, textAlign: "center", padding: 16 }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: C.orange }}>{wishlistCount}</div>
                  <div style={{ fontSize: 13, color: C.gray500 }}>Wishlist</div>
                </div>
                <div style={{ ...card, textAlign: "center", padding: 16 }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: C.orange }}>{reviewCount}</div>
                  <div style={{ fontSize: 13, color: C.gray500 }}>Reviews</div>
                </div>
              </div>
            </div>
          </div>
        );

      case "My Orders":
        return (<>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.gray700, marginBottom: 24 }}>My Orders ({orders.length})</div>
          {loading ? (
            <div style={{ textAlign: "center", padding: 40, color: C.orange, fontWeight: 700 }}>Loading orders...</div>
          ) : orders.length === 0 ? (
            <div style={{ ...card, textAlign: "center", padding: 40 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.gray700, marginBottom: 8 }}>No orders yet</div>
              <div style={{ fontSize: 14, color: C.gray400, marginBottom: 20 }}>Start shopping to see your orders here</div>
              <a href="/catalog" style={{ ...outlineBtn, textDecoration: "none", padding: "10px 24px" }}>Browse Products</a>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {orders.map((order) => (
                <div key={order.id} style={{ ...card, padding: 20 }}>
                  {/* Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: C.orange }}>Order #{order.id}</span>
                      <span style={{ ...badge, ...getStatusStyle(order.status) }}>{order.status}</span>
                    </div>
                    <span style={{ fontSize: 13, color: C.gray400 }}>{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>

                  {/* Tracking Timeline */}
                  <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
                    {[
                      { key: "pending", label: "Order Placed", icon: "📋" },
                      { key: "shipped", label: "Shipped", icon: "🚚" },
                      { key: "delivered", label: "Delivered", icon: "✅" },
                    ].map((step, i, arr) => {
                      const statuses = ["pending", "shipped", "delivered"];
                      const currentIndex = statuses.indexOf(order.status);
                      const stepIndex = statuses.indexOf(step.key);
                      const isDone = stepIndex <= currentIndex;
                      const isCurrent = stepIndex === currentIndex;
                      return (
                        <div key={step.key} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                          <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 6 }}>
                            <div style={{ width: 40, height: 40, borderRadius: "50%", background: isDone ? C.orange : C.gray200, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, border: isCurrent ? `3px solid ${C.orange}` : "none", boxShadow: isCurrent ? `0 0 0 4px ${C.orangeLight}` : "none" }}>
                              {step.icon}
                            </div>
                            <span style={{ fontSize: 11, fontWeight: isCurrent ? 700 : 400, color: isDone ? C.orange : C.gray400, textAlign: "center" as const }}>{step.label}</span>
                          </div>
                          {i < arr.length - 1 && (
                            <div style={{ flex: 1, height: 3, background: stepIndex < currentIndex ? C.orange : C.gray200, margin: "0 4px", marginBottom: 18, borderRadius: 2 }} />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Order Details */}
                  <div style={{ background: C.cream, borderRadius: 8, padding: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div style={{ fontSize: 13, color: C.gray500 }}>Total: <span style={{ fontWeight: 700, color: C.gray700 }}>BHD {Number(order.total).toFixed(2)}</span></div>
                    {order.payment_method && <div style={{ fontSize: 13, color: C.gray500 }}>Payment: <span style={{ fontWeight: 700, color: C.gray700 }}>{order.payment_method}</span></div>}
                    {order.shipping_address && <div style={{ fontSize: 13, color: C.gray500, gridColumn: "1/-1" }}>📍 {order.shipping_address}, {order.city}, {order.country}</div>}
                    {order.phone && <div style={{ fontSize: 13, color: C.gray500 }}>📞 {order.phone}</div>}
                  </div>

                  {/* Status message */}
                  <div style={{ marginTop: 12, fontSize: 13, fontWeight: 600, color: order.status === "delivered" ? C.green800 : order.status === "shipped" ? "#0F766E" : C.amber700, textAlign: "center" as const }}>
                    {order.status === "pending" && "⏳ Your order is being prepared..."}
                    {order.status === "shipped" && "🚚 Your order is on the way!"}
                    {order.status === "delivered" && "✅ Order delivered successfully!"}
                    {order.status === "cancelled" && "❌ Order was cancelled"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>);

      case "Settings":
        return (<>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.gray700, marginBottom: 24 }}>Settings</div>
          <div style={card}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.orange, marginBottom: 20 }}>Notification Preferences</div>
            {["Email notifications for orders", "Email notifications for auctions", "Promotional emails"].map((label) => (
              <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: `0.5px solid ${C.gray100}` }}>
                <span style={{ fontSize: 14, color: C.gray700 }}>{label}</span>
                <input type="checkbox" defaultChecked style={{ accentColor: C.orange, width: 18, height: 18 }} />
              </div>
            ))}
          </div>

          <div style={{ ...card, marginTop: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.orange, marginBottom: 20 }}>Account Actions</div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={handleSignOut} style={{ ...outlineBtn, padding: "10px 24px", borderColor: C.red500, color: C.red500 }}>Sign Out</button>
            </div>
          </div>
        </>);

      default: return null;
    }
  };

  return (
    <div style={{ background: C.cream, minHeight: "100vh" }}>
      {successMsg && <div style={{ position: "fixed", top: 16, right: 16, background: C.green50, border: `1px solid ${C.green800}`, color: C.green800, padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, zIndex: 9999 }}>✓ {successMsg}</div>}

      <nav style={{ background: C.white, borderBottom: `0.5px solid ${C.gray200}` }}>
        <div style={{ ...wrap, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 40px" }}>
          <a href="/" style={{ color: C.orange, fontWeight: 700, fontSize: 20, textDecoration: "none" }}>Artisan Co-op</a>
          <span style={{ fontSize: 14, color: C.gray500 }}>My Account</span>
        </div>
      </nav>

      <div style={{ ...wrap, padding: "32px 40px" }}>
        <div style={{ display: "flex", gap: 24 }}>
          {/* Sidebar */}
          <div style={{ width: 200, flexShrink: 0 }}>
            <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.gray200}`, overflow: "hidden" }}>
              {sidebarItems.map((item) => (
                <div key={item} onClick={() => setActive(item)} style={{ padding: "14px 20px", fontSize: 14, cursor: "pointer", color: active === item ? C.orange : C.gray500, background: active === item ? C.orangeLight : "transparent", borderLeft: active === item ? `3px solid ${C.orange}` : "3px solid transparent", fontWeight: active === item ? 700 : 400 }}>{item}</div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div style={{ flex: 1 }}>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;