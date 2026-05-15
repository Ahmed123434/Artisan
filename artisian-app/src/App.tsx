import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Catalog from './pages/Catalog';
import Checkout from './pages/Checkout';
import Auctions from './pages/Auctions';
import AuctionDetail from './pages/AuctionDetail';
import ArtisanDashboard from './pages/Artisandashboard';
import AdminDashboard from './pages/Admindashboard';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import Notifications from './pages/Notifications';
import Chat from './pages/Chat';

function App() {
  return (
    <BrowserRouter>
      <nav style={{
        display: "flex",
        gap: 10,
        padding: "10px 20px",
        flexWrap: "wrap",
        justifyContent: "center",
        background: "#ffffff",
        borderBottom: "1px solid #E7E5E4",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}>
        {[
          { to: "/", label: "Home" },
          { to: "/catalog", label: "Catalog" },
          { to: "/login", label: "Login" },
          { to: "/checkout", label: "Checkout" },
          { to: "/auctions", label: "Auctions" },
          { to: "/wishlist", label: " Wishlist" },
          { to: "/notifications", label: " Notifications" },
          { to: "/chat", label: " Chat" },
          { to: "/profile", label: "Profile" },
          { to: "/artisan", label: "Artisan Dashboard" },
          { to: "/admin", label: "Admin Dashboard" },
        ].map((link) => (
          <Link
            key={link.to}
            to={link.to}
            style={{
              padding: "5px 14px",
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 700,
              border: "2px solid #D85A30",
              color: "#D85A30",
              background: "#ffffff",
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/login" element={<Login />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/auctions" element={<Auctions />} />
        <Route path="/auction-detail" element={<AuctionDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/artisan" element={<ArtisanDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;