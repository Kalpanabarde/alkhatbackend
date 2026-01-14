const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    phone: { type: String, unique: true, sparse: true }, // optional field
    password: { type: String, required: true },
    fullName: { type: String },
    role: { type: String, default: "admin" }, // default is admin
    isActive: { type: Boolean, default: true },

    resetToken: String,
    resetTokenExpiry: Date

    // resetPasswordToken: { type: String },
    // resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

// Method to set OTP
/**userSchema.methods.setOTP = async function (otp) {
  this.phoneOtp = otp;
  this.phoneOtpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  await this.save();
};

// Method to verify OTP
userSchema.methods.verifyOTP = async function (otp) {
  if (this.phoneOtp !== otp) return false;
  if (Date.now() > this.phoneOtpExpires) return false;
  return true;
};**/

module.exports = mongoose.model("User", userSchema);
