"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import Link from "next/link";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

interface User {
  _id: string;
  username: string;
  email: string;
}

interface Application {
  _id: string;
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
  fairMarketValueLand: number;
  fairMarketValueBuilding: number;
  fairMarketValueTotal: number;
  distressValueLand: number;
  distressValueBuilding: number;
  distressValueTotal: number;
  status: string;
  createdAt: string;
  adminNote?: string;
  user: User;
  attachments?: Array<{
    filename: string;
    path: string;
    mimetype: string;
  }>;
}

export default function AdminReportDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    // Check if user is logged in and is an admin
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // Get user data from token
    try {
      const userDataStr = localStorage.getItem("user");
      if (!userDataStr) {
        router.push("/login");
        return;
      }
      const userData = JSON.parse(userDataStr);
      if (!userData || !userData._id) {
        router.push("/login");
        return;
      }

      // Check if user is admin
      if (userData.role !== "admin") {
        router.push("/dashboard");
        return;
      }

      // Fetch application details
      const fetchApplication = async () => {
        try {
          console.log("Fetching application with ID:", params.id);

          // Try the admin endpoint first
          const adminEndpoint = `http://localhost:5000/api/admin/applications/${params.id}`;
          console.log("Trying admin endpoint:", adminEndpoint);

          const adminResponse = await fetch(adminEndpoint, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          console.log("Admin endpoint response status:", adminResponse.status);

          // If admin endpoint fails, fall back to regular endpoint
          if (!adminResponse.ok) {
            console.log(
              "Admin endpoint failed with status:",
              adminResponse.status,
              "falling back to regular endpoint"
            );

            const regularEndpoint = `http://localhost:5000/api/applications/${params.id}`;
            console.log("Trying regular endpoint:", regularEndpoint);

            const regularResponse = await fetch(regularEndpoint, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            console.log(
              "Regular endpoint response status:",
              regularResponse.status
            );

            if (!regularResponse.ok) {
              console.log(
                "Regular endpoint also failed with status:",
                regularResponse.status
              );
              throw new Error("Failed to fetch application details");
            }

            const data = await regularResponse.json();
            console.log("Regular endpoint response data:", data);

            if (!data || (!data.application && !data.success)) {
              console.log("Invalid response data from regular endpoint:", data);
              throw new Error("Invalid response data");
            }

            const applicationData = data.application || data;
            console.log(
              "Application data (from regular endpoint):",
              applicationData
            );
            setApplication(applicationData);
            setAdminNote(applicationData.adminNote || "");
            return;
          }

          const data = await adminResponse.json();
          console.log("Admin endpoint response data:", data);

          if (!data || (!data.application && !data.success)) {
            console.log("Invalid response data from admin endpoint:", data);
            throw new Error("Invalid response data");
          }

          const applicationData = data.application || data;
          console.log(
            "Application data (from admin endpoint):",
            applicationData
          );
          setApplication(applicationData);
          setAdminNote(applicationData.adminNote || "");
        } catch (err: any) {
          console.error("Error fetching application:", err);
          setError(
            err.message || "An error occurred while fetching the report"
          );
        } finally {
          setLoading(false);
        }
      };

      fetchApplication();
    } catch (error) {
      console.error("Error parsing user data:", error);
      router.push("/login");
    }
  }, [params.id, router]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "NPR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Handle status change
  const handleStatusChange = async (newStatus: string) => {
    if (!application) return;

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setIsSubmitting(true);

    try {
      // Try the admin endpoint first
      const adminResponse = await fetch(
        `http://localhost:5000/api/admin/applications/${application._id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
            adminNote: adminNote,
          }),
        }
      );

      // If admin endpoint fails, fall back to regular endpoint
      if (!adminResponse.ok) {
        console.log("Admin endpoint failed, falling back to regular endpoint");
        const regularResponse = await fetch(
          `http://localhost:5000/api/applications/${application._id}/status`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              status: newStatus,
            }),
          }
        );

        if (!regularResponse.ok) {
          throw new Error("Failed to update application status");
        }

        const data = await regularResponse.json();

        // Update the application status in the UI
        setApplication({
          ...application,
          status: newStatus,
        });

        alert("Status updated successfully (via regular endpoint)");
        return;
      }

      const data = await adminResponse.json();

      // Update the application status in the UI
      setApplication({
        ...application,
        status: newStatus,
        adminNote: adminNote,
      });

      alert("Status updated successfully");
    } catch (err: any) {
      console.error("Error updating status:", err);
      alert("Failed to update status. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle print
  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 300);
  };

  // Handle PDF download
  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;

    setIsGeneratingPDF(true);

    try {
      const reportElement = reportRef.current;
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);
      pdf.save(`valuation-report-${application?.landPlotNo || "download"}.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-red-600">{error}</div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-gray-600">Report not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav
        className={`bg-gray-800 text-white shadow-md ${
          isPrinting ? "hidden" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link
                href="/admin/dashboard"
                className="text-2xl font-bold text-white"
              >
                Admin Dashboard
              </Link>
              <span className="mx-2 text-gray-400">/</span>
              <Link
                href="/admin/reports"
                className="text-gray-300 hover:text-white"
              >
                Reports
              </Link>
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-300">Report Details</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePrint}
                disabled={isPrinting}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
                {isPrinting ? "Printing..." : "Print Report"}
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                {isGeneratingPDF ? "Generating PDF..." : "Download PDF"}
              </button>
              <Link
                href="/admin/reports"
                className="text-gray-300 hover:text-white"
              >
                Back to Reports
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 print:py-0 print:px-0 print:max-w-none">
        <div className="px-4 py-6 sm:px-0 print:px-0 print:py-0">
          {/* Admin Controls */}
          <div
            className={`bg-white rounded-lg shadow-md p-6 mb-6 ${
              isPrinting ? "hidden" : ""
            }`}
          >
            <h2 className="text-xl font-semibold mb-4">Admin Controls</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report Status
                </label>
                <div className="flex items-center">
                  <span
                    className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColor(
                      application.status
                    )} mr-3`}
                  >
                    {application.status.charAt(0).toUpperCase() +
                      application.status.slice(1)}
                  </span>
                  <select
                    value={application.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={isSubmitting}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Notes
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={3}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Add notes about this report (only visible to admins)"
                ></textarea>
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={() => handleStatusChange(application.status)}
                    disabled={isSubmitting}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {isSubmitting ? "Saving..." : "Save Notes"}
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-4 border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Report Created By
              </h3>
              <div className="flex items-center">
                <div className="bg-gray-100 rounded-full h-10 w-10 flex items-center justify-center">
                  <span className="text-gray-600 font-medium">
                    {application.user && application.user.username
                      ? application.user.username.charAt(0).toUpperCase()
                      : "U"}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {application.user
                      ? application.user.username
                      : "Unknown User"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {application.user ? application.user.email : ""}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Report Content */}
          <div
            ref={reportRef}
            className="bg-white rounded-lg shadow-md p-8 print:shadow-none print:rounded-none"
          >
            {/* Report Header */}
            <div className="text-center mb-8 border-b pb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Land and Property Valuation Report
              </h1>
              <p className="text-gray-600">
                Report Date: {formatDate(application.date)}
              </p>
              <p className="text-gray-600">Report ID: {application._id}</p>
              <p className="text-gray-600">
                Status: <span className="capitalize">{application.status}</span>
              </p>
            </div>

            {/* Basic Information */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-700">
                    <span className="font-medium">
                      Land Plot No. (Kitta No.):
                    </span>{" "}
                    {application.landPlotNo}
                  </p>
                </div>
                <div>
                  <p className="text-gray-700">
                    <span className="font-medium">Borrower's Name:</span>{" "}
                    {application.borrowerName}
                  </p>
                </div>
                <div>
                  <p className="text-gray-700">
                    <span className="font-medium">Owner's Name:</span>{" "}
                    {application.ownerName}
                  </p>
                </div>
                <div>
                  <p className="text-gray-700">
                    <span className="font-medium">Location Co-Ordinate:</span>{" "}
                    {application.locationCoordinate || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-700">
                    <span className="font-medium">Claimant Period:</span>{" "}
                    {application.claimantPeriod || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Land Area Details */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
                Land Area Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-700">
                    <span className="font-medium">
                      Total Area as per Lalpurja:
                    </span>{" "}
                    {application.totalAreaLalpurja || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-700">
                    <span className="font-medium">
                      Total Area as per Actual Measurements:
                    </span>{" "}
                    {application.totalAreaActual || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-700">
                    <span className="font-medium">
                      Deduction for ROW of Road:
                    </span>{" "}
                    {application.deductionROW || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-700">
                    <span className="font-medium">
                      Area of Land Considered for Valuation:
                    </span>{" "}
                    {application.areaForValuation || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-700">
                    <span className="font-medium">Frontage of Land:</span>{" "}
                    {application.frontage || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-700">
                    <span className="font-medium">Shape of Land:</span>{" "}
                    <span className="capitalize">
                      {application.shape || "N/A"}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-gray-700">
                    <span className="font-medium">
                      Physical Feature of Land:
                    </span>{" "}
                    <span className="capitalize">
                      {application.physicalFeature || "N/A"}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-gray-700">
                    <span className="font-medium">ROW:</span>{" "}
                    {application.row || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Rate Information */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
                Rate Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-700">
                    <span className="font-medium">Commercial Rate:</span>{" "}
                    {application.commercialRate || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-700">
                    <span className="font-medium">Government Rate:</span>{" "}
                    {application.governmentRate || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Access to Land */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
                Access to Land
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-700">
                    <span className="font-medium">Width as per Field:</span>{" "}
                    {application.accessWidthField || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-700">
                    <span className="font-medium">Width as per Blueprint:</span>{" "}
                    {application.accessWidthBlueprint || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Building Details */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
                Building Details
              </h2>
              <div>
                <p className="text-gray-700 whitespace-pre-line">
                  {application.buildingDetails ||
                    "No building details provided."}
                </p>
              </div>
            </div>

            {/* Valuation Summary */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
                Valuation Summary
              </h2>

              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3 text-gray-700">
                  Fair Market Value of Assets
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-gray-600">Land:</p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(application.fairMarketValueLand)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Building:</p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(application.fairMarketValueBuilding)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total:</p>
                      <p className="text-lg font-semibold text-blue-600">
                        {formatCurrency(application.fairMarketValueTotal)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3 text-gray-700">
                  Distress Value of Assets
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-gray-600">Land:</p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(application.distressValueLand)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Building:</p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(application.distressValueBuilding)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total:</p>
                      <p className="text-lg font-semibold text-red-600">
                        {formatCurrency(application.distressValueTotal)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Attachments */}
            {application.attachments && application.attachments.length > 0 && (
              <div className={`mb-8 ${isPrinting ? "hidden" : ""}`}>
                <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
                  Attachments
                </h2>
                <ul className="list-disc pl-5">
                  {application.attachments.map((attachment, index) => (
                    <li key={index} className="mb-2">
                      <a
                        href={`http://localhost:5000/${attachment.path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {attachment.filename}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Footer */}
            <div className="mt-12 pt-6 border-t text-center text-gray-500 text-sm">
              <p>
                This is an official valuation report generated by Ajima Design &
                Construction.
              </p>
              <p>Generated on: {new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white;
            font-size: 12pt;
          }
          nav,
          button,
          a {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:rounded-none {
            border-radius: 0 !important;
          }
          .print\\:py-0 {
            padding-top: 0 !important;
            padding-bottom: 0 !important;
          }
          .print\\:px-0 {
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
          .print\\:max-w-none {
            max-width: none !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
