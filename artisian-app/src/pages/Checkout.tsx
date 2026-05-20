// frontend/src/pages/Checkout.tsx
import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationPicker: React.FC<{ setCity: (c: string) => void; setAddressDetails: (a: any) => void }> = ({ setCity, setAddressDetails }) => {
  const [position, setPosition] = useState<[number, number] | null>(null);
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      setAddressDetails(`Lat: ${e.latlng.lat.toFixed(4)}, Lng: ${e.latlng.lng.toFixed(4)}`);
      setCity("Bahrain");
    },
  });
  return position ? <Marker position={position} /> : null;
};
const C = {
  orange: "#D85A30", 
  orangeLight: "#FAECE7", 
  orangeBorder: "#F5C4B3",
  cream: "#FAF8F5", 
  stone50: "#F1EFE8", 
  stone800: "#2C2C2A",
  white: "#ffffff", 
  gray100: "#F5F5F4", 
  gray200: "#E7E5E4",
  gray300: "#D6D3D1", 
  gray400: "#A8A29E", 
  gray500: "#78716C",
  gray600: "#57534E", 
  gray700: "#44403C",
  red50: "#FEF2F2", 
  red500: "#EF4444",
  green50: "#F0FDF4", 
  green800: "#166534",
};

const wrap: React.CSSProperties = { maxWidth: 1100, margin: "0 auto", padding: "0 40px" };
const card: React.CSSProperties = { background: C.white, borderRadius: 12, border: `1px solid ${C.gray200}`, padding: 16 };
const orangeBtn: React.CSSProperties = { 
  border: `2px solid ${C.orange}`, 
  color: C.orange, 
  fontWeight: 700, 
  background: C.white, 
  borderRadius: 8, 
  padding: "12px 0", 
  fontSize: 15, 
  cursor: "pointer", 
  width: "100%" 
};
const outlineBtn: React.CSSProperties = { 
  border: `2px solid ${C.orange}`, 
  color: C.orange, 
  fontWeight: 700, 
  background: C.white, 
  borderRadius: 8, 
  padding: "6px 14px", 
  fontSize: 13, 
  cursor: "pointer" 
};
const inputBase: React.CSSProperties = { 
  width: "100%", 
  border: `1px solid ${C.gray300}`, 
  borderRadius: 8, 
  padding: "9px 12px", 
  fontSize: 13, 
  color: C.stone800, 
  background: C.white, 
  boxSizing: "border-box", 
  outline: "none" 
};
const inputErr: React.CSSProperties = { 
  width: "100%", 
  border: `1px solid ${C.red500}`, 
  borderRadius: 8, 
  padding: "9px 12px", 
  fontSize: 13, 
  color: C.stone800, 
  background: C.white, 
  boxSizing: "border-box", 
  outline: "none" 
};
const labelStyle: React.CSSProperties = { 
  display: "block", 
  fontSize: 12, 
  color: C.gray600, 
  fontWeight: 500, 
  marginBottom: 5 
};
const errText: React.CSSProperties = { 
  fontSize: 11, 
  color: C.red500, 
  marginTop: 3 
};

const API = "https://artisan-backend-gbby.onrender.com/api";

interface Product { 
  id: number; 
  name: string; 
  price: number; 
  category: string; 
  artisan_name: string; 
  description: string; 
  stock: number; 
}

interface CartItem { 
  product: Product; 
  qty: number; 
}

interface AddressDetails {
  buildingNumber: string;
  streetName: string;
  block: string;
  road: string;
  avenue: string;
  houseNumber: string;
  apartmentNumber: string;
  floorNumber: string;
  additionalDirections: string;
}

const steps = ["Cart", "Checkout", "Payment", "Confirmation"];

// Phone validation function
const validatePhoneNumber = (phone: string): boolean => {
  const cleanPhone = phone.replace(/[\s\-+]/g, '');
  const bahrainRegex = /^(973)?\d{8}$/;
  
  if (!bahrainRegex.test(cleanPhone)) {
    return false;
  }
  
  return cleanPhone.length === 8 || cleanPhone.length === 11;
};

