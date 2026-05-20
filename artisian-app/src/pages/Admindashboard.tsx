// frontend/src/pages/Admindashboard.tsx
import { useState, useEffect } from "react";

const C = {
  orange: "#D85A30", orangeLight: "#FAECE7",
  cream: "#FAF8F5", stone50: "#F1EFE8", stone800: "#2C2C2A",
  white: "#ffffff", gray100: "#F5F5F4", gray200: "#E7E5E4",
  gray300: "#D6D3D1", gray400: "#A8A29E", gray500: "#78716C",
  gray600: "#57534E", gray700: "#44403C",
  red50: "#FEF2F2", red500: "#EF4444",
  amber50: "#FFFBEB", amber700: "#B45309",
  green50: "#F0FDF4", green800: "#166534",
  teal50: "#F0FDFA", teal700: "#0F766E",
  blue50: "#EFF6FF", blue700: "#1D4ED8",
};

const card: React.CSSProperties = { background: C.white, borderRadius: 12, border: `1px solid ${C.gray200}`, padding: 16 };
const outlineBtn: React.CSSProperties = { border: `2px solid ${C.orange}`, color: C.orange, fontWeight: 700, background: C.white, borderRadius: 8, padding: "6px 14px", fontSize: 13, cursor: "pointer" };
const inputBase: React.CSSProperties = { width: "100%", border: `1px solid ${C.gray300}`, borderRadius: 8, padding: "9px 12px", fontSize: 13, color: C.stone800, background: C.white, boxSizing: "border-box", outline: "none" };
const badge: React.CSSProperties = { fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20 };

const API = "https://artisan-backend-gbby.onrender.com/api";
const BASE = "https://artisan-backend-gbby.onrender.com";

interface User { id: number; name: string; email: string; phone: string; role: string; shop_name: string; category: string; status: string; created_at: string; }
interface Product { id: number; name: string; price: number; category: string; artisan_name: string; status: string; stock: number; image: string | null; description: string; }
interface Stats { totalUsers: number; activeArtisans: number; totalOrders: number; totalProducts: number; }
interface Auction { id: number; product_name: string; artisan_name: string; start_bid: number; current_bid: number; status: string; start_time: string; end_time: string; bid_count: number; image: string | null; }
interface Order { id: number; customer_name: string; total: number; status: string; created_at: string; }

const AdminDashboard: React.FC = () => {
  const [active, setActive] = useState<string>("Dashboard");
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, activeArtisans: 0, totalOrders: 0, totalProducts: 0 });
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [userSearch, setUserSearch] = useState<string>("");
  const [productSearch, setProductSearch] = useState<string>("");
  const [productFilter, setProductFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token") || "";
  const headers = { "Content-Type": "application/json", "Authorization": `Bearer ${token}` };

  const showSuccess = (msg: string) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(""), 2500); };

  const fetchUsers = async () => { try { const res = await fetch(`${API}/users`, { headers }); if (res.ok) setUsers(await res.json()); } catch (err) { console.error(err); } };
  const fetchProducts = async () => { try { const res = await fetch(`${API}/users/admin/products`, { headers }); if (res.ok) setProducts(await res.json()); } catch (err) { console.error(err); } };
  const fetchStats = async () => { try { const res = await fetch(`${API}/users/admin/stats`, { headers }); if (res.ok) setStats(await res.json()); } catch (err) { console.error(err); } };
  const fetchOrders = async () => { try { const res = await fetch(`${API}/orders/all`, { headers }); if (res.ok) setOrders(await res.json()); } catch (err) { console.error(err); } };
