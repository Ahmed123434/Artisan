// backend/controllers/authController.js
const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// Email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate 6-digit code
const generateCode = () => String(Math.floor(100000 + Math.random() * 900000));

// Send verification email
const sendVerificationEmail = async (email, code, name) => {
  const mailOptions = {
    from: `"Artisan Co-op" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify Your Email - Artisan Co-op",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; padding: 20px 0;">
          <h1 style="color: #D85A30; margin: 0;">Artisan Co-op</h1>
          <p style="color: #78716C; margin-top: 5px;">Local Artisan Cooperative</p>
        </div>
        <div style="background: #FAF8F5; border-radius: 12px; padding: 30px; text-align: center;">
          <h2 style="color: #44403C; margin: 0 0 10px;">Welcome, ${name}!</h2>
          <p style="color: #78716C; margin: 0 0 20px;">Please verify your email address to complete your registration.</p>
          <div style="background: #D85A30; color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 15px 30px; border-radius: 8px; display: inline-block;">
            ${code}
          </div>
          <p style="color: #A8A29E; font-size: 13px; margin-top: 20px;">This code expires in 10 minutes.</p>
        </div>
        <p style="color: #A8A29E; font-size: 12px; text-align: center; margin-top: 20px;">
          If you didn't create an account, please ignore this email.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Register
const register = async (req, res) => {
  try {
    const { name, email, password, phone, role, shop_name, category, bio } = req.body;

    // Check if email exists
    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "Email already registered." });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate verification code
    const code = generateCode();

    // Create user (not verified yet)
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password, phone, role, shop_name, category, bio, is_verified, verification_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)",
      [name, email, hashedPassword, phone, role || "customer", shop_name, category, bio, code]
    );

    // Send verification email
    try {
      await sendVerificationEmail(email, code, name);
      res.status(201).json({ message: "Account created! Check your email for the verification code.", userId: result.insertId, needsVerification: true });
    } catch (emailErr) {
      console.error("Email send error:", emailErr);
      // If email fails, still create account but auto-verify
      await pool.query("UPDATE users SET is_verified = 1 WHERE id = ?", [result.insertId]);
      res.status(201).json({ message: "Account created! (Email verification skipped)", userId: result.insertId, needsVerification: false });
    }
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Verify email
const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    const [users] = await pool.query("SELECT id, verification_code FROM users WHERE email = ?", [email]);
    if (users.length === 0) return res.status(404).json({ message: "User not found." });

    if (users[0].verification_code !== code) {
      return res.status(400).json({ message: "Invalid verification code." });
    }

    await pool.query("UPDATE users SET is_verified = 1, verification_code = NULL WHERE id = ?", [users[0].id]);
    res.json({ message: "Email verified successfully! You can now login." });
  } catch (error) {
    console.error("Verify error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Resend verification code
const resendCode = async (req, res) => {
  try {
    const { email } = req.body;

    const [users] = await pool.query("SELECT id, name, is_verified FROM users WHERE email = ?", [email]);
    if (users.length === 0) return res.status(404).json({ message: "User not found." });
    if (users[0].is_verified) return res.status(400).json({ message: "Email already verified." });

    const code = generateCode();
    await pool.query("UPDATE users SET verification_code = ? WHERE id = ?", [code, users[0].id]);

    await sendVerificationEmail(email, code, users[0].name);
    res.json({ message: "New verification code sent!" });
  } catch (error) {
    console.error("Resend error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (users.length === 0) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const user = users[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // Check if verified
    if (!user.is_verified) {
      return res.status(403).json({ message: "Please verify your email first.", needsVerification: true, email: user.email });
    }

    // Check if suspended
    if (user.status === "suspended") {
      return res.status(403).json({ message: "Your account has been suspended." });
    }

    // Create token
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, shop_name: user.shop_name, category: user.category },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = { register, login, verifyEmail, resendCode };