// MapLoader component
interface MapLoaderProps {
  mapRef: React.RefObject<HTMLDivElement>;
  mapInstanceRef: React.MutableRefObject<any>;
  markerRef: React.MutableRefObject<any>;
  setAddressDetails: React.Dispatch<React.SetStateAction<AddressDetails>>;
  setCity: (city: string) => void;
}

const MapLoader: React.FC<MapLoaderProps> = ({ 
  mapRef, 
  mapInstanceRef, 
  markerRef, 
  setAddressDetails, 
  setCity 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current || isLoaded) return;

    const loadMap = async () => {
      if ((window as any).L && (window as any).L.map) {
        initMap((window as any).L);
        return;
      }

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);

      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => {
        initMap((window as any).L);
      };
      script.onerror = () => {
        console.error("Failed to load Leaflet");
      };
      document.head.appendChild(script);
    };

    const initMap = (L: any) => {
      if (!mapRef.current) return;
      
      const map = L.map(mapRef.current).setView([26.2235, 50.5876], 12);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors"
      }).addTo(map);
      
      mapInstanceRef.current = map;
      setIsLoaded(true);

      map.on("click", async (e: any) => {
        const { lat, lng } = e.latlng;
        if (markerRef.current) {
          markerRef.current.remove();
        }
        markerRef.current = L.marker([lat, lng]).addTo(map);
        
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`);
          const data = await res.json();
          
          const address = data.address || {};
          
          setAddressDetails({
            buildingNumber: address.building || address.house_number || "",
            streetName: address.road || address.street || "",
            block: address.suburb || address.neighbourhood || address.quarter || "",
            road: address.road || "",
            avenue: address.avenue || "",
            houseNumber: address.house_number || "",
            apartmentNumber: address.apartment || address.unit || "",
            floorNumber: address.floor || "",
            additionalDirections: ""
          });
          
          setCity(address.city || address.town || address.state || "Manama");
        } catch (err) {
          console.error("Reverse geocoding error:", err);
        }
      });
    };

    loadMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapRef, mapInstanceRef, markerRef, setAddressDetails, setCity, isLoaded]);

  return null;
};

const Checkout: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [orderLoading, setOrderLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentMethod, setPaymentMethod] = useState<string>("Credit card");
  const [orderId, setOrderId] = useState<number | null>(null);
  const [orderTotal, setOrderTotal] = useState<number>(0);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  
  const [addressDetails, setAddressDetails] = useState<AddressDetails>({
    buildingNumber: "",
    streetName: "",
    block: "",
    road: "",
    avenue: "",
    houseNumber: "",
    apartmentNumber: "",
    floorNumber: "",
    additionalDirections: ""
  });
  
  const [city, setCity] = useState("Manama");
  const [country, setCountry] = useState("Bahrain");
  const [phone, setPhone] = useState("");

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");

  const token = localStorage.getItem("token") || "";
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const headers = { "Content-Type": "application/json", "Authorization": `Bearer ${token}` };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API}/products`);
        const data = await res.json();
        setProducts(data);
        const savedCart = JSON.parse(localStorage.getItem("cart") || "{}");
        const cartItems: CartItem[] = [];
        for (const [id, qty] of Object.entries(savedCart)) {
          const product = data.find((p: Product) => p.id === Number(id));
          if (product) cartItems.push({ product, qty: Number(qty) });
        }
        setCart(cartItems);
      } catch (err) { 
        console.error(err); 
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const shippingCost = cart.length === 0 ? 0 : subtotal > 50 ? 0 : 2;
  const tax = subtotal * 0.1;
  const total = subtotal + shippingCost + tax;

  const getFullAddress = (): string => {
    const parts = [];
    if (addressDetails.buildingNumber) parts.push(`Building: ${addressDetails.buildingNumber}`);
    if (addressDetails.houseNumber) parts.push(`House: ${addressDetails.houseNumber}`);
    if (addressDetails.streetName) parts.push(`Street: ${addressDetails.streetName}`);
    if (addressDetails.road) parts.push(`Road: ${addressDetails.road}`);
    if (addressDetails.avenue) parts.push(`Avenue: ${addressDetails.avenue}`);
    if (addressDetails.block) parts.push(`Block: ${addressDetails.block}`);
    if (addressDetails.apartmentNumber) parts.push(`Apt: ${addressDetails.apartmentNumber}`);
    if (addressDetails.floorNumber) parts.push(`Floor: ${addressDetails.floorNumber}`);
    if (addressDetails.additionalDirections) parts.push(`Directions: ${addressDetails.additionalDirections}`);
    
    return parts.join(", ");
  };

  const updateQty = (id: number, delta: number) => { 
    const updated = cart.map((item) => 
      item.product.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
    ); 
    setCart(updated); 
    const cartStorage: Record<number, number> = {}; 
    updated.forEach(item => { 
      cartStorage[item.product.id] = item.qty; 
    }); 
    localStorage.setItem("cart", JSON.stringify(cartStorage)); 
  };
  
  const removeItem = (id: number) => { 
    const updated = cart.filter((item) => item.product.id !== id); 
    setCart(updated); 
    const cartStorage: Record<number, number> = {}; 
    updated.forEach(item => { 
      cartStorage[item.product.id] = item.qty; 
    }); 
    localStorage.setItem("cart", JSON.stringify(cartStorage)); 
  };
  
  const addToCart = (product: Product) => {
    const existing = cart.find((item) => item.product.id === product.id);
    if (existing) updateQty(product.id, 1);
    else setCart([...cart, { product, qty: 1 }]);
  };

  const validateShipping = (): boolean => {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = "Required";
    if (!lastName.trim()) e.lastName = "Required";
    if (!addressDetails.streetName.trim() && !addressDetails.road.trim()) e.streetName = "Street or Road is required";
    if (!phone.trim()) {
      e.phone = "Required";
    } else if (!validatePhoneNumber(phone)) {
      e.phone = "Must be 8 digits (e.g., 33445566)";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validatePayment = (): boolean => {
    const e: Record<string, string> = {};
    if (!cardNumber.trim()) e.cardNumber = "Required";
    if (!expiry.trim()) e.expiry = "Required";
    if (!cvv.trim()) e.cvv = "Required";
    if (!cardName.trim()) e.cardName = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = async () => {
    if (currentStep === 0 && cart.length === 0) return;
    if (currentStep === 1 && !validateShipping()) return;
    if (currentStep === 2) {
      if (!validatePayment()) return;
      setOrderLoading(true);
      try {
        const res = await fetch(`${API}/orders`, {
          method: "POST", 
          headers,
          body: JSON.stringify({
            items: cart.map((item) => ({ product_id: item.product.id, quantity: item.qty })),
            shipping_address: `${firstName} ${lastName}, ${getFullAddress()}`,
            city, country, phone, payment_method: paymentMethod,
          }),
        });
        const data = await res.json();
        if (res.ok) { 
          setOrderId(data.orderId); 
          setOrderTotal(data.total); 
          setCurrentStep(3); 
          localStorage.removeItem("cart");
        }
        else setErrors({ api: data.message || "Failed to place order" });
      } catch (err) { 
        setErrors({ api: "Cannot connect to server" }); 
      }
      setOrderLoading(false);
      return;
    }
    setErrors({});
    setCurrentStep(currentStep + 1);
  };

  if (!token) {
    return (
      <div style={{ background: C.cream, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ ...card, padding: 40, textAlign: "center", maxWidth: 400 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.gray700, marginBottom: 8 }}>Please Login First</div>
          <div style={{ fontSize: 14, color: C.gray400 }}>You need to be logged in to checkout.</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: C.cream, minHeight: "100vh" }}>
      <nav style={{ background: C.white, borderBottom: `0.5px solid ${C.gray200}` }}>
        <div style={{ ...wrap, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 40px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <a href="/" style={{ color: C.orange, fontWeight: 700, fontSize: 20, textDecoration: "none" }}>Artisan Co-op</a>
            <a href="/" style={{ padding: "6px 16px", border: `1.5px solid ${C.orange}`, borderRadius: 20, color: C.orange, fontWeight: 600, fontSize: 13, textDecoration: "none" }}>Home</a>
          </div>
          <span style={{ fontSize: 14, color: C.orange }}>{user.name}</span>
        </div>
      </nav>

      <div style={{ ...wrap, padding: "24px 40px" }}>
        {/* Step Indicator */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 32 }}>
          {steps.map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ 
                width: 28, height: 28, borderRadius: "50%", display: "flex", 
                alignItems: "center", justifyContent: "center", fontSize: 12, 
                fontWeight: 700, 
                background: i < currentStep ? C.orange : i === currentStep ? C.orangeLight : C.stone50, 
                border: i === currentStep ? `2px solid ${C.orange}` : i > currentStep ? `1px solid ${C.gray300}` : "none", 
                color: i < currentStep ? C.white : i === currentStep ? C.orange : C.gray400 
              }}>
                {i < currentStep ? "✓" : i + 1}
              </div>
              <span style={{ fontSize: 13, color: i <= currentStep ? C.orange : C.gray400, fontWeight: i <= currentStep ? 700 : 400 }}>
                {s}
              </span>
              {i < steps.length - 1 && <div style={{ width: 40, height: 1, margin: "0 8px", background: i < currentStep ? C.orange : C.gray300 }} />}
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.orange }}>Loading...</div>
          </div>
        ) : (
          <>
            {/* STEP 0: Cart */}
            {currentStep === 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: C.gray700, marginBottom: 16 }}>
                    Shopping Cart ({cart.length} items)
                  </div>
                  {cart.length === 0 ? (
                    <div style={{ ...card, padding: 40, textAlign: "center" }}>
                      <div style={{ fontSize: 48, marginBottom: 12 }}>🛒</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: C.gray700 }}>Your cart is empty</div>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.product.id} style={{ ...card, display: "flex", alignItems: "center", gap: 16, padding: 16, marginBottom: 12 }}>
                        <div style={{ width: 60, height: 60, background: C.orangeLight, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#712B13", flexShrink: 0 }}>
                          {item.product.category}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 15, fontWeight: 700, color: C.gray700 }}>{item.product.name}</div>
                          <div style={{ fontSize: 13, color: C.gray400 }}>by {item.product.artisan_name}</div>
                          <div style={{ fontSize: 16, fontWeight: 700, color: C.orange, marginTop: 4 }}>
                            BHD {Number(item.product.price).toFixed(2)}
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <button 
                            onClick={() => updateQty(item.product.id, -1)} 
                            style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${C.gray300}`, background: C.white, cursor: "pointer", fontSize: 14 }}
                          >
                            −
                          </button>
                          <span style={{ fontSize: 15, fontWeight: 700, width: 20, textAlign: "center" }}>{item.qty}</span>
                          <button 
                            onClick={() => updateQty(item.product.id, 1)} 
                            style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${C.gray300}`, background: C.white, cursor: "pointer", fontSize: 14 }}
                          >
                            +
                          </button>
                        </div>
                        <button 
                          onClick={() => removeItem(item.product.id)} 
                          style={{ fontSize: 12, color: C.red500, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  )}
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.gray700, marginTop: 24, marginBottom: 12 }}>
                    Add more products
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                    {products.filter((p) => !cart.find((c) => c.product.id === p.id)).slice(0, 4).map((p) => (
                      <div key={p.id} style={{ ...card, padding: 12, cursor: "pointer" }} onClick={() => addToCart(p)}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.gray700 }}>{p.name}</div>
                        <div style={{ fontSize: 12, color: C.gray400 }}>by {p.artisan_name}</div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: C.orange }}>BHD {Number(p.price).toFixed(2)}</span>
                          <span style={{ fontSize: 11, color: C.orange, fontWeight: 700 }}>+ Add</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Order Summary */}
                <div style={{ ...card, alignSelf: "start" }}>
                  <div style={{ fontSize: 17, fontWeight: 700, color: C.gray700, borderBottom: `1px solid ${C.gray200}`, paddingBottom: 10, marginBottom: 18 }}>
                    Order summary
                  </div>
                  {cart.map((item) => (
                    <div key={item.product.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: `0.5px solid ${C.stone50}` }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.gray700 }}>{item.product.name}</div>
                        <div style={{ fontSize: 13, color: C.gray400 }}>×{item.qty}</div>
                      </div>
                      <span style={{ fontSize: 16, fontWeight: 700, color: C.orange }}>
                        BHD {(item.product.price * item.qty).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div style={{ marginTop: 18 }}>
                    {[
                      ["Subtotal", `BHD ${subtotal.toFixed(2)}`], 
                      ["Shipping", shippingCost === 0 ? "FREE" : `BHD ${shippingCost.toFixed(2)}`], 
                      ["Tax (10%)", `BHD ${tax.toFixed(2)}`]
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: C.gray600, padding: "7px 0" }}>
                        <span>{k}</span>
                        <span>{v}</span>
                      </div>
                    ))}
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 17, fontWeight: 700, color: C.gray700, borderTop: `1px solid ${C.gray200}`, paddingTop: 12, marginTop: 8 }}>
                      <span>Total</span>
                      <span style={{ color: C.orange }}>BHD {total.toFixed(2)}</span>
                    </div>
                  </div>
                  <button onClick={handleNext} style={{ ...orangeBtn, marginTop: 18, fontSize: 17 }}>
                    Proceed to checkout →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 1: Shipping with Detailed Address */}
            {currentStep === 1 && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
                <div>
                  {/* Map */}
                  <div style={{ ...card, padding: 16, marginBottom: 16 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.gray700, marginBottom: 8 }}>
                      📍 Pin your location on the map
                    </div>
                    <div style={{ fontSize: 12, color: C.gray400, marginBottom: 10 }}>
                      Click anywhere on the map to set your delivery location
                    </div>
                    <MapContainer center={[26.2235, 50.5876]} zoom={12} style={{ height: 280, borderRadius: 8, border: `1px solid ${C.gray200}` }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <LocationPicker setCity={setCity} setAddressDetails={setAddressDetails} />
                    </MapContainer>
                  </div>
                   
                  
                  <div style={{ ...card, padding: 24 }}>
                    <div style={{ fontSize: 17, fontWeight: 700, color: C.gray700, borderBottom: `1px solid ${C.gray200}`, paddingBottom: 10, marginBottom: 18 }}>
                      Shipping Address Details
                    </div>
                    
                    {/* Personal Information */}
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: C.gray600, marginBottom: 12 }}>Personal Information</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                        <div style={{ marginBottom: 14 }}>
                          <label style={labelStyle}>First name *</label>
                          <input 
                            value={firstName} 
                            onChange={(e) => { setFirstName(e.target.value); setErrors({ ...errors, firstName: "" }); }} 
                            placeholder="Ahmed" 
                            style={errors.firstName ? inputErr : inputBase} 
                          />
                          {errors.firstName && <div style={errText}>{errors.firstName}</div>}
                        </div>
                        <div style={{ marginBottom: 14 }}>
                          <label style={labelStyle}>Last name *</label>
                          <input 
                            value={lastName} 
                            onChange={(e) => { setLastName(e.target.value); setErrors({ ...errors, lastName: "" }); }} 
                            placeholder="Hassan" 
                            style={errors.lastName ? inputErr : inputBase} 
                          />
                          {errors.lastName && <div style={errText}>{errors.lastName}</div>}
                        </div>
                      </div>
                    </div>

                    {/* Address Details */}
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: C.gray600, marginBottom: 12 }}>Address Details</div>
                      
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                        <div>
                          <label style={labelStyle}>Building Number</label>
                          <input 
                            value={addressDetails.buildingNumber} 
                            onChange={(e) => setAddressDetails({ ...addressDetails, buildingNumber: e.target.value })} 
                            placeholder="Building No." 
                            style={inputBase} 
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>House Number</label>
                          <input 
                            value={addressDetails.houseNumber} 
                            onChange={(e) => setAddressDetails({ ...addressDetails, houseNumber: e.target.value })} 
                            placeholder="House No." 
                            style={inputBase} 
                          />
                        </div>
                      </div>

                      <div style={{ marginBottom: 14 }}>
                        <label style={labelStyle}>Street Name *</label>
                        <input 
                          value={addressDetails.streetName} 
                          onChange={(e) => { setAddressDetails({ ...addressDetails, streetName: e.target.value }); setErrors({ ...errors, streetName: "" }); }} 
                          placeholder="Street name" 
                          style={errors.streetName ? inputErr : inputBase} 
                        />
                        {errors.streetName && <div style={errText}>{errors.streetName}</div>}
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                        <div>
                          <label style={labelStyle}>Road</label>
                          <input 
                            value={addressDetails.road} 
                            onChange={(e) => setAddressDetails({ ...addressDetails, road: e.target.value })} 
                            placeholder="Road name" 
                            style={inputBase} 
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>Avenue</label>
                          <input 
                            value={addressDetails.avenue} 
                            onChange={(e) => setAddressDetails({ ...addressDetails, avenue: e.target.value })} 
                            placeholder="Avenue" 
                            style={inputBase} 
                          />
                        </div>
                      </div>

                      <div style={{ marginBottom: 14 }}>
                        <label style={labelStyle}>Block</label>
                        <input 
                          value={addressDetails.block} 
                          onChange={(e) => setAddressDetails({ ...addressDetails, block: e.target.value })} 
                          placeholder="Block number" 
                          style={inputBase} 
                        />
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                        <div>
                          <label style={labelStyle}>Apartment / Suite</label>
                          <input 
                            value={addressDetails.apartmentNumber} 
                            onChange={(e) => setAddressDetails({ ...addressDetails, apartmentNumber: e.target.value })} 
                            placeholder="Apt / Suite No." 
                            style={inputBase} 
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>Floor Number</label>
                          <input 
                            value={addressDetails.floorNumber} 
                            onChange={(e) => setAddressDetails({ ...addressDetails, floorNumber: e.target.value })} 
                            placeholder="Floor No." 
                            style={inputBase} 
                          />
                        </div>
                      </div>

                      <div style={{ marginBottom: 14 }}>
                        <label style={labelStyle}>Additional Directions (Optional)</label>
                        <textarea 
                          value={addressDetails.additionalDirections} 
                          onChange={(e) => setAddressDetails({ ...addressDetails, additionalDirections: e.target.value })} 
                          placeholder="Nearby landmarks, special instructions, etc." 
                          style={{ ...inputBase, minHeight: 60, resize: "vertical" }} 
                        />
                      </div>
                    </div>

                    {/* Location Details */}
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: C.gray600, marginBottom: 12 }}>Location</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                        <div>
                          <label style={labelStyle}>City *</label>
                          <input value={city} onChange={(e) => setCity(e.target.value)} style={inputBase} />
                        </div>
                        <div>
                          <label style={labelStyle}>Country</label>
                          <input value={country} onChange={(e) => setCountry(e.target.value)} style={inputBase} />
                        </div>
                      </div>
                    </div>

                    <div style={{ marginBottom: 14 }}>
                      <label style={labelStyle}>Phone number *</label>
                      <input 
                        value={phone} 
                        onChange={(e) => { 
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          if (value.length <= 11) {
                            setPhone(value); 
                            setErrors({ ...errors, phone: "" });
                          }
                        }} 
                        placeholder="33445566" 
                        style={errors.phone ? inputErr : inputBase} 
                      />
                      {errors.phone && <div style={errText}>{errors.phone}</div>}
                      {phone && phone.length > 0 && phone.length !== 8 && phone.length !== 11 && !errors.phone && (
                        <div style={errText}>Phone must be 8 digits (e.g., 33445566)</div>
                      )}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => { setCurrentStep(0); setErrors({}); }} 
                    style={{ ...outlineBtn, padding: "10px 24px", marginTop: 16 }}
                  >
                    ← Back to cart
                  </button>
                </div>
                
                <div style={{ ...card, alignSelf: "start" }}>
                  <div style={{ fontSize: 17, fontWeight: 700, color: C.gray700, borderBottom: `1px solid ${C.gray200}`, paddingBottom: 10, marginBottom: 18 }}>
                    Order summary
                  </div>
                  {cart.map((item) => (
                    <div key={item.product.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `0.5px solid ${C.stone50}`, fontSize: 13 }}>
                      <span style={{ color: C.gray700 }}>{item.product.name} ×{item.qty}</span>
                      <span style={{ fontWeight: 700, color: C.orange }}>BHD {(item.product.price * item.qty).toFixed(2)}</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 17, fontWeight: 700, color: C.gray700, borderTop: `1px solid ${C.gray200}`, paddingTop: 12, marginTop: 12 }}>
                    <span>Total</span>
                    <span style={{ color: C.orange }}>BHD {total.toFixed(2)}</span>
                  </div>
                  
                  {/* Preview Address */}
                  {getFullAddress() && (
                    <div style={{ marginTop: 16, padding: 12, background: C.stone50, borderRadius: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.gray600, marginBottom: 6 }}>Address Preview:</div>
                      <div style={{ fontSize: 12, color: C.gray700, lineHeight: 1.5 }}>
                        {firstName} {lastName}<br />
                        {getFullAddress()}<br />
                        {city}, {country}<br />
                        {phone}
                      </div>
                    </div>
                  )}
                  
                  <button onClick={handleNext} style={{ ...orangeBtn, marginTop: 18, fontSize: 17 }}>
                    Continue to payment →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Payment */}
            {currentStep === 2 && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
                <div>
                  <div style={{ ...card, padding: 24 }}>
                    <div style={{ fontSize: 17, fontWeight: 700, color: C.gray700, borderBottom: `1px solid ${C.gray200}`, paddingBottom: 10, marginBottom: 18 }}>
                      Payment method
                    </div>
                    <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
                      {["Credit card", "Debit card", "PayPal"].map((m) => (
                        <button 
                          key={m} 
                          onClick={() => setPaymentMethod(m)} 
                          style={{ 
                            flex: 1, padding: "9px 0", borderRadius: 8, fontSize: 13, 
                            fontWeight: 600, cursor: "pointer", 
                            border: `1px solid ${paymentMethod === m ? C.orange : C.gray300}`, 
                            background: paymentMethod === m ? C.orangeLight : C.white, 
                            color: paymentMethod === m ? "#712B13" : C.gray500 
                          }}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                    <div style={{ marginBottom: 14 }}>
                      <label style={labelStyle}>Card number</label>
                      <input 
                        value={cardNumber} 
                        onChange={(e) => { setCardNumber(e.target.value); setErrors({ ...errors, cardNumber: "" }); }} 
                        placeholder="XXXX XXXX XXXX XXXX" 
                        style={errors.cardNumber ? inputErr : inputBase} 
                      />
                      {errors.cardNumber && <div style={errText}>{errors.cardNumber}</div>}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                      <div style={{ marginBottom: 14 }}>
                        <label style={labelStyle}>Expiry date</label>
                        <input 
                          value={expiry} 
                          onChange={(e) => { setExpiry(e.target.value); setErrors({ ...errors, expiry: "" }); }} 
                          placeholder="MM/YY" 
                          style={errors.expiry ? inputErr : inputBase} 
                        />
                        {errors.expiry && <div style={errText}>{errors.expiry}</div>}
                      </div>
                      <div style={{ marginBottom: 14 }}>
                        <label style={labelStyle}>CVV</label>
                        <input 
                          value={cvv} 
                          onChange={(e) => { setCvv(e.target.value); setErrors({ ...errors, cvv: "" }); }} 
                          placeholder="•••" 
                          type="password"
                          style={errors.cvv ? inputErr : inputBase} 
                        />
                        {errors.cvv && <div style={errText}>{errors.cvv}</div>}
                      </div>
                    </div>
                    <div style={{ marginBottom: 14 }}>
                      <label style={labelStyle}>Cardholder name</label>
                      <input 
                        value={cardName} 
                        onChange={(e) => { setCardName(e.target.value); setErrors({ ...errors, cardName: "" }); }} 
                        placeholder="Name on card..." 
                        style={errors.cardName ? inputErr : inputBase} 
                      />
                      {errors.cardName && <div style={errText}>{errors.cardName}</div>}
                    </div>
                  </div>
                  <div style={{ ...card, padding: 16, marginTop: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.gray700, marginBottom: 8 }}>Shipping to</div>
                    <div style={{ fontSize: 13, color: C.gray500, lineHeight: 1.7 }}>
                      {firstName} {lastName}<br />
                      {getFullAddress()}<br />
                      {city}, {country}<br />
                      {phone}
                    </div>
                  </div>
                  {errors.api && (
                    <div style={{ background: C.red50, border: `1px solid ${C.red500}`, color: "#B91C1C", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginTop: 12 }}>
                      ✕ {errors.api}
                    </div>
                  )}
                  <button 
                    onClick={() => { setCurrentStep(1); setErrors({}); }} 
                    style={{ ...outlineBtn, padding: "10px 24px", marginTop: 16 }}
                  >
                    ← Back
                  </button>
                </div>
                <div style={{ ...card, alignSelf: "start" }}>
                  <div style={{ fontSize: 17, fontWeight: 700, color: C.gray700, borderBottom: `1px solid ${C.gray200}`, paddingBottom: 10, marginBottom: 18 }}>
                    Order summary
                  </div>
                  {cart.map((item) => (
                    <div key={item.product.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `0.5px solid ${C.stone50}`, fontSize: 13 }}>
                      <span style={{ color: C.gray700 }}>{item.product.name} ×{item.qty}</span>
                      <span style={{ fontWeight: 700, color: C.orange }}>BHD {(item.product.price * item.qty).toFixed(2)}</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 17, fontWeight: 700, color: C.gray700, borderTop: `1px solid ${C.gray200}`, paddingTop: 12, marginTop: 12 }}>
                    <span>Total</span>
                    <span style={{ color: C.orange }}>BHD {total.toFixed(2)}</span>
                  </div>
                  <button 
                    onClick={handleNext} 
                    disabled={orderLoading} 
                    style={{ ...orangeBtn, marginTop: 18, fontSize: 17, opacity: orderLoading ? 0.6 : 1 }}
                  >
                    {orderLoading ? "Placing order..." : "Place order →"}
                  </button>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 14, fontSize: 12, color: C.gray400 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                    Secure payment — SSL encrypted
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Confirmation */}
            {currentStep === 3 && (
              <div style={{ maxWidth: 600, margin: "0 auto" }}>
                <div style={{ ...card, padding: 40, textAlign: "center" }}>
                  <div style={{ width: 64, height: 64, borderRadius: "50%", background: C.green50, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", border: `2px solid ${C.green800}` }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={C.green800} strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: C.gray700, marginBottom: 8 }}>
                    Order placed successfully!
                  </div>
                  <div style={{ fontSize: 15, color: C.gray400, marginBottom: 24 }}>
                    Thank you for supporting local artisans
                  </div>
                  <div style={{ background: C.cream, borderRadius: 12, padding: 20, textAlign: "left", marginBottom: 24 }}>
                    {[
                      ["Order number", `#ORD-${orderId}`], 
                      ["Total paid", `BHD ${orderTotal.toFixed(2)}`], 
                      ["Shipping to", `${firstName} ${lastName}`], 
                      ["Payment", paymentMethod], 
                      ["Delivery", "3-5 business days"]
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 13 }}>
                        <span style={{ color: C.gray500 }}>{k}</span>
                        <span style={{ fontWeight: 700, color: k === "Order number" ? C.orange : C.gray700 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ textAlign: "left", marginBottom: 24 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.gray700, marginBottom: 12 }}>Items ordered</div>
                    {cart.map((item) => (
                      <div key={item.product.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `0.5px solid ${C.gray100}`, fontSize: 13 }}>
                        <span style={{ color: C.gray700 }}>{item.product.name} ×{item.qty}</span>
                        <span style={{ fontWeight: 700, color: C.orange }}>BHD {(item.product.price * item.qty).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => { 
                      setCart([]); 
                      localStorage.removeItem("cart"); 
                      setCurrentStep(0); 
                      setFirstName(""); 
                      setLastName(""); 
                      setAddressDetails({
                        buildingNumber: "",
                        streetName: "",
                        block: "",
                        road: "",
                        avenue: "",
                        houseNumber: "",
                        apartmentNumber: "",
                        floorNumber: "",
                        additionalDirections: ""
                      });
                      setPhone(""); 
                      setCardNumber(""); 
                      setExpiry(""); 
                      setCvv(""); 
                      setCardName(""); 
                    }} 
                    style={{ ...orangeBtn, background: C.orange, color: C.white, border: `2px solid ${C.orange}` }}
                  >
                    Continue shopping
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Checkout;