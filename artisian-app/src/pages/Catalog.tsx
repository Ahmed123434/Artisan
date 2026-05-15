// frontend/src/pages/Catalog.tsx
import { useState, useEffect } from "react";

const C = {
  orange: "#D85A30", orangeLight: "#FAECE7", orangeBorder: "#F5C4B3",
  cream: "#FAF8F5", stone50: "#F1EFE8", stone800: "#2C2C2A",
  white: "#ffffff", gray100: "#F5F5F4", gray200: "#E7E5E4",
  gray300: "#D6D3D1", gray400: "#A8A29E", gray500: "#78716C",
  gray600: "#57534E", gray700: "#44403C",
  green50: "#F0FDF4", green800: "#166534",
  red50: "#FEF2F2", red500: "#EF4444",
  amber500: "#F59E0B",
};

const wrap: React.CSSProperties = { maxWidth: 1100, margin: "0 auto", padding: "0 40px" };
const card: React.CSSProperties = { background: C.white, borderRadius: 12, border: `1px solid ${C.gray200}`, padding: 0 };
const outlineBtn: React.CSSProperties = { border: `2px solid ${C.orange}`, color: C.orange, fontWeight: 700, background: C.white, borderRadius: 8, padding: "6px 14px", fontSize: 13, cursor: "pointer" };

const API = "http://localhost:5000/api";
const BASE = "http://localhost:5000";

interface Product { id: number; name: string; description: string; price: number; category: string; stock: number; artisan_name: string; image: string | null; }
interface Review { id: number; user_name: string; rating: number; comment: string; created_at: string; user_id: number; }

const categoriesList = ["All", "Pottery", "Textiles", "Jewelry", "Painting", "Woodwork"];
const sortOptions = ["Featured", "Price: Low to High", "Price: High to Low"];

const Stars: React.FC<{ rating: number; size?: number; onClick?: (r: number) => void }> = ({ rating, size = 16, onClick }) => (
  <div style={{ display: "flex", gap: 2 }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <span key={i} onClick={() => onClick?.(i)} style={{ fontSize: size, cursor: onClick ? "pointer" : "default", color: i <= rating ? C.amber500 : C.gray300 }}>★</span>
    ))}
  </div>
);

