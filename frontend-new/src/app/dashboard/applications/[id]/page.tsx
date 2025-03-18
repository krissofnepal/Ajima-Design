"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useParams } from "next/navigation";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

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
  attachments?: Array<{
    filename: string;
    path: string;
    mimetype: string;
  }>;
}

export default function ApplicationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const reportRef = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // Fetch application details
    const fetchApplication = async () => {
      try {
        const response = await fetch(
          `https://ajima-design.onrender.com/api/applications/${params.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch application details");
        }

        const data = await response.json();
        if (!data || !data.application) {
          throw new Error("Invalid response data");
        }

        console.log("Application data:", data.application);
        setApplication(data.application);
      } catch (err: any) {
        console.error("Error fetching application:", err);
        setError(err.message || "An error occurred while fetching the report");
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
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
      <nav className={`bg-white shadow-md ${isPrinting ? "hidden" : ""}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link
                href="/dashboard"
                className="text-2xl font-bold text-blue-600"
              >
                Dashboard
              </Link>
              <span className="mx-2 text-gray-400">/</span>
              <Link
                href="/dashboard/applications"
                className="text-gray-700 hover:text-gray-900"
              >
                Valuation Reports
              </Link>
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-700">Report Details</span>
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
                href="/dashboard/applications"
                className="text-gray-600 hover:text-gray-900"
              >
                Back to Reports
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8 print:py-0 print:px-0 print:max-w-none">
        <div className="px-4 py-6 sm:px-0 print:px-0 print:py-0">
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
      </main>

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
