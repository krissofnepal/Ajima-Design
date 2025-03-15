const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Application = require("../models/Application");
const auth = require("../middleware/auth");

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(
        new Error(
          "Error: Only supported file types (images, PDFs, docs) are allowed!"
        )
      );
    }
  },
});

// @route   POST api/applications
// @desc    Create a new application
// @access  Private
router.post("/", auth, upload.array("attachments", 5), async (req, res) => {
  try {
    const {
      date,
      landPlotNo,
      borrowerName,
      ownerName,
      locationCoordinate,
      totalAreaLalpurja,
      totalAreaActual,
      deductionROW,
      areaForValuation,
      claimantPeriod,
      frontage,
      shape,
      physicalFeature,
      row,
      commercialRate,
      governmentRate,
      accessWidthField,
      accessWidthBlueprint,
      buildingDetails,
      fairMarketValueLand,
      fairMarketValueBuilding,
      fairMarketValueTotal,
      distressValueLand,
      distressValueBuilding,
      distressValueTotal,
    } = req.body;

    // Create new application
    const application = new Application({
      user: req.user.id,
      date: date || new Date(),
      landPlotNo,
      borrowerName,
      ownerName,
      locationCoordinate,
      totalAreaLalpurja,
      totalAreaActual,
      deductionROW,
      areaForValuation,
      claimantPeriod,
      frontage,
      shape,
      physicalFeature,
      row,
      commercialRate,
      governmentRate,
      accessWidthField,
      accessWidthBlueprint,
      buildingDetails,
      fairMarketValueLand: parseFloat(fairMarketValueLand) || 0,
      fairMarketValueBuilding: parseFloat(fairMarketValueBuilding) || 0,
      fairMarketValueTotal: parseFloat(fairMarketValueTotal) || 0,
      distressValueLand: parseFloat(distressValueLand) || 0,
      distressValueBuilding: parseFloat(distressValueBuilding) || 0,
      distressValueTotal: parseFloat(distressValueTotal) || 0,
    });

    // Add attachments if any
    if (req.files && req.files.length > 0) {
      application.attachments = req.files.map((file) => ({
        filename: file.originalname,
        path: file.path,
        mimetype: file.mimetype,
      }));
    }

    await application.save();

    res.status(201).json({
      success: true,
      message: "Valuation report created successfully",
      application,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});

// @route   GET api/applications
// @desc    Get all applications for the logged in user
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const applications = await Application.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});

// @route   GET api/applications/:id
// @desc    Get application by ID
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Check if the application belongs to the user
    if (application.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this application",
      });
    }

    res.json({
      success: true,
      application,
    });
  } catch (err) {
    console.error(err.message);

    if (err.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});

// @route   PUT api/applications/:id
// @desc    Update an application
// @access  Private
router.put("/:id", auth, async (req, res) => {
  try {
    let application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Check if the application belongs to the user
    if (application.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to update this application",
      });
    }

    const { title, description, category, deadline, budget, skills, status } =
      req.body;

    // Build application object
    const applicationFields = {};
    if (title) applicationFields.title = title;
    if (description) applicationFields.description = description;
    if (category) applicationFields.category = category;
    if (deadline) applicationFields.deadline = deadline;
    if (budget) applicationFields.budget = parseFloat(budget);
    if (skills) applicationFields.skills = skills;
    if (status) applicationFields.status = status;

    // Update application
    application = await Application.findByIdAndUpdate(
      req.params.id,
      { $set: applicationFields },
      { new: true }
    );

    res.json({
      success: true,
      message: "Application updated successfully",
      application,
    });
  } catch (err) {
    console.error(err.message);

    if (err.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});

// @route   DELETE api/applications/:id
// @desc    Delete an application
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Check if the application belongs to the user
    if (application.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to delete this application",
      });
    }

    // Delete attachments if any
    if (application.attachments && application.attachments.length > 0) {
      application.attachments.forEach((attachment) => {
        try {
          fs.unlinkSync(attachment.path);
        } catch (err) {
          console.error(`Error deleting file ${attachment.path}:`, err);
        }
      });
    }

    await Application.deleteOne({ _id: req.params.id });

    res.json({
      success: true,
      message: "Application deleted successfully",
    });
  } catch (err) {
    console.error(err.message);

    if (err.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});

module.exports = router;
