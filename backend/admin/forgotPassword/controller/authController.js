const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const User = require("../../models/userModel");

/* -------- EMAIL TRANSPORTER -------- */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "kalpanabarde1998@gmail.com",
    pass: "qhwyanbotdptpnxv" // ⚠️ move to .env later
  }
});

/* -------- TEST EMAIL -------- */
const testEmail = async (req, res) => {
  try {
    await transporter.sendMail({
      from: "kalpanabarde1998@gmail.com",
      to: "kalpanabarde97@gmail.com",
      subject: "Test Email",
      html: "<h2>Email is working ✅</h2>"
    });

    res.json({ message: "Email sent successfully" });
  } catch (err) {
    console.error("Email error:", err);
    res.status(500).json({ message: "Email failed" });
  }
};

/* -------- FORGOT PASSWORD -------- */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email not registered" });
    }

    // generate token (RAW)
    const resetToken = crypto.randomBytes(20).toString("hex");

    // hash token (STORE THIS)
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    const resetUrl = `https://test-admin-6dk9br9la-alkhat.vercel.app/#/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: "kalpanabarde1998@gmail.com",
      to: email,
      subject: "Password Reset",
      text: `Click the link to reset password:\n\n${resetUrl}\n\nValid for 10 minutes`
    });

    res.json({ success: true, message: "Reset link sent to email" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Forgot password failed" });
  }
};

/* -------- RESET PASSWORD -------- */
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;      // ✅ from URL
    const { newPassword } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Reset token missing" });
    }

    if (!newPassword) {
      return res.status(400).json({ message: "Password is required" });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset token"
      });
    }

    user.password = newPassword;
    await user.save();
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  testEmail,
  forgotPassword,
  resetPassword
};
