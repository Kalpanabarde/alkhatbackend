const express = require("express");
const {
  testEmail,
  forgotPassword,
  resetPassword
} = require("../controller/authController"); // ✅ use require here

const router = express.Router();

router.get("/test-email", testEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router; // ✅ use module.exports for CommonJS
