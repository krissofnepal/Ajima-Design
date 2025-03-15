const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true }, // Example: Land, Machinery, Building
  value: { type: Number, required: true }, // Estimated value
  location: { type: String },
  owner: { type: String },
  date: { type: Date, default: Date.now }, // Date of valuation
});

const Asset = mongoose.model("Asset", assetSchema);

module.exports = Asset;
