// frontend/src/pages/Artisandashboard.tsx
import { useState, useEffect } from "react";
import ImageCropper from "./ImageCropper";

const C = {
  orange: "#D85A30", orangeLight: "#FAECE7",
  cream: "#FAF8F5", stone50: "#F1EFE8", stone800: "#2C2C2A",
  white: "#ffffff", gray100: "#F5F5F4", gray200: "#E7E5E4",
  gray300: "#D6D3D1", gray400: "#A8A29E", gray500: "#78716C",
  gray600: "#57534E", gray700: "#44403C",
  red500: "#EF4444", red50: "#FEF2F2", amber50: "#FFFBEB", amber700: "#B45309",
  green50: "#F0FDF4", green800: "#166534",
  teal50: "#F0FDFA", teal700: "#0F766E",
  blue50: "#EFF6FF", blue700: "#1D4ED8",
};

const card: React.CSSProperties = { background: C.white, borderRadius: 12, border: `1px solid ${C.gray200}`, padding: 16 };
const outlineBtn: React.CSSProperties = { border: `2px solid ${C.orange}`, color: C.orange, fontWeight: 700, background: C.white, borderRadius: 8, padding: "6px 14px", fontSize: 13, cursor: "pointer" };
const inputBase: React.CSSProperties = { width: "100%", border: `1px solid ${C.gray300}`, borderRadius: 8, padding: "9px 12px", fontSize: 13, color: C.stone800, background: C.white, boxSizing: "border-box", outline: "none" };
const labelStyle: React.CSSProperties = { display: "block", fontSize: 12, color: C.gray600, fontWeight: 500, marginBottom: 5 };
const bdg: React.CSSProperties = { fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20 };

const API = "https://artisan-backend-gbby.onrender.com/api";
const BASE = "https://artisan-backend-gbby.onrender.com";

interface Product { id: number; name: string; description: string; price: number; category: string; stock: number; status: string; image: string | null; }
interface Order { id: number; product_name: string; customer_name: string; customer_email: string; customer_phone: string; quantity: number; price: number; status: string; created_at: string; shipping_address: string; city: string; country: string; phone: string; payment_method: string; }
interface Stats { products: number; orders: number; revenue: number; }
interface Auction { id: number; product_name: string; product_id: number; image: string | null; start_bid: number; current_bid: number; status: string; start_time: string; end_time: string; bid_count: number; }