const fetchAuctions = async () => { try { const res = await fetch(`${API}/auctions`, { headers }); if (res.ok) setAuctions(await res.json()); } catch (err) { console.error(err); } };
  useEffect(() => {
    const load = async () => { setLoading(true); await Promise.all([fetchUsers(), fetchProducts(), fetchStats(), fetchOrders(), fetchAuctions()]); setLoading(false); };
    load();
  }, []);

  const toggleUser = async (id: number) => {
    try {
      const res = await fetch(`${API}/users/${id}/toggle`, { method: "PUT", headers });
      if (res.ok) { const data = await res.json(); showSuccess(data.message); fetchUsers(); }
    } catch (err) { console.error(err); }
  };

  const deleteProduct = async (id: number) => {
    try {
      const res = await fetch(`${API}/users/admin/products/${id}`, { method: "DELETE", headers });
      if (res.ok) { showSuccess("Product deleted!"); fetchProducts(); }
    } catch (err) { console.error(err); }
  };
  const deleteAuction = async (id: number) => {
  try {
    const res = await fetch(`${API}/auctions/${id}`, { method: "DELETE", headers });
    if (res.ok) { showSuccess("Auction deleted!"); fetchAuctions(); }
  } catch (err) { console.error(err); }
};

  const updateProductStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`${API}/users/admin/products/${id}`, { method: "PUT", headers, body: JSON.stringify({ status }) });
      if (res.ok) { showSuccess(`Product ${status}!`); fetchProducts(); setSelectedProduct(null); }
    } catch (err) { console.error(err); }
  };

  const getStatusStyle = (status: string): React.CSSProperties => {
    switch (status) {
      case "active": case "approved": case "delivered": return { background: "#DCFCE7", color: "#14532D" };
      case "suspended": case "rejected": case "cancelled": return { background: "#FEE2E2", color: "#7F1D1D" };
      case "pending": return { background: C.amber50, color: C.amber700 };
      case "shipped": return { background: C.teal50, color: C.teal700 };
      default: return { background: C.stone50, color: C.gray500 };
    }
  };

  if (!token || user.role !== "admin") {
    return (
      <div style={{ background: C.cream, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ ...card, padding: 40, textAlign: "center", maxWidth: 400 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.gray700 }}>Admin Access Only</div>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchFilter = userFilter === "all" || u.role === userFilter;
    return matchSearch && matchFilter;
  });

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.artisan_name?.toLowerCase().includes(productSearch.toLowerCase());
    const matchFilter = productFilter === "all" || p.status === productFilter;
    return matchSearch && matchFilter;
  });

  const pendingProducts = products.filter(p => p.status === "pending");

  // Product detail view
  if (selectedProduct) {
    const p = selectedProduct;
    return (
      <div style={{ background: C.cream, minHeight: "100vh" }}>
        {successMsg && <div style={{ position: "fixed", top: 16, right: 16, background: C.green50, border: `1px solid ${C.green800}`, color: C.green800, padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, zIndex: 9999 }}>✓ {successMsg}</div>}
        <div style={{ background: C.stone800, padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ color: C.white, fontWeight: 700, fontSize: 16 }}>Artisan Co-op — Admin Panel</span>
          <button onClick={() => setSelectedProduct(null)} style={{ ...outlineBtn, borderColor: C.white, color: C.white, background: "transparent" }}>← Back</button>
        </div>
        <div style={{ maxWidth: 800, margin: "32px auto", padding: "0 40px" }}>
          <div style={{ ...card, padding: 0, overflow: "hidden" }}>
            {p.image && <img src={p.image && p.image.startsWith('http') ? p.image : p.image?.startsWith('http') ? p.image : `${BASE}${p.image}`} style={{ width: "100%", height: 300, objectFit: "contain", background: C.stone50 }} />}
            <div style={{ padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: C.gray700, margin: 0 }}>{p.name}</h2>
                <span style={{ ...badge, ...getStatusStyle(p.status), fontSize: 13, padding: "6px 14px" }}>{p.status}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
                <div style={{ ...card, textAlign: "center", padding: 16 }}><div style={{ fontSize: 11, color: C.gray400 }}>Price</div><div style={{ fontSize: 20, fontWeight: 700, color: C.orange }}>BHD {Number(p.price).toFixed(2)}</div></div>
                <div style={{ ...card, textAlign: "center", padding: 16 }}><div style={{ fontSize: 11, color: C.gray400 }}>Stock</div><div style={{ fontSize: 20, fontWeight: 700, color: C.gray700 }}>{p.stock}</div></div>
                <div style={{ ...card, textAlign: "center", padding: 16 }}><div style={{ fontSize: 11, color: C.gray400 }}>Category</div><div style={{ fontSize: 15, fontWeight: 700, color: C.gray700 }}>{p.category}</div></div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: C.gray400, marginBottom: 4 }}>Artisan</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.gray700 }}>{p.artisan_name}</div>
              </div>
              {p.description && <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, color: C.gray400, marginBottom: 4 }}>Description</div>
                <div style={{ fontSize: 14, color: C.gray600, lineHeight: 1.7 }}>{p.description}</div>
              </div>}
              <div style={{ display: "flex", gap: 12 }}>
                {p.status !== "approved" && <button onClick={() => updateProductStatus(p.id, "approved")} style={{ ...outlineBtn, flex: 1, padding: "12px 0", fontSize: 15, background: C.green800, color: C.white, borderColor: C.green800 }}>✓ Approve Product</button>}
                {p.status !== "rejected" && <button onClick={() => updateProductStatus(p.id, "rejected")} style={{ ...outlineBtn, flex: 1, padding: "12px 0", fontSize: 15, borderColor: C.red500, color: C.red500 }}>✕ Reject Product</button>}
                {p.status !== "pending" && <button onClick={() => updateProductStatus(p.id, "pending")} style={{ ...outlineBtn, flex: 1, padding: "12px 0", fontSize: 15, borderColor: C.amber700, color: C.amber700 }}>Set Pending</button>}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (active) {
      case "Dashboard": return (<>
        <div style={{ fontSize: 22, fontWeight: 700, color: C.gray700, marginBottom: 24 }}>Platform Overview</div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
          {[
            { val: String(stats.totalUsers), lbl: "Total Users", icon: "👥", color: C.blue50, text: C.blue700 },
            { val: String(stats.activeArtisans), lbl: "Active Artisans", icon: "🎨", color: C.orangeLight, text: C.orange },
            { val: String(stats.totalOrders), lbl: "Total Orders", icon: "📦", color: C.green50, text: C.green800 },
            { val: String(stats.totalProducts), lbl: "Total Products", icon: "🛍", color: C.teal50, text: C.teal700 },
          ].map((s) => (
            <div key={s.lbl} style={{ ...card, textAlign: "center", padding: 20, background: s.color, border: "none" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: s.text }}>{s.val}</div>
              <div style={{ fontSize: 13, color: C.gray600, marginTop: 4 }}>{s.lbl}</div>
            </div>
          ))}
        </div>

        {/* Pending approvals alert */}
        {pendingProducts.length > 0 && (
          <div style={{ background: "#FEF3C7", border: "1px solid #F59E0B", borderRadius: 12, padding: "14px 20px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>⚠️</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.amber700 }}>{pendingProducts.length} product{pendingProducts.length > 1 ? "s" : ""} waiting for approval</span>
            </div>
            <button onClick={() => { setActive("Manage products"); setProductFilter("pending"); }} style={{ ...outlineBtn, borderColor: C.amber700, color: C.amber700, fontSize: 12 }}>Review Now →</button>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          {/* Recent Users */}
          <div style={card}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: C.orange }}>Recent Users</span>
              <span onClick={() => setActive("Manage users")} style={{ fontSize: 12, color: C.orange, fontWeight: 700, cursor: "pointer" }}>View all →</span>
            </div>
            {users.slice(0, 6).map((u) => (
              <div key={u.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderBottom: `0.5px solid ${C.gray100}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: C.orangeLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#712B13" }}>{u.name.charAt(0)}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.gray700 }}>{u.name}</div>
                    <div style={{ fontSize: 11, color: C.gray400 }}>{u.email}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ ...badge, background: u.role === "artisan" ? C.orangeLight : u.role === "admin" ? C.teal50 : C.stone50, color: u.role === "artisan" ? "#712B13" : u.role === "admin" ? C.teal700 : C.gray600 }}>{u.role}</span>
                  <span style={{ ...badge, ...getStatusStyle(u.status) }}>{u.status}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Products */}
          <div style={card}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: C.orange }}>Recent Products</span>
              <span onClick={() => setActive("Manage products")} style={{ fontSize: 12, color: C.orange, fontWeight: 700, cursor: "pointer" }}>View all →</span>
            </div>
            {products.slice(0, 6).map((p) => (
              <div key={p.id} onClick={() => setSelectedProduct(p)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderBottom: `0.5px solid ${C.gray100}`, cursor: "pointer" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.gray700 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: C.gray400 }}>by {p.artisan_name} • BHD {Number(p.price).toFixed(2)}</div>
                </div>
                <span style={{ ...badge, ...getStatusStyle(p.status) }}>{p.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div style={card}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.orange, marginBottom: 14 }}>Recent Orders</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead><tr style={{ background: C.stone50 }}>{["Order", "Customer", "Total", "Status", "Date"].map(h => <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: C.gray500, textTransform: "uppercase" as const }}>{h}</th>)}</tr></thead>
            <tbody>{orders.slice(0, 8).map((o, i) => (
              <tr key={i} style={{ borderBottom: `0.5px solid ${C.gray100}` }}>
                <td style={{ padding: "10px 14px", fontWeight: 700, color: C.orange }}>#{o.id}</td>
                <td style={{ padding: "10px 14px", color: C.gray700 }}>{o.customer_name}</td>
                <td style={{ padding: "10px 14px", fontWeight: 700, color: C.gray700 }}>BHD {Number(o.total).toFixed(2)}</td>
                <td style={{ padding: "10px 14px" }}><span style={{ ...badge, ...getStatusStyle(o.status) }}>{o.status}</span></td>
                <td style={{ padding: "10px 14px", color: C.gray400 }}>{new Date(o.created_at).toLocaleDateString()}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </>);

      case "Manage users": return (<>
        <div style={{ fontSize: 22, fontWeight: 700, color: C.gray700, marginBottom: 20 }}>Manage Users</div>
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <input value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="Search by name or email..." style={{ ...inputBase }} />
          <select value={userFilter} onChange={e => setUserFilter(e.target.value)} style={{ border: `1px solid ${C.gray300}`, borderRadius: 8, padding: "9px 12px", fontSize: 13, background: C.white, outline: "none", cursor: "pointer", minWidth: 120 }}>
            <option value="all">All Roles</option>
            <option value="customer">Customers</option>
            <option value="artisan">Artisans</option>
            <option value="admin">Admins</option>
          </select>
        </div>
        <div style={{ marginBottom: 12, fontSize: 13, color: C.gray400 }}>{filteredUsers.length} users found</div>
        <div style={{ ...card, padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead><tr style={{ background: C.stone50 }}>{["User", "Email", "Phone", "Role", "Shop", "Joined", "Status", "Actions"].map((h) => (<th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: C.gray500, textTransform: "uppercase" as const }}>{h}</th>))}</tr></thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} style={{ borderBottom: `0.5px solid ${C.gray100}` }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.orangeLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#712B13" }}>{u.name.charAt(0)}</div>
                      <span style={{ fontWeight: 600, color: C.gray700 }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", color: C.gray500, fontSize: 12 }}>{u.email}</td>
                  <td style={{ padding: "12px 16px", color: C.gray500, fontSize: 12 }}>{u.phone || "-"}</td>
                  <td style={{ padding: "12px 16px" }}><span style={{ ...badge, background: u.role === "artisan" ? C.orangeLight : u.role === "admin" ? C.teal50 : C.stone50, color: u.role === "artisan" ? "#712B13" : u.role === "admin" ? C.teal700 : C.gray600 }}>{u.role}</span></td>
                  <td style={{ padding: "12px 16px", color: C.gray500, fontSize: 12 }}>{u.shop_name || "-"}</td>
                  <td style={{ padding: "12px 16px", color: C.gray400, fontSize: 12 }}>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: "12px 16px" }}><span style={{ ...badge, ...getStatusStyle(u.status) }}>{u.status}</span></td>
                  <td style={{ padding: "12px 16px" }}>
                    {u.role !== "admin" && (
                      <button onClick={() => toggleUser(u.id)} style={{ ...outlineBtn, fontSize: 11, padding: "4px 12px", borderColor: u.status === "active" ? C.red500 : C.green800, color: u.status === "active" ? C.red500 : C.green800 }}>
                        {u.status === "active" ? "Suspend" : "Restore"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>);

      case "Manage products": return (<>
        <div style={{ fontSize: 22, fontWeight: 700, color: C.gray700, marginBottom: 20 }}>Manage Products</div>
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <input value={productSearch} onChange={(e) => setProductSearch(e.target.value)} placeholder="Search by product or artisan..." style={{ ...inputBase }} />
          <select value={productFilter} onChange={e => setProductFilter(e.target.value)} style={{ border: `1px solid ${C.gray300}`, borderRadius: 8, padding: "9px 12px", fontSize: 13, background: C.white, outline: "none", cursor: "pointer", minWidth: 120 }}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div style={{ marginBottom: 12, fontSize: 13, color: C.gray400 }}>{filteredProducts.length} products found</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          {filteredProducts.map((p) => (
            <div key={p.id} style={{ ...card, padding: 0, overflow: "hidden", cursor: "pointer" }} onClick={() => setSelectedProduct(p)}>
              {p.image ? <img src={p.image && p.image.startsWith('http') ? p.image : p.image?.startsWith('http') ? p.image : `${BASE}${p.image}`} style={{ width: "100%", height: 160, objectFit: "contain", background: C.stone50 }} /> : <div style={{ height: 160, background: C.stone50, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: C.gray400 }}>{p.category}</div>}
              <div style={{ padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.gray700 }}>{p.name}</span>
                  <span style={{ ...badge, ...getStatusStyle(p.status) }}>{p.status}</span>
                </div>
                <div style={{ fontSize: 12, color: C.gray400, marginBottom: 8 }}>by {p.artisan_name}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: C.orange }}>BHD {Number(p.price).toFixed(2)}</span>
                  <span style={{ fontSize: 12, color: C.gray500 }}>Stock: {p.stock}</span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {p.status !== "approved" && <button onClick={(e) => { e.stopPropagation(); updateProductStatus(p.id, "approved"); }} style={{ ...outlineBtn, flex: 1, fontSize: 11, padding: "6px 0", borderColor: C.green800, color: C.green800 }}>✓ Approve</button>}
                  {p.status !== "rejected" && <button onClick={(e) => { e.stopPropagation(); updateProductStatus(p.id, "rejected"); }} style={{ ...outlineBtn, flex: 1, fontSize: 11, padding: "6px 0", borderColor: C.red500, color: C.red500 }}>✕ Reject</button>}
                  <button onClick={(e) => { e.stopPropagation(); if(confirm("Delete this product?")) deleteProduct(p.id); }} style={{ ...outlineBtn, fontSize: 11, padding: "6px 10px", borderColor: C.red500, color: C.red500 }}>🗑</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </>);


case "Reports":
        const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0);
        const artisans = users.filter(u => u.role === "artisan");
        const customers = users.filter(u => u.role === "customer");
        const approvedP = products.filter(p => p.status === "approved");
        const pendingP = products.filter(p => p.status === "pending");
        const rejectedP = products.filter(p => p.status === "rejected");
        const catMap: Record<string, number> = {};
        products.forEach(p => { catMap[p.category] = (catMap[p.category] || 0) + 1; });

        const printReport = () => {
          const rows1 = products.map(p => "<tr><td>" + p.name + "</td><td>" + p.artisan_name + "</td><td>" + p.category + "</td><td>BHD " + Number(p.price).toFixed(2) + "</td><td>" + p.stock + "</td><td>" + p.status + "</td></tr>").join("");
          const rows2 = orders.map(o => "<tr><td>#" + o.id + "</td><td>" + o.customer_name + "</td><td>BHD " + Number(o.total).toFixed(2) + "</td><td>" + o.status + "</td><td>" + new Date(o.created_at).toLocaleDateString() + "</td></tr>").join("");
          const rows3 = users.map(u => "<tr><td>" + u.name + "</td><td>" + u.email + "</td><td>" + u.role + "</td><td>" + u.status + "</td><td>" + new Date(u.created_at).toLocaleDateString() + "</td></tr>").join("");
          const html = "<!DOCTYPE html><html><head><title>Admin Report</title><style>body{font-family:Arial,sans-serif;padding:40px;color:#2C2C2A}h1{color:#D85A30;border-bottom:2px solid #D85A30;padding-bottom:10px}h2{color:#D85A30;margin-top:30px;font-size:16px}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin:20px 0}.stat{border:1px solid #E7E5E4;border-radius:8px;padding:16px;text-align:center}.stat-val{font-size:24px;font-weight:700;color:#D85A30}.stat-lbl{font-size:12px;color:#78716C;margin-top:4px}table{width:100%;border-collapse:collapse;margin-top:10px;margin-bottom:20px}th{background:#F1EFE8;padding:10px;text-align:left;font-size:12px;color:#78716C}td{padding:10px;border-bottom:1px solid #F5F5F4;font-size:13px}</style></head><body>"
            + "<h1>Admin Report — Artisan Co-op</h1>"
            + "<p style='color:#78716C;font-size:13px'>Generated: " + new Date().toLocaleString() + "</p>"
            + "<h2>Platform Summary</h2><div class='grid'>"
            + "<div class='stat'><div class='stat-val'>BHD " + totalRevenue.toFixed(2) + "</div><div class='stat-lbl'>Total Revenue</div></div>"
            + "<div class='stat'><div class='stat-val'>" + stats.totalUsers + "</div><div class='stat-lbl'>Total Users</div></div>"
            + "<div class='stat'><div class='stat-val'>" + stats.totalOrders + "</div><div class='stat-lbl'>Total Orders</div></div>"
            + "<div class='stat'><div class='stat-val'>" + stats.totalProducts + "</div><div class='stat-lbl'>Total Products</div></div>"
            + "</div>"
            + "<h2>All Products</h2><table><tr><th>Name</th><th>Artisan</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th></tr>" + rows1 + "</table>"
            + "<h2>All Orders</h2><table><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr>" + rows2 + "</table>"
            + "<h2>All Users</h2><table><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th></tr>" + rows3 + "</table>"
            + "<div style='margin-top:30px;padding:16px;background:#FEF3C7;border-radius:8px;font-size:14px;color:#92400E;text-align:center;'>To print: Press <strong>Ctrl + P</strong> then select <strong>Save as PDF</strong></div>"
            + "</body></html>";
          const blob = new Blob([html], { type: "text/html" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url; a.target = "_blank";
          document.body.appendChild(a); a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        };

        return (<>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.gray700 }}>Reports & Analytics</div>
            <button onClick={printReport} style={{ ...outlineBtn, padding: "10px 24px" }}>Report</button>
          </div>

          {/* Summary stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
            {[
              { val: "BHD " + totalRevenue.toFixed(0), lbl: "Total Revenue", icon: "💰" },
              { val: String(stats.totalUsers), lbl: "Total Users", icon: "👥" },
              { val: String(artisans.length), lbl: "Artisans", icon: "🎨" },
              { val: String(customers.length), lbl: "Customers", icon: "🛒" },
            ].map(s => (
              <div key={s.lbl} style={{ ...card, textAlign: "center", padding: 20 }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: C.orange }}>{s.val}</div>
                <div style={{ fontSize: 13, color: C.gray500, marginTop: 4 }}>{s.lbl}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
            {/* Product status breakdown */}
            <div style={card}>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.orange, marginBottom: 16 }}>Product Status</div>
              {[{ lbl: "Approved", val: approvedP.length, color: C.green800, bg: C.green50 }, { lbl: "Pending", val: pendingP.length, color: C.amber700, bg: C.amber50 }, { lbl: "Rejected", val: rejectedP.length, color: C.red500, bg: C.red50 }].map(s => (
                <div key={s.lbl} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `0.5px solid ${C.gray100}` }}>
                  <span style={{ ...badge, background: s.bg, color: s.color, fontSize: 12, padding: "4px 12px" }}>{s.lbl}</span>
                  <span style={{ fontSize: 20, fontWeight: 700, color: C.gray700 }}>{s.val}</span>
                </div>
              ))}
            </div>

            {/* Products by category */}
            <div style={card}>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.orange, marginBottom: 16 }}>Products by Category</div>
              {Object.entries(catMap).map(([c, n]) => (
                <div key={c} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.gray700, marginBottom: 4 }}><span>{c}</span><span style={{ fontWeight: 700 }}>{n}</span></div>
                  <div style={{ height: 8, background: C.gray200, borderRadius: 4, overflow: "hidden" }}><div style={{ height: "100%", background: C.orange, borderRadius: 4, width: `${(n / products.length) * 100}%` }} /></div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent orders */}
          <div style={card}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.orange, marginBottom: 16 }}>Recent Orders</div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead><tr style={{ background: C.stone50 }}>{["Order", "Customer", "Total", "Status", "Date"].map(h => <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: C.gray500, textTransform: "uppercase" as const }}>{h}</th>)}</tr></thead>
              <tbody>{orders.slice(0, 10).map((o, i) => (
                <tr key={i} style={{ borderBottom: `0.5px solid ${C.gray100}` }}>
                  <td style={{ padding: "10px 14px", fontWeight: 700, color: C.orange }}>#{o.id}</td>
                  <td style={{ padding: "10px 14px", color: C.gray700 }}>{o.customer_name}</td>
                  <td style={{ padding: "10px 14px", fontWeight: 700, color: C.gray700 }}>BHD {Number(o.total).toFixed(2)}</td>
                  <td style={{ padding: "10px 14px" }}><span style={{ ...badge, ...getStatusStyle(o.status) }}>{o.status}</span></td>
                  <td style={{ padding: "10px 14px", color: C.gray400 }}>{new Date(o.created_at).toLocaleDateString()}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </>);


   case "Orders": return (<>
        <div style={{ fontSize: 22, fontWeight: 700, color: C.gray700, marginBottom: 20 }}>All Orders ({orders.length})</div>
        <div style={{ ...card, padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead><tr style={{ background: C.stone50 }}>{["Order", "Customer", "Total", "Status", "Date"].map(h => <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: C.gray500, textTransform: "uppercase" as const }}>{h}</th>)}</tr></thead>
            <tbody>{orders.length === 0 ? <tr><td colSpan={5} style={{ padding: 40, textAlign: "center", color: C.gray400 }}>No orders yet</td></tr> : orders.map((o, i) => (
              <tr key={i} style={{ borderBottom: `0.5px solid ${C.gray100}` }}>
                <td style={{ padding: "12px 16px", fontWeight: 700, color: C.orange }}>#{o.id}</td>
                <td style={{ padding: "12px 16px", color: C.gray700 }}>{o.customer_name}</td>
                <td style={{ padding: "12px 16px", fontWeight: 700, color: C.gray700 }}>BHD {Number(o.total).toFixed(2)}</td>
                <td style={{ padding: "12px 16px" }}><span style={{ ...badge, ...getStatusStyle(o.status) }}>{o.status}</span></td>
                <td style={{ padding: "12px 16px", color: C.gray400 }}>{new Date(o.created_at).toLocaleDateString()}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </>);


case "Manage auctions": return (<>
  <div style={{ fontSize: 22, fontWeight: 700, color: C.gray700, marginBottom: 20 }}>Manage Auctions ({auctions.length})</div>
  <div style={{ ...card, padding: 0, overflow: "hidden" }}>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead><tr style={{ background: C.stone50 }}>{["Product", "Artisan", "Start Bid", "Current Bid", "Status", "End Time", "Bids", "Actions"].map(h => <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: C.gray500, textTransform: "uppercase" as const }}>{h}</th>)}</tr></thead>
      <tbody>{auctions.length === 0 ? <tr><td colSpan={8} style={{ padding: 40, textAlign: "center", color: C.gray400 }}>No auctions yet</td></tr> : auctions.map((a) => (
        <tr key={a.id} style={{ borderBottom: `0.5px solid ${C.gray100}` }}>
          <td style={{ padding: "12px 16px", fontWeight: 600, color: C.gray700 }}>{a.product_name}</td>
          <td style={{ padding: "12px 16px", color: C.gray500 }}>{a.artisan_name}</td>
          <td style={{ padding: "12px 16px", color: C.gray700 }}>BHD {Number(a.start_bid).toFixed(2)}</td>
          <td style={{ padding: "12px 16px", fontWeight: 700, color: C.orange }}>BHD {Number(a.current_bid).toFixed(2)}</td>
          <td style={{ padding: "12px 16px" }}><span style={{ ...badge, ...getStatusStyle(a.status) }}>{a.status}</span></td>
          <td style={{ padding: "12px 16px", color: C.gray400, fontSize: 12 }}>{new Date(a.end_time).toLocaleString()}</td>
          <td style={{ padding: "12px 16px", textAlign: "center", fontWeight: 700, color: C.gray700 }}>{a.bid_count}</td>
          <td style={{ padding: "12px 16px" }}>
            <button onClick={() => { if(confirm("Delete this auction?")) deleteAuction(a.id); }} style={{ ...outlineBtn, fontSize: 11, padding: "4px 10px", borderColor: C.red500, color: C.red500 }}>🗑 Delete</button>
          </td>
        </tr>
      ))}</tbody>
    </table>
  </div>
</>);



      default: return null;
    }
  };

  return (
    <div style={{ background: C.cream, minHeight: "100vh" }}>
      {successMsg && <div style={{ position: "fixed", top: 16, right: 16, background: C.green50, border: `1px solid ${C.green800}`, color: C.green800, padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, zIndex: 9999 }}>✓ {successMsg}</div>}
      <div style={{ background: C.stone800, padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ color: C.white, fontWeight: 700, fontSize: 16 }}>Artisan Co-op — Admin Panel</span>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {pendingProducts.length > 0 && <span style={{ background: C.red500, color: C.white, borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>⚠ {pendingProducts.length} pending</span>}
          <span style={{ color: C.gray400, fontSize: 13 }}>{user.name} | Administrator</span>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        <div style={{ width: 220, background: C.white, borderRight: `0.5px solid ${C.gray200}`, minHeight: "calc(100vh - 53px)", flexShrink: 0, paddingTop: 16 }}>
          {[
            { label: "Dashboard", icon: "📊" },
            { label: "Manage users", icon: "👥" },
            { label: "Manage products", icon: "🛍" },
            { label: "Orders", icon: "📦" },
            { label: "Reports", icon: "📊" },
            { label: "Manage auctions", icon: "🔨" },
          ].map((item) => (
            <div key={item.label} onClick={() => setActive(item.label)} style={{ padding: "13px 24px", fontSize: 14, cursor: "pointer", color: active === item.label ? C.orange : C.gray600, background: active === item.label ? C.orangeLight : "transparent", borderRight: active === item.label ? `3px solid ${C.orange}` : "none", fontWeight: active === item.label ? 700 : 400, display: "flex", alignItems: "center", gap: 10 }}>
              <span>{item.icon}</span>{item.label}
              {item.label === "Manage products" && pendingProducts.length > 0 && <span style={{ background: C.red500, color: C.white, borderRadius: 20, padding: "1px 7px", fontSize: 10, fontWeight: 700, marginLeft: "auto" }}>{pendingProducts.length}</span>}
            </div>
          ))}
          <div style={{ margin: "20px 16px 0", padding: "16px", background: C.stone50, borderRadius: 10 }}>
            <div style={{ fontSize: 12, color: C.gray500, fontWeight: 600, marginBottom: 10 }}>Quick Stats</div>
            <div style={{ fontSize: 12, color: C.gray600, lineHeight: 2 }}>
              <div>👥 {stats.totalUsers} Users</div>
              <div>🎨 {stats.activeArtisans} Artisans</div>
              <div>📦 {stats.totalOrders} Orders</div>
              <div>🛍 {stats.totalProducts} Products</div>
            </div>
          </div>
          <button onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("user"); window.location.href = "/login"; }} style={{ ...outlineBtn, margin: "16px", width: "calc(100% - 32px)", borderColor: C.red500, color: C.red500 }}>Sign Out</button>
        </div>
        <div style={{ flex: 1, padding: "32px 48px", maxWidth: "calc(100% - 220px)" }}>
          {loading ? <div style={{ textAlign: "center", padding: 60 }}><div style={{ fontSize: 18, fontWeight: 700, color: C.orange }}>Loading...</div></div> : renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;