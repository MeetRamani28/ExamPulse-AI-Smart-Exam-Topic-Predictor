const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const { protect } = require("../middlewares/authMiddleware");

const {
  registerUser,
  loginUser,
  handleSocialAuth,
  updateUserProfile,
} = require("../controllers/user.controller");

// ==========================================
// 🔐 Public Authentication Gateway Routes
// ==========================================

/**
 * @route   POST /api/users/register
 * @desc    Standard email & password registration interface
 * @access  Public
 */
router.post("/register", registerUser);

/**
 * @route   POST /api/users/login
 * @desc    Standard email & password authentication handshake
 * @access  Public
 */
router.post("/login", loginUser);

/**
 * @route   POST /api/users/social-auth
 * @desc    OAuth payload validation gateway (Google & GitHub)
 * @access  Public
 */
router.post("/social-auth", handleSocialAuth);

// ==========================================
// 🛠️ Secure Protected Workspace Management Routes
// ==========================================

/**
 * @route   PUT /api/users/update-profile
 * @desc    Unified data synchronization (Name updates, Password rotation, and Cloudinary Avatars)
 * @access  Private (Requires valid JWT Token cookie/header structure)
 */
router.put(
  "/update-profile",
  protect,
  upload.single("avatar"),
  updateUserProfile,
);

module.exports = router;
