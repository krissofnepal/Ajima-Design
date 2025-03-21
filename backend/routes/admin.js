const express = require("express");
const router = express.Router();
const Application = require("../models/Application");
const User = require("../models/User");
const auth = require("../middleware/auth");

// Middleware to check if user is admin
const adminAuth = async (req, res, next) => {
  try {
    // auth middleware already verified the token and set req.user
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (user.role !== "admin") {
      return res
        .status(403)
        .json({ msg: "Access denied. Admin privileges required." });
    }

    next();
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// @route   GET api/admin/applications
// @desc    Get all applications (admin only)
// @access  Admin
router.get("/applications", auth, adminAuth, async (req, res) => {
  try {
    // Fetch all applications and populate user information
    const applications = await Application.find()
      .populate("user", "username email")
      .sort({ createdAt: -1 });

    res.json({ applications });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/admin/stats
// @desc    Get admin dashboard statistics
// @access  Admin
router.get("/stats", auth, adminAuth, async (req, res) => {
  try {
    // Count total applications
    const totalReports = await Application.countDocuments();

    // Count applications by status
    const pendingReports = await Application.countDocuments({
      status: "pending",
    });
    const approvedReports = await Application.countDocuments({
      status: "approved",
    });
    const rejectedReports = await Application.countDocuments({
      status: "rejected",
    });

    // Count total users
    const totalUsers = await User.countDocuments();

    res.json({
      totalReports,
      pendingReports,
      approvedReports,
      rejectedReports,
      totalUsers,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/admin/users
// @desc    Get all users (admin only)
// @access  Admin
router.get("/users", auth, adminAuth, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/admin/applications/:id
// @desc    Get application by ID (admin only)
// @access  Admin
router.get("/applications/:id", auth, adminAuth, async (req, res) => {
  try {
    console.log("Admin fetching application with ID:", req.params.id);

    const application = await Application.findById(req.params.id).populate(
      "user",
      "username email"
    );

    if (!application) {
      console.log("Application not found with ID:", req.params.id);
      return res.status(404).json({ msg: "Application not found" });
    }

    console.log("Application found, returning data");
    res.json({
      success: true,
      application,
    });
  } catch (err) {
    console.error("Error in admin/applications/:id route:", err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Application not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route   PUT api/admin/applications/:id/status
// @desc    Update application status and admin note (admin only)
// @access  Admin
router.put("/applications/:id/status", auth, adminAuth, async (req, res) => {
  try {
    const { status, adminNote } = req.body;

    // Validate status
    if (
      !["pending", "approved", "rejected", "in-progress", "completed"].includes(
        status
      )
    ) {
      return res.status(400).json({ msg: "Invalid status value" });
    }

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ msg: "Application not found" });
    }

    // Update status and admin note
    application.status = status;
    if (adminNote !== undefined) {
      application.adminNote = adminNote;
    }

    await application.save();

    res.json({ application });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Application not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route   POST api/admin/users
// @desc    Create a new user (admin only)
// @access  Admin
router.post("/users", auth, adminAuth, async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ msg: "Please enter all required fields" });
    }

    // Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res
        .status(400)
        .json({ msg: "User with this email or username already exists" });
    }

    // Create new user
    user = new User({
      username,
      email,
      password,
      role: role || "user",
    });

    await user.save();

    // Return user without password
    const userResponse = await User.findById(user._id).select("-password");
    res.status(201).json({ user: userResponse });
  } catch (err) {
    console.error("Error creating user:", err.message);
    res.status(500).send("Server Error");
  }
});

// @route   PUT api/admin/users/:id/role
// @desc    Update user role (admin only)
// @access  Admin
router.put("/users/:id/role", auth, adminAuth, async (req, res) => {
  try {
    const { role } = req.body;

    // Validate role
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ msg: "Invalid role value" });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Update role
    user.role = role;
    await user.save();

    // Return user without password
    const userResponse = await User.findById(user._id).select("-password");
    res.json({ user: userResponse });
  } catch (err) {
    console.error("Error updating user role:", err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "User not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route   DELETE api/admin/users/:id
// @desc    Delete a user (admin only)
// @access  Admin
router.delete("/users/:id", auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Don't allow deleting the last admin
    if (user.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return res
          .status(400)
          .json({ msg: "Cannot delete the last admin user" });
      }
    }

    await user.deleteOne();
    res.json({ msg: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "User not found" });
    }
    res.status(500).send("Server Error");
  }
});

module.exports = router;
