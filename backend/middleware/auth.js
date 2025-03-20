const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

module.exports = async function (req, res, next) {
  // Get token from header
  const token = req.header("Authorization")?.replace("Bearer ", "");

  // Check if no token
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No token, authorization denied",
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user has superadmin privileges
    if (!user.isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied: insufficient privileges",
      });
    }

    // Add user to request object
    req.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isSuperAdmin: user.isSuperAdmin,
    };

    // Update last login time
    user.lastLogin = new Date();
    await user.save();

    next();
  } catch (err) {
    console.error("Token verification error:", err);
    res.status(401).json({
      success: false,
      message: "Token is not valid",
    });
  }
};
