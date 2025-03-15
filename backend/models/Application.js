const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  landPlotNo: {
    type: String,
    required: true,
    trim: true,
  },
  borrowerName: {
    type: String,
    required: true,
    trim: true,
  },
  ownerName: {
    type: String,
    required: true,
    trim: true,
  },
  locationCoordinate: {
    type: String,
    trim: true,
  },
  totalAreaLalpurja: {
    type: String,
    trim: true,
  },
  totalAreaActual: {
    type: String,
    trim: true,
  },
  deductionROW: {
    type: String,
    trim: true,
  },
  areaForValuation: {
    type: String,
    trim: true,
  },
  claimantPeriod: {
    type: String,
    trim: true,
  },
  frontage: {
    type: String,
    trim: true,
  },
  shape: {
    type: String,
    trim: true,
  },
  physicalFeature: {
    type: String,
    trim: true,
  },
  row: {
    type: String,
    trim: true,
  },
  commercialRate: {
    type: String,
    trim: true,
  },
  governmentRate: {
    type: String,
    trim: true,
  },
  accessWidthField: {
    type: String,
    trim: true,
  },
  accessWidthBlueprint: {
    type: String,
    trim: true,
  },
  buildingDetails: {
    type: String,
    trim: true,
  },
  fairMarketValueLand: {
    type: Number,
    default: 0,
  },
  fairMarketValueBuilding: {
    type: Number,
    default: 0,
  },
  fairMarketValueTotal: {
    type: Number,
    default: 0,
  },
  distressValueLand: {
    type: Number,
    default: 0,
  },
  distressValueBuilding: {
    type: Number,
    default: 0,
  },
  distressValueTotal: {
    type: Number,
    default: 0,
  },
  attachments: [
    {
      filename: String,
      path: String,
      mimetype: String,
    },
  ],
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "in-progress", "completed"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Application", ApplicationSchema);
