const mongoose = require("mongoose");
const bcrypt =require("bcryptjs")

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    phone: { type: String, unique: true, sparse: true }, // optional field
    password: { type: String, required: true },
    fullName: { type: String },
    role: { type: String, default: "admin" }, // default is admin
    isActive: { type: Boolean, default: true },
    
    resetPasswordToken: { type: String }, // OTP for verification
    resetPasswordExpire: { type: Date }, // Expiry time for OTP
    isVerified: { type: Boolean, default: false }


  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model("User", userSchema);
