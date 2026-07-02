const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  handleSocialAuth,
} = require("../controllers/user.controller");

// ==========================================
// 🔐 Authentication Routes
// ==========================================

// Route for normal registration: POST http://localhost:3000/api/users/register
router.post("/register", registerUser);

// Route for normal login: POST http://localhost:3000/api/users/login
router.post("/login", loginUser);

// Route for Google/GitHub verification: POST http://localhost:3000/api/users/social-auth
router.post("/social-auth", handleSocialAuth);

module.exports = router;
