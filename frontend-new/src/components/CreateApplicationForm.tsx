"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface FormData {
  date: string;
  landPlotNo: string;
  borrowerName: string;
  ownerName: string;
  locationCoordinate: string;
  totalAreaLalpurja: string;
  totalAreaActual: string;
  deductionROW: string;
  areaForValuation: string;
  claimantPeriod: string;
  frontage: string;
  shape: string;
  physicalFeature: string;
  row: string;
  commercialRate: string;
  governmentRate: string;
  accessWidthField: string;
  accessWidthBlueprint: string;
  buildingDetails: string;
  fairMarketValueLand: string;
  fairMarketValueBuilding: string;
  fairMarketValueTotal: string;
  distressValueLand: string;
  distressValueBuilding: string;
  distressValueTotal: string;
  attachments?: File[];
}

export default function CreateApplicationForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    date: new Date().toISOString().split("T")[0],
    landPlotNo: "",
    borrowerName: "",
    ownerName: "",
    locationCoordinate: "",
    totalAreaLalpurja: "",
    totalAreaActual: "",
    deductionROW: "",
    areaForValuation: "",
    claimantPeriod: "",
    frontage: "",
    shape: "",
    physicalFeature: "",
    row: "",
    commercialRate: "",
    governmentRate: "",
    accessWidthField: "",
    accessWidthBlueprint: "",
    buildingDetails: "",
    fairMarketValueLand: "",
    fairMarketValueBuilding: "",
    fairMarketValueTotal: "",
    distressValueLand: "",
    distressValueBuilding: "",
    distressValueTotal: "",
    attachments: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const landShapes = [
    { value: "rectangular", label: "Rectangular" },
    { value: "square", label: "Square" },
    { value: "irregular", label: "Irregular" },
    { value: "triangular", label: "Triangular" },
    { value: "other", label: "Other" },
  ];

  const physicalFeatures = [
    { value: "flat", label: "Flat" },
    { value: "sloped", label: "Sloped" },
    { value: "hilly", label: "Hilly" },
    { value: "waterlogged", label: "Waterlogged" },
    { value: "other", label: "Other" },
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto-calculate totals
    if (name === "fairMarketValueLand" || name === "fairMarketValueBuilding") {
      const landValue =
        name === "fairMarketValueLand"
          ? parseFloat(value) || 0
          : parseFloat(formData.fairMarketValueLand) || 0;
      const buildingValue =
        name === "fairMarketValueBuilding"
          ? parseFloat(value) || 0
          : parseFloat(formData.fairMarketValueBuilding) || 0;

      setFormData((prev) => ({
        ...prev,
        fairMarketValueTotal: (landValue + buildingValue).toString(),
      }));
    }

    if (name === "distressValueLand" || name === "distressValueBuilding") {
      const landValue =
        name === "distressValueLand"
          ? parseFloat(value) || 0
          : parseFloat(formData.distressValueLand) || 0;
      const buildingValue =
        name === "distressValueBuilding"
          ? parseFloat(value) || 0
          : parseFloat(formData.distressValueBuilding) || 0;

      setFormData((prev) => ({
        ...prev,
        distressValueTotal: (landValue + buildingValue).toString(),
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData((prev) => ({
        ...prev,
        attachments: Array.from(e.target.files || []),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      // Validate form
      if (
        !formData.date ||
        !formData.landPlotNo ||
        !formData.borrowerName ||
        !formData.ownerName
      ) {
        throw new Error("Please fill in all required fields");
      }

      // Get token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      // Create form data for file upload
      const submitData = new FormData();

      // Add all form fields to FormData
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "attachments" && value !== undefined) {
          submitData.append(key, value.toString());
        }
      });

      // Add attachments if any
      if (formData.attachments && formData.attachments.length > 0) {
        formData.attachments.forEach((file) => {
          submitData.append("attachments", file);
        });
      }

      // Submit to API
      const response = await fetch("http://localhost:5000/api/applications", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: submitData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create valuation report");
      }

      // Log response data for debugging
      console.log("Response data:", data);

      // Validate response data structure
      if (!data || typeof data !== "object") {
        throw new Error("Invalid response format");
      }

      // Handle both possible response structures
      const application = data.application || data;

      // Validate application object
      if (!application || typeof application !== "object") {
        throw new Error("Invalid application data format");
      }

      // Check for MongoDB _id
      if (!application._id) {
        console.error("Application data:", application);
        throw new Error("Application ID not found in response");
      }

      setSuccess("Valuation report created successfully!");

      // Reset form after successful submission
      setFormData({
        date: new Date().toISOString().split("T")[0],
        landPlotNo: "",
        borrowerName: "",
        ownerName: "",
        locationCoordinate: "",
        totalAreaLalpurja: "",
        totalAreaActual: "",
        deductionROW: "",
        areaForValuation: "",
        claimantPeriod: "",
        frontage: "",
        shape: "",
        physicalFeature: "",
        row: "",
        commercialRate: "",
        governmentRate: "",
        accessWidthField: "",
        accessWidthBlueprint: "",
        buildingDetails: "",
        fairMarketValueLand: "",
        fairMarketValueBuilding: "",
        fairMarketValueTotal: "",
        distressValueLand: "",
        distressValueBuilding: "",
        distressValueTotal: "",
        attachments: [],
      });

      // Redirect to applications list after a short delay
      setTimeout(() => {
        router.push("/dashboard/applications");
      }, 2000);
    } catch (err: any) {
      setError(
        err.message || "An error occurred while creating the application"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-6">
        Create New Valuation Report
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div>
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Date *
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="landPlotNo"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Land Plot No. (Kitta No.) *
            </label>
            <input
              type="text"
              id="landPlotNo"
              name="landPlotNo"
              value={formData.landPlotNo}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="borrowerName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Borrower's Name *
            </label>
            <input
              type="text"
              id="borrowerName"
              name="borrowerName"
              value={formData.borrowerName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="ownerName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Owner's Name *
            </label>
            <input
              type="text"
              id="ownerName"
              name="ownerName"
              value={formData.ownerName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="locationCoordinate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Location Co-Ordinate
            </label>
            <input
              type="text"
              id="locationCoordinate"
              name="locationCoordinate"
              value={formData.locationCoordinate}
              onChange={handleChange}
              placeholder="e.g. 27.7172° N, 85.3240° E"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="claimantPeriod"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Claimant Period
            </label>
            <input
              type="text"
              id="claimantPeriod"
              name="claimantPeriod"
              value={formData.claimantPeriod}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Land Area Section */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Land Area Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="totalAreaLalpurja"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Total Area of the Land as per Lalpurja
              </label>
              <input
                type="text"
                id="totalAreaLalpurja"
                name="totalAreaLalpurja"
                value={formData.totalAreaLalpurja}
                onChange={handleChange}
                placeholder="e.g. 0-8-0-0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="totalAreaActual"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Total Area as per Actual Measurements
              </label>
              <input
                type="text"
                id="totalAreaActual"
                name="totalAreaActual"
                value={formData.totalAreaActual}
                onChange={handleChange}
                placeholder="e.g. 0-7-3-2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="deductionROW"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Deduction for ROW of Road
              </label>
              <input
                type="text"
                id="deductionROW"
                name="deductionROW"
                value={formData.deductionROW}
                onChange={handleChange}
                placeholder="e.g. 0-0-2-0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="areaForValuation"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Area of Land Considered for Valuation
              </label>
              <input
                type="text"
                id="areaForValuation"
                name="areaForValuation"
                value={formData.areaForValuation}
                onChange={handleChange}
                placeholder="e.g. 0-7-1-2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="frontage"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Frontage of Land
              </label>
              <input
                type="text"
                id="frontage"
                name="frontage"
                value={formData.frontage}
                onChange={handleChange}
                placeholder="e.g. 30 feet"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="shape"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Shape of Land
              </label>
              <select
                id="shape"
                name="shape"
                value={formData.shape}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Shape</option>
                {landShapes.map((shape) => (
                  <option key={shape.value} value={shape.value}>
                    {shape.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="physicalFeature"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Physical Feature of Land
              </label>
              <select
                id="physicalFeature"
                name="physicalFeature"
                value={formData.physicalFeature}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Feature</option>
                {physicalFeatures.map((feature) => (
                  <option key={feature.value} value={feature.value}>
                    {feature.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="row"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                ROW
              </label>
              <input
                type="text"
                id="row"
                name="row"
                value={formData.row}
                onChange={handleChange}
                placeholder="e.g. 20 feet"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Rates Section */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Rate Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="commercialRate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Commercial Rate
              </label>
              <input
                type="text"
                id="commercialRate"
                name="commercialRate"
                value={formData.commercialRate}
                onChange={handleChange}
                placeholder="e.g. Rs. 2,000,000 per anna"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="governmentRate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Government Rate
              </label>
              <input
                type="text"
                id="governmentRate"
                name="governmentRate"
                value={formData.governmentRate}
                onChange={handleChange}
                placeholder="e.g. Rs. 800,000 per anna"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Access to Land Section */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Access to Land
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="accessWidthField"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Width as per Field
              </label>
              <input
                type="text"
                id="accessWidthField"
                name="accessWidthField"
                value={formData.accessWidthField}
                onChange={handleChange}
                placeholder="e.g. 12 feet"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="accessWidthBlueprint"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Width as per Blueprint
              </label>
              <input
                type="text"
                id="accessWidthBlueprint"
                name="accessWidthBlueprint"
                value={formData.accessWidthBlueprint}
                onChange={handleChange}
                placeholder="e.g. 14 feet"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Building Details Section */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Building Details
          </h3>
          <div>
            <label
              htmlFor="buildingDetails"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Building Description
            </label>
            <textarea
              id="buildingDetails"
              name="buildingDetails"
              value={formData.buildingDetails}
              onChange={handleChange}
              rows={4}
              placeholder="Describe the building structure, age, condition, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Valuation Section */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Fair Market Value of Assets
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label
                htmlFor="fairMarketValueLand"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Land
              </label>
              <input
                type="number"
                id="fairMarketValueLand"
                name="fairMarketValueLand"
                value={formData.fairMarketValueLand}
                onChange={handleChange}
                placeholder="e.g. 15000000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="fairMarketValueBuilding"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Building
              </label>
              <input
                type="number"
                id="fairMarketValueBuilding"
                name="fairMarketValueBuilding"
                value={formData.fairMarketValueBuilding}
                onChange={handleChange}
                placeholder="e.g. 8000000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="fairMarketValueTotal"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Total Amount
              </label>
              <input
                type="number"
                id="fairMarketValueTotal"
                name="fairMarketValueTotal"
                value={formData.fairMarketValueTotal}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Distress Value of Assets
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label
                htmlFor="distressValueLand"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Land
              </label>
              <input
                type="number"
                id="distressValueLand"
                name="distressValueLand"
                value={formData.distressValueLand}
                onChange={handleChange}
                placeholder="e.g. 12000000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="distressValueBuilding"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Building
              </label>
              <input
                type="number"
                id="distressValueBuilding"
                name="distressValueBuilding"
                value={formData.distressValueBuilding}
                onChange={handleChange}
                placeholder="e.g. 6400000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="distressValueTotal"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Total Amount
              </label>
              <input
                type="number"
                id="distressValueTotal"
                name="distressValueTotal"
                value={formData.distressValueTotal}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>
          </div>
        </div>

        {/* Attachments Section */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Attachments
          </h3>
          <div>
            <label
              htmlFor="attachments"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Upload Documents
            </label>
            <input
              type="file"
              id="attachments"
              name="attachments"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              multiple
            />
            <p className="mt-1 text-sm text-gray-500">
              Upload lalpurja, naksa, photos, or other relevant documents (max
              5MB each)
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isSubmitting ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? "Submitting..." : "Create Valuation Report"}
          </button>
        </div>
      </form>
    </div>
  );
}
