const express = require("express");
const { verifyToken } = require("../middleware/auth"); // Assuming you have a middleware to verify tokens
const Report = require("../models/Report"); // Adjust the path to your Report model

const router = express.Router();

// Get all reports (accessible only to superadmin)
router.get("/", verifyToken, async (req, res) => {
  try {
    // Check if the user is a superadmin
    if (!req.user.isSuperAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Fetch all reports from the database
    const reports = await Report.find(); // Adjust according to your Report model
    return res.status(200).json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
