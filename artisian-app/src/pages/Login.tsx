// frontend/src/pages/Login.tsx
import { useState } from "react";

const C = {
  orange: "#D85A30", orangeLight: "#FAECE7",
  cream: "#FAF8F5", stone50: "#F1EFE8", stone800: "#2C2C2A",
  white: "#ffffff", gray100: "#F5F5F4", gray200: "#E7E5E4",
  gray300: "#D6D3D1", gray400: "#A8A29E", gray500: "#78716C",
  gray600: "#57534E", gray700: "#44403C",
  red50: "#FEF2F2", red500: "#EF4444",
  green50: "#F0FDF4", green800: "#166534",
};

const wrap: React.CSSProperties = { maxWidth: 1100, margin: "0 auto", padding: "0 40px" };
const card: React.CSSProperties = { background: C.white, borderRadius: 12, border: `1px solid ${C.gray200}`, padding: 16 };
const orangeBtn: React.CSSProperties = { border: `2px solid ${C.orange}`, color: C.orange, fontWeight: 700, background: C.white, borderRadius: 8, padding: "12px 0", fontSize: 15, cursor: "pointer", width: "100%" };
const inputBase: React.CSSProperties = { width: "100%", border: `1px solid ${C.gray300}`, borderRadius: 8, padding: "9px 12px", fontSize: 13, color: C.stone800, background: C.white, boxSizing: "border-box", outline: "none" };
const inputErr: React.CSSProperties = { ...inputBase, border: `1px solid ${C.red500}` };
const labelStyle: React.CSSProperties = { display: "block", fontSize: 12, color: C.gray600, fontWeight: 500, marginBottom: 5 };

const API = "http://localhost:5000/api";

const categories: string[] = ["Pottery & Ceramics", "Woodworking", "Jewelry & Metalwork", "Textiles & Weaving", "Painting & Art", "Leather Crafts", "Glass Blowing", "Other"];

