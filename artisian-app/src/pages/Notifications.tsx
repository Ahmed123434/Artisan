// frontend/src/pages/Notifications.tsx
import { useState, useEffect } from "react";

const C = {
  orange: "#D85A30", orangeLight: "#FAECE7",
  cream: "#FAF8F5", stone50: "#F1EFE8", stone800: "#2C2C2A",
  white: "#ffffff", gray100: "#F5F5F4", gray200: "#E7E5E4",
  gray300: "#D6D3D1", gray400: "#A8A29E", gray500: "#78716C",
  gray600: "#57534E", gray700: "#44403C",
  red500: "#EF4444", green50: "#F0FDF4", green800: "#166534",
  blue50: "#EFF6FF", blue700: "#1D4ED8",
};

const wrap: React.CSSProperties = { maxWidth: 800, margin: "0 auto", padding: "0 40px" };
const outlineBtn: React.CSSProperties = { border: `2px solid ${C.orange}`, color: C.orange, fontWeight: 700, background: C.white, borderRadius: 8, padding: "6px 14px", fontSize: 13, cursor: "pointer" };

const API = "http://localhost:5000/api";

interface Notification { id: number; title: string; message: string; type: string; is_read: number; created_at: string; }

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
const [selected, setSelected] = useState<Notification | null>(null);

  const token = localStorage.getItem("token") || "";

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API}/notifications`, { headers: { "Authorization": `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markAsRead = async (id: number) => {
    try {
      await fetch(`${API}/notifications/${id}/read`, { method: "PUT", headers: { "Authorization": `Bearer ${token}` } });
      fetchNotifications();
    } catch (err) { console.error(err); }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`${API}/notifications/read-all`, { method: "PUT", headers: { "Authorization": `Bearer ${token}` } });
      fetchNotifications();
    } catch (err) { console.error(err); }
  };

  const deleteNotification = async (id: number) => {
    try {
      await fetch(`${API}/notifications/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
      fetchNotifications();
    } catch (err) { console.error(err); }
  };

  const getTypeIcon = (type: string): string => {
    switch (type) {
      case "order": return "📦";
      case "auction": return "🔨";
      case "review": return "⭐";
      case "bid": return "💰";
      default: return "🔔";
    }
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case "order": return C.green800;
      case "auction": return C.orange;
      case "bid": return C.blue700;
      default: return C.gray600;
    }
  };

  const getTimeAgo = (date: string): string => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const filtered = filter === "all" ? notifications : filter === "unread" ? notifications.filter(n => !n.is_read) : notifications.filter(n => n.type === filter);

  if (!token) {
    return (
      <div style={{ background: C.cream, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.gray200}`, padding: 40, textAlign: "center", maxWidth: 400 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.gray700, marginBottom: 8 }}>Please Login</div>
          <div style={{ fontSize: 14, color: C.gray400, marginBottom: 20 }}>Login to see your notifications.</div>
          <a href="/login" style={{ ...outlineBtn, textDecoration: "none", padding: "10px 24px" }}>Go to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: C.cream, minHeight: "100vh" }}>
      <nav style={{ background: C.white, borderBottom: `0.5px solid ${C.gray200}` }}>
        <div style={{ ...wrap, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 40px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
  <a href="/" style={{ color: C.orange, fontWeight: 700, fontSize: 20, textDecoration: "none" }}>Artisan Co-op</a>
  <a href="/" style={{ padding: "6px 16px", border: `1.5px solid ${C.orange}`, borderRadius: 20, color: C.orange, fontWeight: 600, fontSize: 13, textDecoration: "none" }}>Home</a>
</div>
          <span style={{ fontSize: 14, color: C.gray500 }}>Notifications</span>
        </div>
      </nav>

      {selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setSelected(null)}>
          <div style={{ background: C.white, borderRadius: 16, padding: 32, maxWidth: 480, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 40, textAlign: "center", marginBottom: 16 }}>{getTypeIcon(selected.type)}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.gray700, marginBottom: 8, textAlign: "center" }}>{selected.title}</div>
            <div style={{ fontSize: 14, color: C.gray500, lineHeight: 1.7, textAlign: "center", marginBottom: 16 }}>{selected.message}</div>
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 20 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: getTypeColor(selected.type), background: `${getTypeColor(selected.type)}15`, padding: "4px 12px", borderRadius: 10, textTransform: "capitalize" as const }}>{selected.type}</span>
              <span style={{ fontSize: 12, color: C.gray400 }}>{getTimeAgo(selected.created_at)}</span>
            </div>
            <button onClick={() => setSelected(null)} style={{ ...outlineBtn, width: "100%", padding: "10px 0", fontSize: 14 }}>Close</button>
          </div>
        </div>
      )}
      <div style={{ ...wrap, padding: "32px 40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: C.gray700, margin: "0 0 4px" }}>Notifications</h2>
            <p style={{ fontSize: 13, color: C.gray400, margin: 0 }}>{unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}</p>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} style={outlineBtn}>Mark all as read</button>
          )}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {["all", "unread", "order", "auction", "bid"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: "6px 16px", borderRadius: 20, fontSize: 13, cursor: "pointer", border: `1.5px solid ${filter === f ? C.orange : C.gray300}`, background: filter === f ? C.orangeLight : C.white, color: filter === f ? C.orange : C.gray600, fontWeight: filter === f ? 700 : 400, textTransform: "capitalize" as const }}>{f}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: C.orange, fontWeight: 700 }}>Loading notifications...</div>
        ) : filtered.length === 0 ? (
          <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.gray200}`, padding: 60, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔔</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.gray700, marginBottom: 8 }}>No notifications</div>
            <div style={{ fontSize: 14, color: C.gray400 }}>You're all caught up! Notifications will appear here when you get orders, bids, or reviews.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.map((n) => (
              <div key={n.id} onClick={() => { if (!n.is_read) markAsRead(n.id); setSelected(n); }} style={{ background: n.is_read ? C.white : C.blue50, borderRadius: 12, border: `1px solid ${n.is_read ? C.gray200 : "#BFDBFE"}`, padding: "16px 20px", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div style={{ fontSize: 24, flexShrink: 0, marginTop: 2 }}>{getTypeIcon(n.type)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.gray700 }}>{n.title}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 12, color: C.gray400 }}>{getTimeAgo(n.created_at)}</span>
                      {!n.is_read && <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.orange }} />}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: C.gray500, lineHeight: 1.5 }}>{n.message}</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: getTypeColor(n.type), background: `${getTypeColor(n.type)}15`, padding: "2px 8px", borderRadius: 10, textTransform: "capitalize" as const }}>{n.type}</span>
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }} style={{ background: "none", border: "none", color: C.gray400, cursor: "pointer", fontSize: 16, flexShrink: 0 }}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;