const ArtisanDashboard: React.FC = () => {
  const [active, setActive] = useState("Dashboard");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [stats, setStats] = useState<Stats>({ products: 0, orders: 0, revenue: 0 });
  const [successMsg, setSuccessMsg] = useState("");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showCreateAuction, setShowCreateAuction] = useState(false);
  const [loading, setLoading] = useState(true);
  const [auctionError, setAuctionError] = useState("");
  const [cropSrc, setCropSrc] = useState("");
  const [cropTarget, setCropTarget] = useState<"add"|"edit"|null>(null);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderFilter, setOrderFilter] = useState("all");

  const [pName, setPName] = useState(""); const [pCat, setPCat] = useState(""); const [pPrice, setPPrice] = useState(""); const [pStock, setPStock] = useState(""); const [pDesc, setPDesc] = useState(""); const [pImage, setPImage] = useState<File|null>(null); const [pPreview, setPPreview] = useState("");
  const [editP, setEditP] = useState<Product|null>(null);
  const [eName, setEName] = useState(""); const [eCat, setECat] = useState(""); const [ePrice, setEPrice] = useState(""); const [eStock, setEStock] = useState(""); const [eDesc, setEDesc] = useState(""); const [eStatus, setEStatus] = useState(""); const [eImage, setEImage] = useState<File|null>(null); const [ePreview, setEPreview] = useState("");
  const [viewAuction, setViewAuction] = useState<Auction|null>(null);
  const [aProductId, setAProductId] = useState(""); const [aStartBid, setAStartBid] = useState(""); const [aStartTime, setAStartTime] = useState(""); const [aEndTime, setAEndTime] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token") || "";
  const headers = { "Content-Type": "application/json", "Authorization": `Bearer ${token}` };
  const showOk = (m: string) => { setSuccessMsg(m); setTimeout(() => setSuccessMsg(""), 2500); };

  const fetchProducts = async () => { try { const r = await fetch(`${API}/products/my/all`, { headers: { Authorization: `Bearer ${token}` } }); if (r.ok) setProducts(await r.json()); } catch(e){} };
  const fetchOrders = async () => { try { const r = await fetch(`${API}/orders/artisan`, { headers }); if (r.ok) setOrders(await r.json()); } catch(e){} };
  const fetchStats = async () => { try { const r = await fetch(`${API}/users/artisan/stats`, { headers }); if (r.ok) setStats(await r.json()); } catch(e){} };
  const fetchAuctions = async () => { try { const r = await fetch(`${API}/auctions/my`, { headers: { Authorization: `Bearer ${token}` } }); if (r.ok) setAuctions(await r.json()); } catch(e){} };

  useEffect(() => { const l = async () => { setLoading(true); await Promise.all([fetchProducts(), fetchOrders(), fetchStats(), fetchAuctions()]); setLoading(false); }; l(); }, []);

  const addProduct = async () => {
    if (!pName||!pCat||!pPrice) { alert("Please fill Name, Category and Price"); return; }
    if (!pImage) { alert("Please choose and crop an image first"); return; }
    const fd = new FormData(); fd.append("name",pName); fd.append("description",pDesc); fd.append("price",pPrice); fd.append("category",pCat); fd.append("stock",pStock||"0");
    if (pImage) fd.append("images",pImage);
    try {
      const r = await fetch(`${API}/products`, { method:"POST", headers:{Authorization:`Bearer ${token}`}, body:fd });
      if (r.ok) { showOk("Product added! Waiting for admin approval."); setPName(""); setPCat(""); setPPrice(""); setPStock(""); setPDesc(""); setPImage(null); setPPreview(""); setShowAddProduct(false); fetchProducts(); fetchStats(); }
    } catch(e){}
  };

  const openEdit = (p: Product) => { setEditP(p); setEName(p.name); setECat(p.category); setEPrice(String(p.price)); setEStock(String(p.stock)); setEDesc(p.description||""); setEStatus(p.status); setEImage(null); setEPreview(p.image?p.image && p.image.startsWith('http') ? p.image : p.image?.startsWith('http') ? p.image : `${BASE}${p.image}`:""); };

  const saveEdit = async () => {
    if (!editP||!eName||!ePrice) return;
    const fd = new FormData(); fd.append("name",eName); fd.append("description",eDesc); fd.append("price",ePrice); fd.append("category",eCat); fd.append("stock",eStock);
    if (eImage) fd.append("images",eImage);
    try {
      const r = await fetch(`${API}/products/${editP.id}`, { method:"PUT", headers:{Authorization:`Bearer ${token}`}, body:fd });
      if (r.ok) { showOk("Product updated!"); setEditP(null); fetchProducts(); }
    } catch(e){}
  };

  const deleteProduct = async (id: number) => {
    if (!confirm("Delete this product?")) return;
    try { const r = await fetch(`${API}/products/${id}`, { method:"DELETE", headers }); if (r.ok) { showOk("Deleted"); setEditP(null); fetchProducts(); fetchStats(); } } catch(e){}
  };



  const updateOrderStatus = async (id: number, status: string) => {
    try {
      const r = await fetch(`${API}/orders/${id}/status`, { method:"PUT", headers, body:JSON.stringify({status}) });
      if (r.ok) { showOk(`Order marked as ${status}!`); fetchOrders(); }
    } catch(e){}
  };

  const createAuction = async () => {
    if (!aProductId||!aStartBid||!aStartTime||!aEndTime) { setAuctionError("Fill all fields"); return; }
    setAuctionError("");
    try {
      const r = await fetch(`${API}/auctions`, { method:"POST", headers, body:JSON.stringify({product_id:Number(aProductId),start_bid:Number(aStartBid),start_time:aStartTime,end_time:aEndTime}) });
      const d = await r.json();
      if (r.ok) { showOk("Auction created!"); setShowCreateAuction(false); setAProductId(""); setAStartBid(""); setAStartTime(""); setAEndTime(""); fetchAuctions(); }
      else setAuctionError(d.message);
    } catch(e){ setAuctionError("Server error"); }
  };

  const printReports = () => {
    const totalRev = orders.reduce((s, o) => s + Number(o.price) * o.quantity, 0);
    const catMap: Record<string, number> = {};
    products.forEach(p => { catMap[p.category] = (catMap[p.category] || 0) + 1; });
    const rows1 = products.map(p => "<tr><td>" + p.name + "</td><td>" + p.category + "</td><td>BHD " + Number(p.price).toFixed(2) + "</td><td>" + p.stock + "</td><td>" + p.status + "</td></tr>").join("");
    const rows2 = orders.map(o => "<tr><td>#" + o.id + "</td><td>" + o.product_name + "</td><td>" + o.customer_name + "</td><td>" + o.quantity + "</td><td>BHD " + (Number(o.price) * o.quantity).toFixed(2) + "</td><td>" + o.status + "</td><td>" + new Date(o.created_at).toLocaleDateString() + "</td></tr>").join("");
    const rows3 = Object.entries(catMap).map(([c, n]) => "<tr><td>" + c + "</td><td>" + n + "</td></tr>").join("");
    const rows4 = auctions.map(a => "<tr><td>" + a.product_name + "</td><td>BHD " + Number(a.current_bid).toFixed(2) + "</td><td>" + a.bid_count + "</td><td>" + a.status + "</td><td>" + new Date(a.end_time).toLocaleString() + "</td></tr>").join("");
    const html = "<!DOCTYPE html><html><head><title>Artisan Report</title><style>body{font-family:Arial,sans-serif;padding:40px;color:#2C2C2A}h1{color:#D85A30;border-bottom:2px solid #D85A30;padding-bottom:10px}h2{color:#D85A30;margin-top:30px;font-size:16px}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin:20px 0}.stat{border:1px solid #E7E5E4;border-radius:8px;padding:16px;text-align:center}.stat-val{font-size:24px;font-weight:700;color:#D85A30}.stat-lbl{font-size:12px;color:#78716C;margin-top:4px}table{width:100%;border-collapse:collapse;margin-top:10px;margin-bottom:20px}th{background:#F1EFE8;padding:10px;text-align:left;font-size:12px;color:#78716C}td{padding:10px;border-bottom:1px solid #F5F5F4;font-size:13px}</style></head><body>"
      + "<h1>Artisan Report - " + (user.name || "") + " " + (user.shop_name ? "(" + user.shop_name + ")" : "") + "</h1>"
      + "<p style='color:#78716C;font-size:13px'>Generated: " + new Date().toLocaleString() + "</p>"
      + "<h2>Summary</h2><div class='grid'><div class='stat'><div class='stat-val'>BHD " + totalRev.toFixed(2) + "</div><div class='stat-lbl'>Revenue</div></div><div class='stat'><div class='stat-val'>" + orders.length + "</div><div class='stat-lbl'>Orders</div></div><div class='stat'><div class='stat-val'>" + products.length + "</div><div class='stat-lbl'>Products</div></div><div class='stat'><div class='stat-val'>" + auctions.length + "</div><div class='stat-lbl'>Auctions</div></div></div>"
      + "<h2>Products</h2><table><tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th></tr>" + rows1 + "</table>"
      + "<h2>Orders</h2><table><tr><th>Order</th><th>Product</th><th>Customer</th><th>Qty</th><th>Amount</th><th>Status</th><th>Date</th></tr>" + rows2 + "</table>"
      + "<h2>Products by Category</h2><table><tr><th>Category</th><th>Count</th></tr>" + rows3 + "</table>"
      + "<h2>Auctions</h2><table><tr><th>Product</th><th>Current Bid</th><th>Bids</th><th>Status</th><th>End Time</th></tr>" + rows4 + "</table>"
      + "<div style='margin-top:30px;padding:16px;background:#FEF3C7;border-radius:8px;border:1px solid #F59E0B;font-size:14px;color:#92400E;text-align:center;'>To save or print: Press <strong>Ctrl + P</strong> then select <strong>Save as PDF</strong></div>"
      + "</body></html>";
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.target = "_blank";
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const ss = (s: string): React.CSSProperties => {
    switch(s) {
      case "pending": case "upcoming": return {background:"#FEF3C7",color:"#92400E"};
      case "approved": case "live": case "delivered": return {background:"#DCFCE7",color:"#14532D"};
      case "rejected": case "closed": case "cancelled": return {background:"#FEE2E2",color:"#7F1D1D"};
      case "shipped": return {background:C.teal50,color:C.teal700};
      default: return {background:C.amber50,color:C.amber700};
    }
  };

  if (!token||user.role!=="artisan") return (<div style={{background:C.cream,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{...card,padding:40,textAlign:"center",maxWidth:400}}><div style={{fontSize:48,marginBottom:16}}>🔒</div><div style={{fontSize:20,fontWeight:700,color:C.gray700}}>Artisan Access Only</div></div></div>);

  if (editP) return (
    <div style={{background:C.cream,minHeight:"100vh"}}>
      {cropSrc && cropTarget && <ImageCropper imageSrc={cropSrc} onCropDone={(file)=>{ setEImage(file); setEPreview(URL.createObjectURL(file)); setCropSrc(""); setCropTarget(null); }} onCancel={()=>{ setCropSrc(""); setCropTarget(null); }} />}
      {successMsg && <div style={{position:"fixed",top:16,right:16,background:C.green50,border:`1px solid ${C.green800}`,color:C.green800,padding:"10px 20px",borderRadius:8,fontSize:13,fontWeight:600,zIndex:9999}}>✓ {successMsg}</div>}
      <div style={{background:C.orange,padding:"16px 32px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{color:C.white,fontWeight:700,fontSize:16}}>Edit Product</span>
        <button onClick={()=>setEditP(null)} style={{...outlineBtn,borderColor:C.white,color:C.white,background:"transparent"}}>← Back</button>
      </div>
      <div style={{maxWidth:700,margin:"32px auto",padding:"0 40px"}}>
        <div style={{...card,padding:24}}>
          <div style={{fontSize:20,fontWeight:700,color:C.orange,marginBottom:20}}>Edit: {editP.name}</div>
          {ePreview && <img src={ePreview} style={{width:"100%",height:250,objectFit:"contain",borderRadius:12,marginBottom:16}} />}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <div><label style={labelStyle}>Name</label><input value={eName} onChange={e=>setEName(e.target.value)} style={inputBase}/></div>
            <div><label style={labelStyle}>Category</label><select value={eCat} onChange={e=>setECat(e.target.value)} style={{...inputBase,color:eCat?C.stone800:C.gray400}}><option value="">Select...</option>{["Pottery","Textiles","Jewelry","Painting","Woodwork"].map(c=><option key={c} value={c}>{c}</option>)}</select></div>
            <div><label style={labelStyle}>Price (BHD)</label><input type="number" value={ePrice} onChange={e=>setEPrice(e.target.value)} style={inputBase}/></div>
            <div><label style={labelStyle}>Stock</label><input type="number" value={eStock} onChange={e=>setEStock(e.target.value)} style={inputBase}/></div>
          </div>
          <div style={{marginTop:14}}><label style={labelStyle}>Description</label><textarea value={eDesc} onChange={e=>setEDesc(e.target.value)} rows={3} style={{...inputBase,resize:"none" as const,fontFamily:"inherit"}}/></div>
          <div style={{marginTop:14}}>
            <label style={labelStyle}>Status (set by Admin)</label>
            <div style={{...bdg,...ss(eStatus),fontSize:13,padding:"6px 14px",display:"inline-block"}}>{eStatus}</div>
          </div>
          <div style={{marginTop:14}}>
            <label style={labelStyle}>Change Image</label>
            <label style={{...outlineBtn,display:"inline-block",padding:"10px 20px",cursor:"pointer"}}>
              Choose New Image
              <input type="file" accept="image/*" onChange={e=>{ const f=e.target.files?.[0]; if(f){ setCropSrc(URL.createObjectURL(f)); setCropTarget("edit"); } }} style={{display:"none"}}/>
            </label>
          </div>
          <div style={{display:"flex",gap:10,marginTop:20}}>
            <button onClick={saveEdit} style={{...outlineBtn,background:C.orange,color:C.white,border:`2px solid ${C.orange}`,padding:"12px 32px",fontSize:15}}>Save Changes</button>
            <button onClick={()=>setEditP(null)} style={{...outlineBtn,padding:"12px 32px",fontSize:15}}>Cancel</button>
            <button onClick={()=>deleteProduct(editP.id)} style={{...outlineBtn,padding:"12px 32px",fontSize:15,borderColor:C.red500,color:C.red500,marginLeft:"auto"}}>Delete</button>
          </div>
        </div>
      </div>
    </div>
  );

  if (viewAuction) return (
    <div style={{background:C.cream,minHeight:"100vh"}}>
      <div style={{background:C.orange,padding:"16px 32px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{color:C.white,fontWeight:700,fontSize:16}}>Auction Details</span>
        <button onClick={()=>setViewAuction(null)} style={{...outlineBtn,borderColor:C.white,color:C.white,background:"transparent"}}>← Back</button>
      </div>
      <div style={{maxWidth:700,margin:"32px auto",padding:"0 40px"}}>
        <div style={{...card,padding:24}}>
          {viewAuction.image && <img src={`${BASE}${viewAuction.image}`} style={{width:"100%",maxHeight:300,objectFit:"contain",borderRadius:12,marginBottom:20,background:C.stone50}}/>}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <h2 style={{fontSize:24,fontWeight:700,color:C.gray700,margin:0}}>{viewAuction.product_name}</h2>
            <span style={{...bdg,...ss(viewAuction.status),fontSize:13,padding:"5px 14px"}}>{viewAuction.status.toUpperCase()}</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16,marginBottom:20}}>
            <div style={{...card,textAlign:"center",padding:16}}><div style={{fontSize:11,color:C.gray400}}>Current Bid</div><div style={{fontSize:22,fontWeight:700,color:C.orange}}>BHD {Number(viewAuction.current_bid).toFixed(2)}</div></div>
            <div style={{...card,textAlign:"center",padding:16}}><div style={{fontSize:11,color:C.gray400}}>Starting Bid</div><div style={{fontSize:22,fontWeight:700,color:C.gray700}}>BHD {Number(viewAuction.start_bid).toFixed(2)}</div></div>
            <div style={{...card,textAlign:"center",padding:16}}><div style={{fontSize:11,color:C.gray400}}>Total Bids</div><div style={{fontSize:22,fontWeight:700,color:C.gray700}}>{viewAuction.bid_count}</div></div>
          </div>
          <a href={`/auction-detail?id=${viewAuction.id}`} style={{...outlineBtn,display:"block",textAlign:"center",textDecoration:"none",marginTop:16,padding:"12px 0",fontSize:15}}>View Public Auction Page →</a>
        </div>
      </div>
    </div>
  );

  const filteredOrders = orders.filter(o => {
    const matchSearch = o.product_name.toLowerCase().includes(orderSearch.toLowerCase()) || o.customer_name.toLowerCase().includes(orderSearch.toLowerCase());
    const matchFilter = orderFilter === "all" || o.status === orderFilter;
    return matchSearch && matchFilter;
  });

  const totalRevenue = orders.reduce((s, o) => s + Number(o.price) * o.quantity, 0);
  const pendingOrders = orders.filter(o => o.status === "pending").length;
  const approvedProducts = products.filter(p => p.status === "approved").length;
  const pendingProducts = products.filter(p => p.status === "pending").length;

  const renderContent = () => {
    switch(active) {
      case "Dashboard": return (<>
        <div style={{fontSize:22,fontWeight:700,color:C.gray700,marginBottom:8}}>Welcome back, {user.name} 👋</div>
        <div style={{fontSize:14,color:C.gray400,marginBottom:24}}>{user.shop_name ? `${user.shop_name} • ` : ""}{user.category || ""}</div>

        {/* Alert for pending products */}
        {pendingProducts > 0 && (
          <div style={{background:"#FEF3C7",border:"1px solid #F59E0B",borderRadius:12,padding:"12px 20px",marginBottom:20,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:20}}>⏳</span>
              <span style={{fontSize:14,fontWeight:700,color:C.amber700}}>{pendingProducts} product{pendingProducts>1?"s":""} waiting for admin approval</span>
            </div>
            <button onClick={()=>setActive("My products")} style={{...outlineBtn,borderColor:C.amber700,color:C.amber700,fontSize:12}}>View →</button>
          </div>
        )}

        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:24}}>
          {[
            {v:`BHD ${totalRevenue.toFixed(0)}`,l:"Total Revenue",icon:"💰",bg:C.green50,color:C.green800},
            {v:String(orders.length),l:"Total Orders",icon:"📦",bg:C.blue50,color:C.blue700},
            {v:String(approvedProducts),l:"Active Products",icon:"✅",bg:C.orangeLight,color:C.orange},
            {v:String(auctions.length),l:"Auctions",icon:"🔨",bg:C.teal50,color:C.teal700},
          ].map(s=>(
            <div key={s.l} style={{...card,textAlign:"center",padding:20,background:s.bg,border:"none"}}>
              <div style={{fontSize:24,marginBottom:8}}>{s.icon}</div>
              <div style={{fontSize:22,fontWeight:700,color:s.color}}>{s.v}</div>
              <div style={{fontSize:13,color:C.gray600,marginTop:4}}>{s.l}</div>
            </div>
          ))}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
          {/* Recent Orders */}
          <div style={card}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
              <span style={{fontSize:15,fontWeight:700,color:C.orange}}>Recent Orders</span>
              <span onClick={()=>setActive("Orders")} style={{fontSize:12,color:C.orange,fontWeight:700,cursor:"pointer"}}>View all →</span>
            </div>
            {orders.length === 0 ? <div style={{textAlign:"center",padding:20,color:C.gray400}}>No orders yet</div> :
            orders.slice(0,5).map((o,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 0",borderBottom:`0.5px solid ${C.gray100}`}}>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:C.gray700}}>{o.product_name}</div>
                  <div style={{fontSize:11,color:C.gray400}}>by {o.customer_name} • ×{o.quantity}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:13,fontWeight:700,color:C.orange}}>BHD {(Number(o.price)*o.quantity).toFixed(2)}</div>
                  <span style={{...bdg,...ss(o.status)}}>{o.status}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Product performance */}
          <div style={card}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
              <span style={{fontSize:15,fontWeight:700,color:C.orange}}>My Products</span>
              <span onClick={()=>setActive("My products")} style={{fontSize:12,color:C.orange,fontWeight:700,cursor:"pointer"}}>View all →</span>
            </div>
            {products.length === 0 ? <div style={{textAlign:"center",padding:20,color:C.gray400}}>No products yet</div> :
            products.slice(0,5).map(p=>(
              <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:`0.5px solid ${C.gray100}`,cursor:"pointer"}} onClick={()=>openEdit(p)}>
                {p.image ? <img src={p.image && p.image.startsWith('http') ? p.image : p.image?.startsWith('http') ? p.image : `${BASE}${p.image}`} style={{width:36,height:36,borderRadius:6,objectFit:"cover"}}/> : <div style={{width:36,height:36,borderRadius:6,background:C.orangeLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#712B13"}}>{p.category[0]}</div>}
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:600,color:C.gray700}}>{p.name}</div>
                  <div style={{fontSize:11,color:C.gray400}}>Stock: {p.stock} • BHD {Number(p.price).toFixed(2)}</div>
                </div>
                <span style={{...bdg,...ss(p.status)}}>{p.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div style={card}>
          <div style={{fontSize:15,fontWeight:700,color:C.orange,marginBottom:16}}>Quick Actions</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
            <button onClick={()=>{setActive("My products");setShowAddProduct(true);}} style={{...outlineBtn,padding:"14px 0",width:"100%",flexDirection:"column" as const,display:"flex",alignItems:"center",gap:4}}>
              <span style={{fontSize:20}}>➕</span><span>Add Product</span>
            </button>
            <button onClick={()=>{setActive("Auctions");setShowCreateAuction(true);}} style={{...outlineBtn,padding:"14px 0",width:"100%",flexDirection:"column" as const,display:"flex",alignItems:"center",gap:4}}>
              <span style={{fontSize:20}}>🔨</span><span>Start Auction</span>
            </button>
            <button onClick={()=>setActive("Orders")} style={{...outlineBtn,padding:"14px 0",width:"100%",flexDirection:"column" as const,display:"flex",alignItems:"center",gap:4}}>
              <span style={{fontSize:20}}>📦</span><span>View Orders</span>
              {pendingOrders > 0 && <span style={{background:C.red500,color:C.white,borderRadius:20,padding:"1px 7px",fontSize:10,fontWeight:700}}>{pendingOrders} new</span>}
            </button>
            <button onClick={()=>setActive("Reports")} style={{...outlineBtn,padding:"14px 0",width:"100%",flexDirection:"column" as const,display:"flex",alignItems:"center",gap:4}}>
              <span style={{fontSize:20}}>📊</span><span>Reports</span>
            </button>
          </div>
        </div>
      </>);

      case "My products": return (<>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
          <div>
            <div style={{fontSize:22,fontWeight:700,color:C.gray700}}>My Products ({products.length})</div>
            <div style={{fontSize:13,color:C.gray400,marginTop:4}}>{approvedProducts} approved • {pendingProducts} pending</div>
          </div>
          <button onClick={()=>setShowAddProduct(!showAddProduct)} style={outlineBtn}>{showAddProduct?"Cancel":"+ Add new product"}</button>
        </div>
        {showAddProduct && (
          <div style={{...card,padding:24,marginBottom:20}}>
            <div style={{fontSize:15,fontWeight:700,color:C.orange,marginBottom:16}}>Add new product</div>
            <div style={{marginBottom:12,padding:"10px 14px",background:"#FEF3C7",borderRadius:8,fontSize:12,color:"#92400E",fontWeight:600}}>
              ⚠ New products require admin approval before appearing in the catalog.
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <div><label style={labelStyle}>Name *</label><input value={pName} onChange={e=>setPName(e.target.value)} placeholder="Product name..." style={inputBase}/></div>
              <div><label style={labelStyle}>Category *</label><select value={pCat} onChange={e=>setPCat(e.target.value)} style={{...inputBase,color:pCat?C.stone800:C.gray400}}><option value="">Select...</option>{["Pottery","Textiles","Jewelry","Painting","Woodwork"].map(c=><option key={c} value={c}>{c}</option>)}</select></div>
              <div><label style={labelStyle}>Price (BHD) *</label><input type="number" value={pPrice} onChange={e=>setPPrice(e.target.value)} placeholder="0.00" style={inputBase}/></div>
              <div><label style={labelStyle}>Stock quantity</label><input type="number" value={pStock} onChange={e=>setPStock(e.target.value)} placeholder="0" style={inputBase}/></div>
            </div>
            <div style={{marginTop:14}}><label style={labelStyle}>Description</label><textarea value={pDesc} onChange={e=>setPDesc(e.target.value)} placeholder="Describe your product..." rows={3} style={{...inputBase,resize:"none" as const,fontFamily:"inherit"}}/></div>
            <div style={{marginTop:14}}>
              <label style={labelStyle}>Product Image *</label>
              <label style={{...outlineBtn,display:"inline-block",padding:"10px 20px",cursor:"pointer"}}>
                📷 Choose & Crop Image
                <input type="file" accept="image/*" onChange={e=>{ const f=e.target.files?.[0]; if(f){ setCropSrc(URL.createObjectURL(f)); setCropTarget("add"); } }} style={{display:"none"}}/>
              </label>
              {pPreview && <img src={pPreview} style={{display:"block",marginTop:10,width:"100%",maxHeight:200,objectFit:"contain",borderRadius:8,background:C.stone50}}/>}
            </div>
            <div style={{display:"flex",gap:10,marginTop:16}}>
              <button onClick={addProduct} style={{...outlineBtn,background:C.orange,color:C.white,border:`2px solid ${C.orange}`,padding:"10px 24px"}}>Save Product</button>
              <button onClick={()=>setShowAddProduct(false)} style={{...outlineBtn,padding:"10px 24px"}}>Cancel</button>
            </div>
          </div>
        )}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
          {products.length===0?<div style={{...card,padding:40,textAlign:"center",gridColumn:"1/-1",color:C.gray400}}>No products yet — add your first product!</div>:products.map(p=>(
            <div key={p.id} style={{...card,padding:0,overflow:"hidden",cursor:"pointer"}} onClick={()=>openEdit(p)}>
              {p.image?<img src={p.image && p.image.startsWith('http') ? p.image : p.image?.startsWith('http') ? p.image : `${BASE}${p.image}`} style={{width:"100%",height:140,objectFit:"contain",background:C.stone50}}/>:<div style={{height:140,background:C.orangeLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:"#712B13"}}>{p.category}</div>}
              <div style={{padding:12}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                  <span style={{fontSize:14,fontWeight:700,color:C.gray700}}>{p.name}</span>
                  <span style={{...bdg,...ss(p.status)}}>{p.status}</span>
                </div>
                <div style={{fontSize:12,color:C.gray400,marginBottom:6}}>{p.description?.substring(0,50)}{p.description?.length > 50 ? "..." : ""}</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:15,fontWeight:700,color:C.orange}}>BHD {Number(p.price).toFixed(2)}</span>
                  <span style={{fontSize:12,color:Number(p.stock)>0?C.green800:C.red500,fontWeight:600}}>Stock: {p.stock}</span>
                </div>
                <div style={{fontSize:11,color:C.orange,marginTop:8,textAlign:"center",fontWeight:600}}>Click to edit →</div>
              </div>
            </div>
          ))}
        </div>
      </>);

      case "Auctions": return (<>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
          <div style={{fontSize:22,fontWeight:700,color:C.gray700}}>My Auctions ({auctions.length})</div>
          <button onClick={()=>setShowCreateAuction(!showCreateAuction)} style={outlineBtn}>{showCreateAuction?"Cancel":"+ Start new auction"}</button>
        </div>
        {showCreateAuction && (
          <div style={{...card,padding:24,marginBottom:20}}>
            <div style={{fontSize:15,fontWeight:700,color:C.orange,marginBottom:16}}>Create New Auction</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <div><label style={labelStyle}>Select Product</label><select value={aProductId} onChange={e=>setAProductId(e.target.value)} style={{...inputBase,color:aProductId?C.stone800:C.gray400}}><option value="">Choose approved product...</option>{products.filter(p=>p.status==="approved").map(p=><option key={p.id} value={p.id}>{p.name} (BHD {Number(p.price).toFixed(2)})</option>)}</select></div>
              <div><label style={labelStyle}>Starting Bid (BHD)</label><input type="number" value={aStartBid} onChange={e=>setAStartBid(e.target.value)} placeholder="5.00" style={inputBase}/></div>
              <div><label style={labelStyle}>Start Time</label><input type="datetime-local" value={aStartTime} onChange={e=>setAStartTime(e.target.value)} style={inputBase}/></div>
              <div><label style={labelStyle}>End Time</label><input type="datetime-local" value={aEndTime} onChange={e=>setAEndTime(e.target.value)} style={inputBase}/></div>
            </div>
            {auctionError && <div style={{fontSize:12,color:C.red500,marginTop:10}}>✕ {auctionError}</div>}
            <div style={{display:"flex",gap:10,marginTop:16}}>
              <button onClick={createAuction} style={{...outlineBtn,background:C.orange,color:C.white,border:`2px solid ${C.orange}`,padding:"10px 24px"}}>Create Auction</button>
              <button onClick={()=>setShowCreateAuction(false)} style={{...outlineBtn,padding:"10px 24px"}}>Cancel</button>
            </div>
          </div>
        )}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
          {auctions.length===0?<div style={{...card,padding:40,textAlign:"center",gridColumn:"1/-1",color:C.gray400}}>No auctions yet</div>:auctions.map(a=>(
            <div key={a.id} style={{...card,padding:0,overflow:"hidden",cursor:"pointer"}} onClick={()=>setViewAuction(a)}>
              {a.image?<img src={a.image?.startsWith('http') ? a.image : `${BASE}${a.image}`} style={{width:"100%",height:140,objectFit:"contain",background:C.stone50}}/>:<div style={{height:140,background:C.orangeLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:"#712B13"}}>Auction</div>}
              <div style={{padding:12}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><span style={{fontSize:14,fontWeight:700,color:C.gray700}}>{a.product_name}</span><span style={{...bdg,...ss(a.status)}}>{a.status}</span></div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <div><div style={{fontSize:11,color:C.gray400}}>Current bid</div><div style={{fontSize:16,fontWeight:700,color:C.orange}}>BHD {Number(a.current_bid).toFixed(2)}</div></div>
                  <div style={{textAlign:"right"}}><div style={{fontSize:11,color:C.gray400}}>Bids</div><div style={{fontSize:16,fontWeight:700,color:C.gray700}}>{a.bid_count}</div></div>
                </div>
                <div style={{fontSize:11,color:C.gray400}}>Ends: {new Date(a.end_time).toLocaleString()}</div>
                <div style={{fontSize:11,color:C.orange,marginTop:6,textAlign:"center",fontWeight:600}}>Click for details →</div>
              </div>
            </div>
          ))}
        </div>
      </>);

      case "Orders": return (<>
        <div style={{fontSize:22,fontWeight:700,color:C.gray700,marginBottom:8}}>Orders ({orders.length})</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
          {[
            {lbl:"Total",val:orders.length,color:C.blue700,bg:C.blue50},
            {lbl:"Pending",val:orders.filter(o=>o.status==="pending").length,color:C.amber700,bg:C.amber50},
            {lbl:"Shipped",val:orders.filter(o=>o.status==="shipped").length,color:C.teal700,bg:C.teal50},
            {lbl:"Delivered",val:orders.filter(o=>o.status==="delivered").length,color:C.green800,bg:C.green50},
          ].map(s=>(
            <div key={s.lbl} style={{...card,textAlign:"center",padding:14,background:s.bg,border:"none"}}>
              <div style={{fontSize:22,fontWeight:700,color:s.color}}>{s.val}</div>
              <div style={{fontSize:12,color:C.gray600}}>{s.lbl}</div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:10,marginBottom:16}}>
          <input value={orderSearch} onChange={e=>setOrderSearch(e.target.value)} placeholder="Search by product or customer..." style={inputBase}/>
          <select value={orderFilter} onChange={e=>setOrderFilter(e.target.value)} style={{border:`1px solid ${C.gray300}`,borderRadius:8,padding:"9px 12px",fontSize:13,background:C.white,outline:"none",cursor:"pointer",minWidth:130}}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div style={{...card,padding:0,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:14}}>
            <thead><tr style={{background:C.stone50}}>{["Order","Product","Customer","Address","Qty","Amount","Status","Date","Action"].map(h=><th key={h} style={{padding:"12px 16px",textAlign:"left",fontSize:12,fontWeight:600,color:C.gray500,textTransform:"uppercase" as const}}>{h}</th>)}</tr></thead>
            <tbody>{filteredOrders.length===0?<tr><td colSpan={8} style={{padding:40,textAlign:"center",color:C.gray400}}>No orders found</td></tr>:filteredOrders.map((o,i)=>(
              <tr key={i} style={{borderBottom:`0.5px solid ${C.gray100}`}}>
                <td style={{padding:"12px 16px",fontWeight:600,color:C.orange}}>#{o.id}</td>
                <td style={{padding:"12px 16px",color:C.gray700,fontWeight:500}}>{o.product_name}</td>
                <td style={{padding:"12px 16px",color:C.gray500}}>{o.customer_name}</td>
                <td style={{padding:"12px 16px",color:C.gray400,fontSize:12}}>{o.shipping_address ? `${o.shipping_address}, ${o.city}, ${o.country}` : "-"}</td>
                <td style={{padding:"12px 16px"}}>{o.quantity}</td>
                <td style={{padding:"12px 16px",fontWeight:700,color:C.orange}}>BHD {(Number(o.price)*o.quantity).toFixed(2)}</td>
                <td style={{padding:"12px 16px"}}><span style={{...bdg,...ss(o.status)}}>{o.status}</span></td>
                <td style={{padding:"12px 16px",color:C.gray400,fontSize:13}}>{new Date(o.created_at).toLocaleDateString()}</td>
<td style={{padding:"12px 16px"}}>
  {o.status === "pending" && <button onClick={()=>updateOrderStatus(o.id,"shipped")} style={{...outlineBtn,fontSize:11,padding:"4px 10px",borderColor:C.teal700,color:C.teal700}}>Mark Shipped</button>}
  {o.status === "shipped" && <button onClick={()=>updateOrderStatus(o.id,"delivered")} style={{...outlineBtn,fontSize:11,padding:"4px 10px",borderColor:C.green800,color:C.green800}}>Mark Delivered</button>}
</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </>);

      case "Reports":
        const rev = orders.reduce((s,o)=>s+Number(o.price)*o.quantity,0);
        const cats: Record<string,number> = {}; products.forEach(p=>{cats[p.category]=(cats[p.category]||0)+1;});
        return (<>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
            <div style={{fontSize:22,fontWeight:700,color:C.gray700}}>Reports & Analytics</div>
            <button onClick={printReports} style={{...outlineBtn,padding:"10px 20px"}}>📄 Report</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:24}}>
            <div style={{...card,textAlign:"center",padding:20}}><div style={{fontSize:24,fontWeight:700,color:C.orange}}>BHD {rev.toFixed(2)}</div><div style={{fontSize:13,color:C.gray500}}>Total Revenue</div></div>
            <div style={{...card,textAlign:"center",padding:20}}><div style={{fontSize:24,fontWeight:700,color:C.orange}}>{orders.length}</div><div style={{fontSize:13,color:C.gray500}}>Total Orders</div></div>
            <div style={{...card,textAlign:"center",padding:20}}><div style={{fontSize:24,fontWeight:700,color:C.orange}}>{products.length}</div><div style={{fontSize:13,color:C.gray500}}>Total Products</div></div>
            <div style={{...card,textAlign:"center",padding:20}}><div style={{fontSize:24,fontWeight:700,color:C.orange}}>{auctions.length}</div><div style={{fontSize:13,color:C.gray500}}>Auctions</div></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:24}}>
            <div style={card}>
              <div style={{fontSize:15,fontWeight:700,color:C.orange,marginBottom:16}}>Products by Category</div>
              {Object.entries(cats).length===0?<div style={{color:C.gray400,textAlign:"center",padding:20}}>No data</div>:Object.entries(cats).map(([c,n])=>(
                <div key={c} style={{marginBottom:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:C.gray700,marginBottom:4}}><span>{c}</span><span style={{fontWeight:700}}>{n}</span></div>
                  <div style={{height:8,background:C.gray200,borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",background:C.orange,borderRadius:4,width:`${(n/products.length)*100}%`}}/></div>
                </div>
              ))}
            </div>
            <div style={card}>
              <div style={{fontSize:15,fontWeight:700,color:C.orange,marginBottom:16}}>Product Status</div>
              {["approved","pending","rejected"].map(s=>{const c=products.filter(p=>p.status===s).length;return(
                <div key={s} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`0.5px solid ${C.gray100}`}}>
                  <span style={{...bdg,...ss(s),fontSize:12,padding:"4px 12px"}}>{s}</span>
                  <span style={{fontSize:18,fontWeight:700,color:C.gray700}}>{c}</span>
                </div>
              );})}
            </div>
          </div>
          <div style={card}>
            <div style={{fontSize:15,fontWeight:700,color:C.orange,marginBottom:16}}>Order History</div>
            {orders.length===0?<div style={{color:C.gray400,textAlign:"center",padding:20}}>No sales yet</div>:(
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead><tr style={{background:C.stone50}}>{["Product","Customer","Amount","Status","Date"].map(h=><th key={h} style={{padding:"10px 14px",textAlign:"left",fontSize:11,fontWeight:600,color:C.gray500,textTransform:"uppercase" as const}}>{h}</th>)}</tr></thead>
                <tbody>{orders.map((o,i)=>(
                  <tr key={i} style={{borderBottom:`0.5px solid ${C.gray100}`}}>
                    <td style={{padding:"10px 14px",color:C.gray700,fontWeight:600}}>{o.product_name}</td>
                    <td style={{padding:"10px 14px",color:C.gray500}}>{o.customer_name}</td>
                    <td style={{padding:"10px 14px",fontWeight:700,color:C.orange}}>BHD {(Number(o.price)*o.quantity).toFixed(2)}</td>
                    <td style={{padding:"10px 14px"}}><span style={{...bdg,...ss(o.status)}}>{o.status}</span></td>
                    <td style={{padding:"10px 14px",color:C.gray400}}>{new Date(o.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </div>
        </>);

      case "Chat":
        return (
          <div style={{textAlign:"center",padding:60}}>
            <div style={{fontSize:64,marginBottom:16}}>💬</div>
            <div style={{fontSize:22,fontWeight:700,color:C.gray700,marginBottom:8}}>Messages</div>
            <div style={{fontSize:14,color:C.gray400,marginBottom:24}}>Chat directly with your customers</div>
            <a href="/chat" style={{...outlineBtn,textDecoration:"none",padding:"12px 32px",fontSize:15}}>Open Chat →</a>
          </div>
        );

      case "Profile": return (<>
        <div style={{fontSize:22,fontWeight:700,color:C.gray700,marginBottom:24}}>My Profile</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:20}}>
          <div style={{...card,padding:24,textAlign:"center"}}>
            <div style={{width:90,height:90,borderRadius:"50%",background:C.orangeLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,fontWeight:700,color:"#712B13",margin:"0 auto 16px"}}>{user.name?.charAt(0).toUpperCase()}</div>
            <div style={{fontSize:20,fontWeight:700,color:C.gray700}}>{user.name}</div>
            <div style={{fontSize:13,color:C.gray400,marginTop:4}}>{user.email}</div>
            {user.shop_name&&<div style={{fontSize:13,color:C.orange,marginTop:6,fontWeight:600}}>🏪 {user.shop_name}</div>}
            {user.category&&<div style={{fontSize:12,color:C.gray500,marginTop:4}}>{user.category}</div>}
            <button onClick={()=>{localStorage.removeItem("token");localStorage.removeItem("user");window.location.href="/login";}} style={{...outlineBtn,width:"100%",marginTop:16,padding:"10px 0",borderColor:C.red500,color:C.red500}}>Sign Out</button>
          </div>
          <div style={{display:"flex",flexDirection:"column" as const,gap:16}}>
            <div style={{...card,padding:24}}>
              <div style={{fontSize:15,fontWeight:700,color:C.orange,marginBottom:16}}>Account Info</div>
              {([["Name",user.name],["Email",user.email],["Phone",user.phone||"Not set"],["Role","Artisan"],["Shop",user.shop_name||"N/A"],["Category",user.category||"N/A"]] as string[][]).map(([k,v])=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:`0.5px solid ${C.gray100}`,fontSize:14}}><span style={{color:C.gray500}}>{k}</span><span style={{color:C.gray700,fontWeight:500}}>{v}</span></div>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
              {[{v:String(products.length),l:"Products"},{v:String(orders.length),l:"Orders"},{v:`BHD ${totalRevenue.toFixed(0)}`,l:"Revenue"}].map(s=>(
                <div key={s.l} style={{...card,textAlign:"center",padding:16}}>
                  <div style={{fontSize:20,fontWeight:700,color:C.orange}}>{s.v}</div>
                  <div style={{fontSize:12,color:C.gray500,marginTop:4}}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>);

      default: return null;
    }
  };

  return (
    <div style={{background:C.cream,minHeight:"100vh"}}>
      {cropSrc && cropTarget && (
        <ImageCropper
          imageSrc={cropSrc}
          onCropDone={(file) => {
            if(cropTarget === "add"){ setPImage(file); setPPreview(URL.createObjectURL(file)); }
            else { setEImage(file); setEPreview(URL.createObjectURL(file)); }
            setCropSrc(""); setCropTarget(null);
          }}
          onCancel={() => { setCropSrc(""); setCropTarget(null); }}
        />
      )}
      {successMsg&&<div style={{position:"fixed",top:16,right:16,background:C.green50,border:`1px solid ${C.green800}`,color:C.green800,padding:"10px 20px",borderRadius:8,fontSize:13,fontWeight:600,zIndex:9999}}>✓ {successMsg}</div>}
      <div style={{background:C.orange,padding:"16px 32px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <span style={{color:C.white,fontWeight:700,fontSize:16}}>Artisan Co-op — Dashboard</span>
          {pendingProducts > 0 && <span style={{background:"rgba(0,0,0,0.2)",color:C.white,borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:700}}>⏳ {pendingProducts} pending approval</span>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <a href="/" style={{color:"#FFEDD5",fontSize:13,textDecoration:"none"}}>← Home</a>
          <span style={{color:"#FFEDD5",fontSize:13}}>{user.name} | {user.shop_name}</span>
        </div>
      </div>
      <div style={{display:"flex",alignItems:"flex-start"}}>
        <div style={{width:230,background:C.white,borderRight:`0.5px solid ${C.gray200}`,minHeight:"calc(100vh - 53px)",flexShrink:0,paddingTop:16}}>
          {[
            {label:"Dashboard",icon:"📊"},
            {label:"My products",icon:"🛍"},
            {label:"Auctions",icon:"🔨"},
            {label:"Orders",icon:"📦"},
            {label:"Reports",icon:"📈"},
            {label:"Chat",icon:"💬"},
            {label:"Profile",icon:"👤"},
          ].map(item=>(
            <div key={item.label} onClick={()=>{setActive(item.label);setShowAddProduct(false);setShowCreateAuction(false);}} style={{padding:"13px 24px",fontSize:14,cursor:"pointer",color:active===item.label?C.orange:C.gray500,background:active===item.label?C.orangeLight:"transparent",borderRight:active===item.label?`3px solid ${C.orange}`:"none",fontWeight:active===item.label?700:400,display:"flex",alignItems:"center",gap:10}}>
              <span>{item.icon}</span>{item.label}
              {item.label==="Orders" && pendingOrders > 0 && <span style={{background:C.red500,color:C.white,borderRadius:20,padding:"1px 7px",fontSize:10,fontWeight:700,marginLeft:"auto"}}>{pendingOrders}</span>}
              {item.label==="My products" && pendingProducts > 0 && <span style={{background:C.amber700,color:C.white,borderRadius:20,padding:"1px 7px",fontSize:10,fontWeight:700,marginLeft:"auto"}}>{pendingProducts}</span>}
            </div>
          ))}
          <div style={{margin:"20px 16px 0",padding:14,background:C.stone50,borderRadius:10}}>
            <div style={{fontSize:12,color:C.gray500,fontWeight:600,marginBottom:8}}>Quick Stats</div>
            <div style={{fontSize:12,color:C.gray600,lineHeight:2}}>
              <div>💰 BHD {totalRevenue.toFixed(0)} Revenue</div>
              <div>📦 {orders.length} Orders</div>
              <div>✅ {approvedProducts} Active</div>
              <div>🔨 {auctions.length} Auctions</div>
            </div>
          </div>
        </div>
        <div style={{flex:1,padding:"32px 48px",maxWidth:"calc(100% - 230px)"}}>
          {loading?<div style={{textAlign:"center",padding:60}}><div style={{fontSize:18,fontWeight:700,color:C.orange}}>Loading...</div></div>:renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ArtisanDashboard;