const Login: React.FC = () => {
  const [tab, setTab] = useState<string>("login");
  const [role, setRole] = useState<string>("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState("");
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<any>(null);

  // Verification state
  const [showVerification, setShowVerification] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [verifySuccess, setVerifySuccess] = useState("");
  const [resending, setResending] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [shopName, setShopName] = useState("");
  const [category, setCategory] = useState("");
  const [bio, setBio] = useState("");

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (tab === "register" && !name.trim()) e.name = "Required";
    else if (tab === "register" && !/^[a-zA-Z\s]+$/.test(name.trim())) e.name = "Name must contain only letters";
    else if (tab === "register" && name.trim().length < 2) e.name = "Name must be at least 2 characters";
    if (!email.trim()) e.email = "Required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Invalid email";
    if (!password) e.password = "Required";
    else if (password.length < 8) e.password = "Min 8 characters";
    if (tab === "register") {
      if (password !== confirmPassword) e.confirmPassword = "Passwords don't match";
      if (!phone.trim()) e.phone = "Required";
      else if (!/^[0-9+\s-]+$/.test(phone.trim())) e.phone = "Phone must contain only numbers";
      if (role === "artisan") {
        if (!shopName.trim()) e.shopName = "Required";
        if (!category) e.category = "Required";
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true); setApiError("");
    try {
      const res = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone, role, shop_name: shopName || null, category: category || null, bio: bio || null }),
      });
      const data = await res.json();
      if (!res.ok) { setApiError(data.message); return; }

      if (data.needsVerification) {
        setVerifyEmail(email);
        setShowVerification(true);
        setSuccess("Account created! Check your email for the verification code.");
      } else {
        setSuccess("Account created! You can now login.");
        setTab("login");
      }
    } catch (err) { setApiError("Cannot connect to server."); }
    finally { setLoading(false); }
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true); setApiError("");
    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.needsVerification) {
          setVerifyEmail(data.email || email);
          setShowVerification(true);
          setApiError("Please verify your email first.");
        } else {
          setApiError(data.message);
        }
        return;
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setLoggedInUser(data.user);
      setSuccess(`Welcome back, ${data.user.name}!`);
    } catch (err) { setApiError("Cannot connect to server."); }
    finally { setLoading(false); }
  };

  const handleVerify = async () => {
    if (!verifyCode.trim()) { setVerifyError("Enter the code"); return; }
    setLoading(true); setVerifyError("");
    try {
      const res = await fetch(`${API}/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verifyEmail, code: verifyCode }),
      });
      const data = await res.json();
      if (res.ok) {
        setVerifySuccess("Email verified! You can now login.");
        setTimeout(() => { setShowVerification(false); setTab("login"); setVerifySuccess(""); setSuccess("Email verified! Login now."); }, 2000);
      } else { setVerifyError(data.message); }
    } catch (err) { setVerifyError("Cannot connect to server."); }
    finally { setLoading(false); }
  };

  const handleResend = async () => {
    setResending(true); setVerifyError("");
    try {
      const res = await fetch(`${API}/resend-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verifyEmail }),
      });
      const data = await res.json();
      if (res.ok) setVerifySuccess("New code sent! Check your email.");
      else setVerifyError(data.message);
    } catch (err) { setVerifyError("Cannot connect to server."); }
    finally { setResending(false); }
  };

  // Logged in view
  if (loggedInUser) {
    return (
      <div style={{ background: C.cream, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ ...card, width: 400, padding: 40, textAlign: "center" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: C.orangeLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: "#712B13", margin: "0 auto 20px" }}>{loggedInUser.name.charAt(0).toUpperCase()}</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: C.gray700, marginBottom: 8 }}>Welcome, {loggedInUser.name}!</div>
          <div style={{ fontSize: 14, color: C.gray400, marginBottom: 4 }}>{loggedInUser.email}</div>
          <div style={{ marginBottom: 24 }}><span style={{ background: C.orangeLight, color: "#712B13", fontSize: 12, padding: "4px 12px", borderRadius: 20, fontWeight: 600, textTransform: "capitalize" as const }}>{loggedInUser.role}</span></div>
          <div style={{ fontSize: 13, color: C.green800, background: C.green50, padding: "10px 16px", borderRadius: 8, marginBottom: 20, fontWeight: 600 }}>✓ Logged in. Token saved.</div>
          <a href="/" style={{ ...orangeBtn, background: C.orange, color: C.white, border: `2px solid ${C.orange}`, textDecoration: "none", textAlign: "center", display: "block", marginBottom: 10 }}>Go to Home →</a>
          <button onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("user"); setLoggedInUser(null); setSuccess(""); }} style={{ ...orangeBtn, background: C.orange, color: C.white, border: `2px solid ${C.orange}` }}>Sign out</button>
        </div>
      </div>
    );
  }

  // Verification view
  if (showVerification) {
    return (
      <div style={{ background: C.cream, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ ...card, width: 400, padding: 32, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.orange, marginBottom: 8 }}>Verify Your Email</div>
          <div style={{ fontSize: 14, color: C.gray400, marginBottom: 24 }}>We sent a 6-digit code to <strong style={{ color: C.gray700 }}>{verifyEmail}</strong></div>

          {verifySuccess && <div style={{ background: C.green50, border: `1px solid ${C.green800}`, color: C.green800, padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 16, fontWeight: 600 }}>✓ {verifySuccess}</div>}
          {verifyError && <div style={{ background: C.red50, border: `1px solid ${C.red500}`, color: "#B91C1C", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 16 }}>✕ {verifyError}</div>}

          <div style={{ marginBottom: 16 }}>
            <input value={verifyCode} onChange={(e) => setVerifyCode(e.target.value)} placeholder="Enter 6-digit code" maxLength={6} style={{ ...inputBase, textAlign: "center", fontSize: 24, letterSpacing: 8, fontWeight: 700, padding: "14px 12px" }} />
          </div>

          <button onClick={handleVerify} disabled={loading} style={{ ...orangeBtn, background: C.orange, color: C.white, border: `2px solid ${C.orange}`, opacity: loading ? 0.6 : 1, marginBottom: 16 }}>
            {loading ? "Verifying..." : "Verify Email"}
          </button>

          <div style={{ fontSize: 13, color: C.gray400, marginBottom: 12 }}>
            Didn't receive the code?{" "}
            <span onClick={handleResend} style={{ color: C.orange, fontWeight: 700, cursor: "pointer" }}>{resending ? "Sending..." : "Resend Code"}</span>
          </div>

          <span onClick={() => { setShowVerification(false); setTab("login"); }} style={{ fontSize: 13, color: C.gray500, cursor: "pointer" }}>← Back to login</span>
        </div>
      </div>
    );
  }

  // Login / Register form
  return (
    <div style={{ background: C.cream, minHeight: "100vh" }}>
      {success && <div style={{ background: C.green50, border: `1px solid ${C.green800}`, color: C.green800, textAlign: "center", padding: "10px 20px", fontSize: 14, fontWeight: 600 }}>✓ {success}</div>}

      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "40px 20px", minHeight: "calc(100vh - 40px)" }}>
        <div style={{ ...card, width: 380, padding: 32 }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: C.orange }}>Welcome</div>
            <div style={{ fontSize: 15, color: C.gray400, marginTop: 6 }}>Local Artisan Cooperative</div>
          </div>

          <div style={{ display: "flex", borderBottom: `1px solid ${C.gray200}`, marginBottom: 24 }}>
            {["login", "register"].map((t) => (
              <button key={t} onClick={() => { setTab(t); setErrors({}); setApiError(""); setSuccess(""); }}
                style={{ flex: 1, padding: "12px 0", fontSize: 15, cursor: "pointer", background: "none", border: "none", color: tab === t ? C.orange : C.gray400, borderBottom: tab === t ? `2px solid ${C.orange}` : "none", fontWeight: tab === t ? 700 : 400, textTransform: "capitalize" as const }}>
                {t}
              </button>
            ))}
          </div>

          {apiError && <div style={{ background: C.red50, border: `1px solid ${C.red500}`, color: "#B91C1C", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 16 }}>✕ {apiError}</div>}

          {tab === "login" ? (
            <>
              <div style={{ marginBottom: 14 }}><label style={labelStyle}>Email</label><input value={email} onChange={(e) => { setEmail(e.target.value); setErrors({ ...errors, email: "" }); }} placeholder="example@email.com" type="email" style={errors.email ? inputErr : inputBase} />{errors.email && <div style={{ fontSize: 11, color: C.red500, marginTop: 4 }}>{errors.email}</div>}</div>
              <div style={{ marginBottom: 14 }}><label style={labelStyle}>Password</label><input value={password} onChange={(e) => { setPassword(e.target.value); setErrors({ ...errors, password: "" }); }} placeholder="Enter password..." type={showPassword ? "text" : "password"} style={errors.password ? inputErr : inputBase} />{errors.password && <div style={{ fontSize: 11, color: C.red500, marginTop: 4 }}>{errors.password}</div>}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <label style={{ fontSize: 12, color: C.gray500, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}><input type="checkbox" checked={showPassword} onChange={() => setShowPassword(!showPassword)} style={{ accentColor: C.orange }} />Show password</label>
              </div>
              <button onClick={handleLogin} disabled={loading} style={{ ...orangeBtn, opacity: loading ? 0.6 : 1 }}>{loading ? "Logging in..." : "Login"}</button>
            </>
          ) : (
            <>
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                {["customer", "artisan"].map((r) => (
                  <button key={r} onClick={() => { setRole(r); setErrors({}); }}
                    style={{ flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 12, cursor: "pointer", border: `1px solid ${role === r ? C.orange : C.gray300}`, background: role === r ? C.orangeLight : C.white, color: role === r ? "#712B13" : C.gray500, fontWeight: 600, textTransform: "capitalize" as const }}>{r}</button>
                ))}
              </div>
              <div style={{ marginBottom: 14 }}><label style={labelStyle}>Full name</label><input value={name} onChange={(e) => { setName(e.target.value); setErrors({ ...errors, name: "" }); }} placeholder="Your name..." style={errors.name ? inputErr : inputBase} />{errors.name && <div style={{ fontSize: 11, color: C.red500, marginTop: 4 }}>{errors.name}</div>}</div>
              <div style={{ marginBottom: 14 }}><label style={labelStyle}>Email</label><input value={email} onChange={(e) => { setEmail(e.target.value); setErrors({ ...errors, email: "" }); }} placeholder="Your email..." type="email" style={errors.email ? inputErr : inputBase} />{errors.email && <div style={{ fontSize: 11, color: C.red500, marginTop: 4 }}>{errors.email}</div>}</div>
              <div style={{ marginBottom: 14 }}><label style={labelStyle}>Phone</label><input value={phone} onChange={(e) => { setPhone(e.target.value); setErrors({ ...errors, phone: "" }); }} placeholder="+973 XXXX XXXX" style={errors.phone ? inputErr : inputBase} />{errors.phone && <div style={{ fontSize: 11, color: C.red500, marginTop: 4 }}>{errors.phone}</div>}</div>
              {role === "artisan" && (<>
                <div style={{ marginBottom: 14 }}><label style={labelStyle}>Shop name</label><input value={shopName} onChange={(e) => { setShopName(e.target.value); setErrors({ ...errors, shopName: "" }); }} placeholder="Shop name..." style={errors.shopName ? inputErr : inputBase} />{errors.shopName && <div style={{ fontSize: 11, color: C.red500, marginTop: 4 }}>{errors.shopName}</div>}</div>
                <div style={{ marginBottom: 14 }}><label style={labelStyle}>Category</label><select value={category} onChange={(e) => { setCategory(e.target.value); setErrors({ ...errors, category: "" }); }} style={{ ...inputBase, color: category ? C.stone800 : C.gray400 }}><option value="">Select...</option>{categories.map((c) => <option key={c} value={c}>{c}</option>)}</select>{errors.category && <div style={{ fontSize: 11, color: C.red500, marginTop: 4 }}>{errors.category}</div>}</div>
                <div style={{ marginBottom: 14 }}><label style={labelStyle}>Bio <span style={{ color: C.gray400 }}>(optional)</span></label><textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="About your craft..." rows={2} style={{ ...inputBase, resize: "none" as const, fontFamily: "inherit" }} /></div>
              </>)}
              <div style={{ marginBottom: 14 }}><label style={labelStyle}>Password</label><input value={password} onChange={(e) => { setPassword(e.target.value); setErrors({ ...errors, password: "" }); }} placeholder="8+ characters..." type={showPassword ? "text" : "password"} style={errors.password ? inputErr : inputBase} />{errors.password && <div style={{ fontSize: 11, color: C.red500, marginTop: 4 }}>{errors.password}</div>}</div>
              <div style={{ marginBottom: 14 }}><label style={labelStyle}>Confirm password</label><input value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setErrors({ ...errors, confirmPassword: "" }); }} placeholder="Confirm..." type="password" style={errors.confirmPassword ? inputErr : inputBase} />{errors.confirmPassword && <div style={{ fontSize: 11, color: C.red500, marginTop: 4 }}>{errors.confirmPassword}</div>}</div>
              <label style={{ fontSize: 12, color: C.gray500, display: "flex", alignItems: "center", gap: 6, cursor: "pointer", marginBottom: 16 }}><input type="checkbox" checked={showPassword} onChange={() => setShowPassword(!showPassword)} style={{ accentColor: C.orange }} />Show password</label>
              <button onClick={handleRegister} disabled={loading} style={{ ...orangeBtn, opacity: loading ? 0.6 : 1 }}>{loading ? "Creating account..." : "Create account"}</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;