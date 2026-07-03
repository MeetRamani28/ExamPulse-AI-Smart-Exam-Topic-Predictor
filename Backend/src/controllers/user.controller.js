const User = require("../models/user.model");
const { sendWelcomeEmail } = require("../services/email.service");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const { OAuth2Client } = require("google-auth-library");
const { uploadAvatarToCloudinary } = require("../utils/cloudinary");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Helper function to generate a secure JWT Token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// ==========================================
// 🔐 1. Standard Email & Password Register
// ==========================================
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields." });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "User already exists with this email address." });
    }

    const user = await User.create({
      name,
      email,
      password,
      provider: "local",
    });

    await sendWelcomeEmail(user.email, user.name, "local");

    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 🔑 2. Standard Email & Password Login
// ==========================================
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide both email and password." });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user || user.provider !== "local") {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = generateToken(user._id);
    res.status(200).json({
      success: true,
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 🚀 3. Google & GitHub Social Auth Handler
// ==========================================
exports.handleSocialAuth = async (req, res) => {
  try {
    const { provider, accessToken, code } = req.body;
    let userData = {
      name: "",
      email: "",
      provider,
      providerId: "",
      avatar: "",
    };

    if (!provider) {
      return res.status(400).json({ message: "Auth provider is missing." });
    }

    // ==========================================
    // 🌐 Case A: Handle Incoming Google Verification
    // ==========================================
    if (provider === "google") {
      if (!accessToken)
        return res.status(400).json({ message: "Google token missing" });

      const googleResponse = await axios.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      const { name, email, sub, picture } = googleResponse.data;
      userData = { name, email, provider, providerId: sub, avatar: picture };
    }

    // ==========================================
    // 💻 Case B: Handle Incoming GitHub Verification
    // ==========================================
    else if (provider === "github") {
      if (!code)
        return res.status(400).json({ message: "GitHub code missing" });

      const tokenResponse = await axios.post(
        "https://github.com/login/oauth/access_token",
        {
          client_id: process.env.GITHUB_CLIENT_ID || req.body.clientId,
          client_secret: process.env.GITHUB_CLIENT_SECRET, // Must be in backend .env
          code: code,
        },
        {
          headers: { Accept: "application/json" },
        },
      );

      const gitHubToken = tokenResponse.data.access_token;
      if (!gitHubToken)
        return res.status(400).json({ message: "Invalid GitHub OAuth code" });

      const userResponse = await axios.get("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${gitHubToken}` },
      });

      const emailsResponse = await axios.get(
        "https://api.github.com/user/emails",
        {
          headers: { Authorization: `Bearer ${gitHubToken}` },
        },
      );

      const primaryEmail =
        emailsResponse.data.find((email) => email.primary)?.email ||
        emailsResponse.data[0]?.email;

      userData = {
        name: userResponse.data.name || userResponse.data.login,
        email: primaryEmail,
        provider,
        providerId: String(userResponse.data.id),
        avatar: userResponse.data.avatar_url,
      };
    }

    if (!userData.email) {
      return res
        .status(400)
        .json({ message: "Could not retrieve email from provider." });
    }

    // ==========================================
    // 💾 Save User and Generate App Session
    // ==========================================
    let user = await User.findOne({ email: userData.email });

    if (!user) {
      user = await User.create({
        name: userData.name,
        email: userData.email,
        provider: userData.provider,
        providerId: userData.providerId,
        avatar: userData.avatar || "https://example.com/default-avatar.png",
      });

      await sendWelcomeEmail(user.email, user.name, provider);
    } else {
      if (user.provider !== provider) {
        user.provider = provider;
        user.providerId = userData.providerId;
        if (userData.avatar) user.avatar = userData.avatar;
        await user.save();
      }
    }

    const token = generateToken(user._id);

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("token", token, {
      httpOnly: isProduction,
      secure: isProduction,
      sameSite: isProduction ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    console.error("❌ Social Authentication Controller Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 🛠️ 4. Unified Profile Update Engine
// ==========================================
exports.updateUserProfile = async (req, res) => {
  try {
    const { name, currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
      return res
        .status(404)
        .json({ message: "Active workspace user not found." });
    }

    if (name && name.trim() !== "") {
      user.name = name.trim();
    }

    if (req.file) {
      if (!req.file.mimetype.startsWith("image/")) {
        return res
          .status(400)
          .json({
            message: "Uploaded file asset must be a valid image format.",
          });
      }
      const cloudResult = await uploadAvatarToCloudinary(
        req.file.buffer,
        user._id,
      );
      user.avatar = cloudResult.secure_url;
    }

    if (newPassword) {
      if (user.provider !== "local") {
        return res.status(400).json({
          message: `Accounts managed via ${user.provider} credentials cannot update localized passwords.`,
        });
      }

      if (!currentPassword) {
        return res
          .status(400)
          .json({
            message: "Current authorization password must be supplied.",
          });
      }

      const matchFound = await user.comparePassword(currentPassword);
      if (!matchFound) {
        return res
          .status(401)
          .json({
            message: "Incorrect current validation password. Handshake denied.",
          });
      }

      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ message: "New password must match or exceed 6 characters." });
      }

      user.password = newPassword;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Workspace profile updated beautifully! ✨",
      user: user.toJSON(),
    });
  } catch (error) {
    console.error("❌ Profile Sync Engine Failure:", error.message);
    res
      .status(500)
      .json({
        message:
          "Engine failed to update user profile parameters: " + error.message,
      });
  }
};
