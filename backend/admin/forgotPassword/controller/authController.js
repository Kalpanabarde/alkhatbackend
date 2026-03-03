const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const User = require("../../models/userModel");

/* ================= EMAIL TRANSPORTER ================= */
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // TLS
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/* ================= TEST EMAIL ================= */
const testEmail = async (req, res) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: process.env.ADMIN_EMAIL,
      subject: "Test Email",
      html: "<h2>Email service is working ✅</h2>",
    });

    return res.json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Test email error:", error);
    return res.status(500).json({ message: "Email service failed" });
  }
};

/* ================= FORGOT PASSWORD ================= */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email not registered" });
    }

    // Generate raw token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token for DB
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 min
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/#/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Reset Your Password",
      html: `
        <p>You requested a password reset.</p>
        <p>Click the link below (valid for 10 minutes):</p>
        <a href="${resetUrl}">${resetUrl}</a>
      `,
    });

    return res.json({
      success: true,
      message: "Password reset link sent to email",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/* ================= RESET PASSWORD ================= */
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and password required" });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // HASH PASSWORD ✅
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return res.json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  testEmail,
  forgotPassword,
  resetPassword,
};
