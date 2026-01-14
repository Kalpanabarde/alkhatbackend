const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../../models/userModel");
const sendEmail = require("../utils/sendEmail");

/* -------- TEST EMAIL -------- */
const testEmail = async (req, res) => {
  try {
    await sendEmail({
      to: "kalpanabarde97@gmail.com", // replace with admin email
      subject: "Brevo Test Email",
      html: "<h2>Email is working ✅</h2>",
    });

    res.json({ message: "Email sent successfully" });
  } catch (err) {
    console.error("❌ Test email error:", err);
    res.status(500).json({ message: "Email failed" });
  }
};

/* -------- FORGOT PASSWORD -------- */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // 1️⃣ Check user
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "Email not registered" });

    // 2️⃣ Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetToken = hashedToken;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // 3️⃣ Construct reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // 4️⃣ Send email via Brevo
    await sendEmail({
      to: user.email,
      subject: "Reset Your Password",
      html: `
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link is valid for 15 minutes.</p>
      `,
    });

    res.json({ message: "Reset email sent successfully" });
  } catch (err) {
    console.error("❌ Forgot password error:", err);
    res.status(500).json({ message: "Failed to send reset email" });
  }
};

/* -------- RESET PASSWORD -------- */
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // 1️⃣ Hash the token from the request
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // 2️⃣ Find user with valid token
    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    // 3️⃣ Update password
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("❌ Reset password error:", error);
    res.status(500).json({ message: "Password reset failed" });
  }
};

module.exports = {
  testEmail,
  forgotPassword,
  resetPassword,
};