const Catalog: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCat, setActiveCat] = useState("All");
  const [sort, setSort] = useState("Featured");
  const [search, setSearch] = useState(new URLSearchParams(window.location.search).get("search") || "");
  const [cartItems, setCartItems] = useState<Record<number, number>>(() => { try { return JSON.parse(localStorage.getItem("cart") || "{}"); } catch { return {}; } });
  const [showCartMsg, setShowCartMsg] = useState("");
  const [outOfStockMsg, setOutOfStockMsg] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [wishlistMsg, setWishlistMsg] = useState("");

  const token = localStorage.getItem("token") || "";
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API}/products`);
        if (!res.ok) throw new Error("Failed to fetch");
        setProducts(await res.json());
      } catch (err: any) { setError(err.message); }
      finally { setLoading(false); }
    };
    fetchProducts();
  }, []);

  const fetchReviews = async (productId: number) => {
    try {
      const res = await fetch(`${API}/reviews/${productId}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews);
        setAvgRating(data.avg_rating);
        setReviewCount(data.count);
      }
    } catch (err) { console.error(err); }
  };

  const handleSelectProduct = (p: Product) => {
    setSelectedProduct(p);
    fetchReviews(p.id);
    setNewRating(0); setNewComment(""); setReviewError(""); setReviewSuccess("");
  };

  const handleAddReview = async () => {
    if (!token) { setReviewError("Please login to leave a review"); return; }
    if (newRating === 0) { setReviewError("Please select a rating"); return; }
    setReviewError("");
    try {
      const res = await fetch(`${API}/reviews/${selectedProduct?.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ rating: newRating, comment: newComment }),
      });
      const data = await res.json();
      if (res.ok) {
        setReviewSuccess("Review added!");
        setNewRating(0); setNewComment("");
        fetchReviews(selectedProduct!.id);
        setTimeout(() => setReviewSuccess(""), 3000);
      } else { setReviewError(data.message); }
    } catch (err) { setReviewError("Cannot connect to server"); }
  };

  const handleAddToWishlist = async (productId: number) => {
    if (!token) { setWishlistMsg("Please login first"); setTimeout(() => setWishlistMsg(""), 2000); return; }
    try {
      const res = await fetch(`${API}/wishlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ product_id: productId }),
      });
      const data = await res.json();
      setWishlistMsg(data.message);
      setTimeout(() => setWishlistMsg(""), 2000);
    } catch (err) { setWishlistMsg("Cannot connect to server"); setTimeout(() => setWishlistMsg(""), 2000); }
  };

  let filtered = products.filter((p) => {
    const matchCat = activeCat === "All" || p.category === activeCat;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.artisan_name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });
  if (sort === "Price: Low to High") filtered.sort((a, b) => a.price - b.price);
  if (sort === "Price: High to Low") filtered.sort((a, b) => b.price - a.price);

  const cartCount = Object.values(cartItems).reduce((s, q) => s + q, 0);

  const addToCart = (p: Product) => {
    if (Number(p.stock) === 0) {
      setOutOfStockMsg(`"${p.name}" is out of stock!`);
      setTimeout(() => setOutOfStockMsg(""), 3000);
      return;
    }
    setCartItems((prev) => { const updated = { ...prev, [p.id]: (prev[p.id] || 0) + 1 }; localStorage.setItem("cart", JSON.stringify(updated)); return updated; });
    setShowCartMsg(`${p.name} added!`);
    setTimeout(() => setShowCartMsg(""), 2000);
  };

  // Product Detail with Reviews & Wishlist
  if (selectedProduct) {
    const p = selectedProduct;
    return (
      <div style={{ background: C.cream, minHeight: "100vh" }}>
        {reviewSuccess && <div style={{ position: "fixed", top: 16, right: 16, background: C.green50, border: `1px solid ${C.green800}`, color: C.green800, padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, zIndex: 9999 }}>✓ {reviewSuccess}</div>}
        {wishlistMsg && <div style={{ position: "fixed", top: 16, right: 16, background: C.orangeLight, border: `1px solid ${C.orange}`, color: "#712B13", padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, zIndex: 9999 }}>♡ {wishlistMsg}</div>}
        {outOfStockMsg && <div style={{ position: "fixed", top: 16, right: 16, background: "#FEE2E2", border: "1px solid #EF4444", color: "#B91C1C", padding: "12px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, zIndex: 9999 }}>✕ {outOfStockMsg}</div>}
        <nav style={{ background: C.white, borderBottom: `0.5px solid ${C.gray200}` }}>
          <div style={{ ...wrap, display: "flex", alignItems: "center", padding: "16px 40px" }}>
            <a href="/" style={{ color: C.orange, fontWeight: 700, fontSize: 20, textDecoration: "none" }}>Artisan Co-op</a>
            <a href="/" style={{ marginLeft: 20, padding: "6px 16px", border: `1.5px solid ${C.orange}`, borderRadius: 20, color: C.orange, fontWeight: 600, fontSize: 13, textDecoration: "none" }}>Home</a>
            <div style={{ flex: 1 }} />
            <button onClick={() => setSelectedProduct(null)} style={{ ...outlineBtn, marginRight: 12 }}>← Back</button>
            <a href="/checkout" style={{ ...outlineBtn, textDecoration: "none" }}>Cart ({cartCount})</a>
          </div>
        </nav>
        <div style={{ ...wrap, padding: "32px 40px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
            <div>
              {p.image ? (
  <div style={{ position: "relative", overflow: "hidden", borderRadius: 12, height: 360, background: C.stone50 }}>
    <img
      src={`${BASE}${p.image}`}
      id="zoomImg"
      style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "zoom-in", transition: "transform 0.3s ease", transformOrigin: "center center" }}
      onClick={(e) => {
        const img = e.currentTarget;
        const current = img.style.transform;
        if (current === "scale(2)") {
          img.style.transform = "scale(1)";
          img.style.cursor = "zoom-in";
          img.style.objectFit = "cover";
        } else {
          img.style.transform = "scale(2)";
          img.style.cursor = "zoom-out";
          img.style.objectFit = "contain";
        }
      }}
      onWheel={(e) => {
        e.preventDefault();
        const img = e.currentTarget;
        const current = parseFloat(img.getAttribute("data-scale") || "1");
        const next = Math.min(3, Math.max(1, current + (e.deltaY < 0 ? 0.2 : -0.2)));
        img.setAttribute("data-scale", String(next));
        img.style.transform = `scale(${next})`;
        img.style.cursor = next > 1 ? "zoom-out" : "zoom-in";
        img.style.objectFit = next > 1 ? "contain" : "cover";
      }}
    />
    <div style={{ position: "absolute", bottom: 10, right: 10, background: "rgba(0,0,0,0.5)", color: C.white, fontSize: 11, padding: "4px 10px", borderRadius: 20 }}>
      🔍 Click or scroll to zoom
    </div>
  </div>
) : <div style={{ height: 360, background: C.orangeLight, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#712B13" }}>{p.category}</div>}
            </div>
            <div>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <span style={{ background: C.orangeLight, color: "#712B13", fontSize: 12, padding: "4px 12px", borderRadius: 20, fontWeight: 600 }}>{p.category}</span>
                <span style={{ background: p.stock > 0 ? C.green50 : C.red50, color: p.stock > 0 ? C.green800 : C.red500, fontSize: 12, padding: "4px 12px", borderRadius: 20, fontWeight: 600 }}>{p.stock > 0 ? `In Stock (${p.stock})` : "Out of Stock"}</span>
              </div>
              <h2 style={{ fontSize: 26, fontWeight: 700, color: C.gray700, margin: "0 0 8px" }}>{p.name}</h2>
              <p style={{ fontSize: 14, color: C.gray400, margin: "0 0 8px" }}>by <span style={{ color: C.orange, fontWeight: 600 }}>{p.artisan_name}</span></p>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Stars rating={Math.round(avgRating)} />
                <span style={{ fontSize: 13, color: C.gray500 }}>{Number(avgRating).toFixed(1)} ({reviewCount} reviews)</span>
              </div>
              <div style={{ fontSize: 32, fontWeight: 700, color: C.orange, margin: "16px 0" }}>BHD {Number(p.price).toFixed(2)}</div>
              <p style={{ fontSize: 14, color: C.gray500, lineHeight: 1.7, margin: "0 0 20px" }}>{p.description}</p>
              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={() => addToCart(p)} disabled={p.stock === 0} style={{ ...outlineBtn, flex: 1, padding: "12px 0", fontSize: 15, background: p.stock === 0 ? C.gray300 : C.orange, color: C.white, border: `2px solid ${p.stock === 0 ? C.gray300 : C.orange}`, cursor: p.stock === 0 ? "not-allowed" : "pointer" }}>{p.stock === 0 ? "Out of Stock" : "Add to cart"}</button>
                <button onClick={() => handleAddToWishlist(p.id)} style={{ ...outlineBtn, padding: "12px 20px", fontSize: 20 }}>♡</button>
                <a href={`/chat?user=${p.artisan_name}`} style={{ ...outlineBtn, padding: "12px 20px", fontSize: 14, textDecoration: "none" }}>Chat</a>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div style={{ marginTop: 40 }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: C.gray700, marginBottom: 20 }}>Customer Reviews ({reviewCount})</h3>
            <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.gray200}`, padding: 24, marginBottom: 24 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.orange, marginBottom: 12 }}>Write a Review</div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 13, color: C.gray600, marginBottom: 6 }}>Your Rating</div>
                <Stars rating={newRating} size={28} onClick={(r) => setNewRating(r)} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Share your experience..." rows={3} style={{ width: "100%", border: `1px solid ${C.gray300}`, borderRadius: 8, padding: "9px 12px", fontSize: 13, color: C.stone800, background: C.white, boxSizing: "border-box", outline: "none", resize: "none" as const, fontFamily: "inherit" }} />
              </div>
              {reviewError && <div style={{ fontSize: 12, color: C.red500, marginBottom: 8 }}>✕ {reviewError}</div>}
              <button onClick={handleAddReview} style={{ ...outlineBtn, background: C.orange, color: C.white, border: `2px solid ${C.orange}`, padding: "10px 24px" }}>Submit Review</button>
            </div>
            {reviews.length === 0 ? (
              <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.gray200}`, padding: 40, textAlign: "center" }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>⭐</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.gray700, marginBottom: 8 }}>No reviews yet</div>
                <div style={{ fontSize: 13, color: C.gray400 }}>Be the first to review!</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {reviews.map((r) => (
                  <div key={r.id} style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.gray200}`, padding: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.orangeLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#712B13" }}>{r.user_name.charAt(0)}</div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: C.gray700 }}>{r.user_name}</div>
                          <div style={{ fontSize: 11, color: C.gray400 }}>{new Date(r.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <Stars rating={r.rating} size={14} />
                    </div>
                    {r.comment && <div style={{ fontSize: 13, color: C.gray600, lineHeight: 1.6 }}>{r.comment}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Catalog Grid View
  return (
    <div style={{ background: C.cream, minHeight: "100vh" }}>
      {outOfStockMsg && <div style={{ position: "fixed", top: 16, right: 16, background: "#FEE2E2", border: "1px solid #EF4444", color: "#B91C1C", padding: "12px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, zIndex: 9999 }}>✕ {outOfStockMsg}</div>}
      {showCartMsg && <div style={{ position: "fixed", top: 16, right: 16, background: C.green50, border: `1px solid ${C.green800}`, color: C.green800, padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, zIndex: 9999 }}>✓ {showCartMsg}</div>}
      {wishlistMsg && <div style={{ position: "fixed", top: 16, right: 16, background: C.orangeLight, border: `1px solid ${C.orange}`, color: "#712B13", padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, zIndex: 9999 }}>♡ {wishlistMsg}</div>}
      <nav style={{ background: C.white, borderBottom: `0.5px solid ${C.gray200}` }}>
        <div style={{ ...wrap, display: "flex", alignItems: "center", padding: "16px 40px" }}>
          <a href="/" style={{ color: C.orange, fontWeight: 700, fontSize: 20, textDecoration: "none" }}>Artisan Co-op</a>
          <a href="/" style={{ marginLeft: 20, padding: "6px 16px", border: `1.5px solid ${C.orange}`, borderRadius: 20, color: C.orange, fontWeight: 600, fontSize: 13, textDecoration: "none" }}>Home</a>
          <div style={{ flex: 1, margin: "0 20px" }}><input type="text" placeholder="Search products, artisans..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: "100%", border: `1px solid ${C.gray300}`, borderRadius: 8, padding: "8px 14px", fontSize: 13, color: C.stone800, background: C.white, outline: "none", boxSizing: "border-box" as const }} /></div>
          <a href="/wishlist" style={{ ...outlineBtn, marginRight: 8, textDecoration: "none", fontSize: 16 }}>♡</a>
          <a href="/checkout" style={{ ...outlineBtn, textDecoration: "none" }}>Cart ({cartCount})</a>
        </div>
      </nav>
      <div style={{ background: C.white, borderBottom: `0.5px solid ${C.gray200}` }}>
        <div style={{ ...wrap, display: "flex", gap: 8, padding: "12px 40px", flexWrap: "wrap" as const, alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
            {categoriesList.map((c) => (<button key={c} onClick={() => setActiveCat(c)} style={{ padding: "6px 16px", borderRadius: 20, fontSize: 13, cursor: "pointer", border: `1.5px solid ${activeCat === c ? C.orange : C.gray300}`, background: activeCat === c ? C.orangeLight : C.white, color: activeCat === c ? C.orange : C.gray600, fontWeight: activeCat === c ? 700 : 400 }}>{c}</button>))}
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ fontSize: 12, color: C.gray500, border: `1px solid ${C.gray300}`, borderRadius: 8, padding: "6px 12px", background: C.white, outline: "none", cursor: "pointer" }}>{sortOptions.map((s) => <option key={s} value={s}>{s === "Featured" ? "Sort: Featured" : s}</option>)}</select>
        </div>
      </div>
      <div style={{ ...wrap, padding: "20px 40px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.gray700 }}>{activeCat === "All" ? "All products" : activeCat}</div>
          <span style={{ fontSize: 13, color: C.gray400 }}>{loading ? "Loading..." : `${filtered.length} products found`}</span>
        </div>
      </div>
      <div style={{ ...wrap, padding: "16px 40px 40px" }}>
        {loading && <div style={{ textAlign: "center", padding: 60 }}><div style={{ fontSize: 18, fontWeight: 700, color: C.orange }}>Loading...</div></div>}
        {error && <div style={{ textAlign: "center", padding: 60 }}><div style={{ fontSize: 18, fontWeight: 700, color: C.red500 }}>Error: {error}</div></div>}
        {!loading && !error && filtered.length === 0 && <div style={{ textAlign: "center", padding: 60 }}><div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div><div style={{ fontSize: 18, fontWeight: 700, color: C.gray700 }}>No products found</div></div>}
        {!loading && !error && filtered.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {filtered.map((p) => (
              <div key={p.id} style={{ ...card, overflow: "hidden", position: "relative" }}>
                <button onClick={(e) => { e.stopPropagation(); handleAddToWishlist(p.id); }} style={{ position: "absolute", top: 10, right: 10, width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: "none", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>♡</button>
                <div onClick={() => handleSelectProduct(p)} style={{ cursor: "pointer" }}>
                  {p.image ? (
  <div style={{ height: 200, background: C.stone50, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
    <img src={`${BASE}${p.image}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
  </div>
) : <div style={{ height: 200, background: C.stone50, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: C.gray500 }}>{p.category}</div>}
                </div>
                <div style={{ padding: 16 }}>
                  <p onClick={() => handleSelectProduct(p)} style={{ fontSize: 15, fontWeight: 700, color: C.gray700, margin: "0 0 4px", cursor: "pointer" }}>{p.name}</p>
                  <p style={{ fontSize: 13, color: C.gray400, margin: "0 0 8px" }}>by {p.artisan_name}</p>
                  <p style={{ fontSize: 11, color: Number(p.stock) > 0 ? C.green800 : "#B91C1C", margin: "0 0 4px" }}>{Number(p.stock) > 0 ? `${p.stock} pieces available` : "Out of stock"}</p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: C.orange }}>BHD {Number(p.price).toFixed(2)}</span>
                    <button onClick={(e) => { e.stopPropagation(); addToCart(p); }} disabled={Number(p.stock) <= 0} style={{ ...outlineBtn, fontSize: 12, padding: "5px 12px", opacity: Number(p.stock) <= 0 ? 0.5 : 1, cursor: Number(p.stock) <= 0 ? "not-allowed" : "pointer" }}>{Number(p.stock) <= 0 ? "Out of Stock" : "Add to cart"}</button>
                  </div>
                  {cartItems[p.id] && <div style={{ marginTop: 8, fontSize: 11, color: C.green800, background: C.green50, padding: "4px 8px", borderRadius: 6, textAlign: "center", fontWeight: 600 }}>{cartItems[p.id]} {cartItems[p.id] === 1 ? "piece" : "pieces"} in cart</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog;