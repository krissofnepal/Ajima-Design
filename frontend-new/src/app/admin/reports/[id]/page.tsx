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
  summary?: string;
  letter?: string;
  acceptance?: string;
  legalAspect?: string;
  buildingDetailsExtended?: {
    type?: string;
    age?: string;
    condition?: string;
    specifications?: string;
  };
  methodOfValuation?: string;
  assumptions?: string;
  observations?: string;
  bankName?: string;
  bankBranch?: string;
  bankAddress?: string;
  tableOfContents?: {
    [key: string]: "Enclosed" | "N.A.";
  };
  supportingDocuments?: {
    [key: string]: "Enclosed" | "N.A.";
  };
}

// Tab type definition
type TabType =
  | "cover"
  | "summary"
  | "letter"
  | "acceptance"
  | "details"
  | "legal"
  | "building"
  | "method"
  | "assumptions"
  | "observations";

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
  const [activeTab, setActiveTab] = useState<TabType>("cover");

  // Add print-specific styles
  const printStyles = `
    @media print {
      @page {
        size: A4;
        margin: 20mm;
      }
      
      body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        font-family: Arial, sans-serif;
      }

      .print-content {
        width: 210mm;
        min-height: 297mm;
        padding: 20mm;
        margin: 0 auto;
        font-family: Arial, sans-serif;
        border: none !important;
        box-shadow: none !important;
      }

      .no-print {
        display: none !important;
      }

      .page-break {
        page-break-after: always;
      }

      .no-print-column {
        display: none !important;
      }
      
      table {
        width: 100%;
        border-collapse: collapse;
        font-family: Arial, sans-serif;
      }
      
      th, td {
        font-family: Arial, sans-serif;
      }
      
      p, h1, h2, h3, h4, h5, h6, span, div {
        font-family: Arial, sans-serif;
      }
      
      .toc-section {
        page-break-before: always;
      }
      
      /* Hide unwanted lines */
      .bg-white {
        box-shadow: none !important;
        border: none !important;
      }
      
      .shadow-md, .shadow-lg, .shadow {
        box-shadow: none !important;
      }
      
      .rounded-lg {
        border-radius: 0 !important;
      }
      
      /* Ensure clean printing */
      * {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  `;

  // Bank information state
  const [bankName, setBankName] = useState("NABIL BANK LIMITED");
  const [bankBranch, setBankBranch] = useState("Satdobato, Lalitpur");
  const [bankAddress, setBankAddress] = useState("");
  const [copyType, setCopyType] = useState<"Bank" | "Customer">("Bank");

  // Table of contents state
  const [tocItems, setTocItems] = useState({
    "Valuation certificate": "Enclosed",
    "Summary of the Property Valuation": "Enclosed",
    "Details Report of the Property Valuation": "Enclosed",
    "Land Value Calculation": "Enclosed",
    "Building Value Calculation": "Enclosed",
    "Valuation of the Property": "Enclosed",
    "Details of the Building Property": "Enclosed",
    "Method of Valuation": "Enclosed",
    "Assumptions and Special Assumptions": "Enclosed",
    "Remarks / Observations and Limiting Conditions": "Enclosed",
    Photos: "Enclosed",
    Drawing: "Enclosed",
    "Supporting Documents": "Enclosed",
  });

  // Supporting documents state
  const [docItems, setDocItems] = useState({
    Lalpurja: "Enclosed",
    Citizenship: "Enclosed",
    "Tax Revenue Receipt": "Enclosed",
    "Land Boundary Letter": "Enclosed",
    "Land Registration Paper": "Enclosed",
    "Srestha / Plot Register Uttar": "N.A.",
    "Firm Registration": "N.A.",
    "PAN/VAT": "N.A.",
    "Municipal / V.D.C. Approved Drawings": "Enclosed",
    "Construction Completion Certificate": "Enclosed",
    Napimap: "Enclosed",
    Others: "Enclosed",
  });

  // Define the tabs array
  const tabs: Array<{ id: TabType; label: string }> = [
    { id: "cover", label: "Cover Page" },
    { id: "summary", label: "Summary" },
    { id: "letter", label: "Letter" },
    { id: "acceptance", label: "Acceptance" },
    { id: "details", label: "Details" },
    { id: "legal", label: "Legal Aspect" },
    { id: "building", label: "Building Details" },
    { id: "method", label: "Method of Valuation" },
    { id: "assumptions", label: "Assumptions" },
    { id: "observations", label: "Observations" },
  ];

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
          const adminEndpoint = `https://ajima-design.onrender.com/api/admin/applications/${params.id}`;
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

            const regularEndpoint = `https://ajima-design.onrender.com/api/applications/${params.id}`;
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
  const formatDate = (dateString: string, format?: string) => {
    const date = new Date(dateString);

    if (format === "MM / DD / YYYY") {
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const year = date.getFullYear();
      return `${month} / ${day} / ${year}`;
    }

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
        `https://ajima-design.onrender.com/api/admin/applications/${application._id}/status`,
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
          `https://ajima-design.onrender.com/api/applications/${application._id}/status`,
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

    // Apply font styles to ensure consistency before printing
    if (reportRef.current) {
      const allTextElements = reportRef.current.querySelectorAll(
        "p, h1, h2, h3, h4, h5, h6, span, td, th, div"
      );
      allTextElements.forEach((el) => {
        (el as HTMLElement).style.fontFamily = "Arial, sans-serif";
      });

      // Hide elements that should not appear in the print
      const actionColumns =
        reportRef.current.querySelectorAll(".no-print-column");
      const bankInfoForm = reportRef.current.querySelector(".bank-info-form");

      actionColumns.forEach((el) => {
        (el as HTMLElement).style.display = "none";
      });

      if (bankInfoForm) {
        (bankInfoForm as HTMLElement).style.display = "none";
      }
    }

    setTimeout(() => {
      window.print();

      // Restore elements after printing
      setTimeout(() => {
        if (reportRef.current) {
          const actionColumns =
            reportRef.current.querySelectorAll(".no-print-column");
          const bankInfoForm =
            reportRef.current.querySelector(".bank-info-form");

          actionColumns.forEach((el) => {
            (el as HTMLElement).style.display = "";
          });

          if (bankInfoForm) {
            (bankInfoForm as HTMLElement).style.display = "";
          }
        }
        setIsPrinting(false);
      }, 500);
    }, 300);
  };

  // Handle PDF download
  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;

    setIsGeneratingPDF(true);

    try {
      // Create PDF document with A4 dimensions
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // First, generate the first page
      const firstPageElement = reportRef.current.cloneNode(true) as HTMLElement;

      // Add print-specific styles directly to the cloned element
      const firstPageStyle = document.createElement("style");
      firstPageStyle.textContent = `
        @page {
          size: A4;
          margin: 20mm;
        }
        
        body {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          font-family: Arial, sans-serif;
        }

        .print-content {
          width: 210mm;
          min-height: 297mm;
          padding: 20mm;
          margin: 0 auto;
          font-family: Arial, sans-serif;
        }

        .no-print, .no-print-column {
          display: none !important;
        }

        .page-break {
          page-break-after: always;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          font-family: Arial, sans-serif;
        }
        
        th, td {
          font-family: Arial, sans-serif;
        }
      `;
      firstPageElement.appendChild(firstPageStyle);
      document.body.appendChild(firstPageElement);

      // Hide elements that should not appear in the PDF
      const actionColumns =
        firstPageElement.querySelectorAll(".no-print-column");
      const bankInfoForm = firstPageElement.querySelector(".bank-info-form");
      const tocSection = firstPageElement.querySelector(".toc-section");

      actionColumns.forEach((el) => {
        (el as HTMLElement).style.display = "none";
      });

      if (bankInfoForm) {
        (bankInfoForm as HTMLElement).style.display = "none";
      }

      // Hide TOC section for first page
      if (tocSection) {
        (tocSection as HTMLElement).style.display = "none";
      }

      // Position the element off-screen
      firstPageElement.style.position = "absolute";
      firstPageElement.style.left = "-9999px";

      // Apply font styles to ensure consistency
      const allTextElements = firstPageElement.querySelectorAll(
        "p, h1, h2, h3, h4, h5, h6, span, td, th, div"
      );
      allTextElements.forEach((el) => {
        (el as HTMLElement).style.fontFamily = "Arial, sans-serif";
      });

      // Generate first page with higher quality
      const firstPageCanvas = await html2canvas(firstPageElement, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      // Add first page to PDF
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const firstPageImgData = firstPageCanvas.toDataURL("image/jpeg", 1.0);
      pdf.addImage(firstPageImgData, "JPEG", 0, 0, imgWidth, pageHeight);

      // Clean up first page element
      document.body.removeChild(firstPageElement);

      // Now, generate the second page with just the TOC
      const secondPageElement = reportRef.current.cloneNode(
        true
      ) as HTMLElement;

      // Add print-specific styles directly to the cloned element
      const secondPageStyle = document.createElement("style");
      secondPageStyle.textContent = firstPageStyle.textContent; // Use the same styles
      secondPageElement.appendChild(secondPageStyle);
      document.body.appendChild(secondPageElement);

      // Hide everything except TOC section
      const contentToHide = secondPageElement.querySelectorAll(
        ".print-content > *:not(.toc-section):not(.page-break)"
      );
      contentToHide.forEach((el) => {
        (el as HTMLElement).style.display = "none";
      });

      // Make sure TOC section is visible
      const secondPageToc = secondPageElement.querySelector(".toc-section");
      if (secondPageToc) {
        (secondPageToc as HTMLElement).style.display = "block";
        (secondPageToc as HTMLElement).style.marginTop = "0";

        // Apply font styles to ensure consistency
        const tocTextElements = secondPageToc.querySelectorAll(
          "p, h1, h2, h3, h4, h5, h6, span, td, th, div"
        );
        tocTextElements.forEach((el) => {
          (el as HTMLElement).style.fontFamily = "Arial, sans-serif";
        });
      }

      // Hide action columns in TOC
      const tocActionColumns =
        secondPageElement.querySelectorAll(".no-print-column");
      tocActionColumns.forEach((el) => {
        (el as HTMLElement).style.display = "none";
      });

      // Position the element off-screen
      secondPageElement.style.position = "absolute";
      secondPageElement.style.left = "-9999px";

      // Generate second page with higher quality
      const secondPageCanvas = await html2canvas(secondPageElement, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      // Add second page to PDF
      pdf.addPage();
      const secondPageImgData = secondPageCanvas.toDataURL("image/jpeg", 1.0);
      pdf.addImage(secondPageImgData, "JPEG", 0, 0, imgWidth, pageHeight);

      // Clean up second page element
      document.body.removeChild(secondPageElement);

      // Save the PDF
      pdf.save(`valuation-report-${application?.landPlotNo || "download"}.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Handle table of contents toggle
  const handleTocToggle = (key: string) => {
    setTocItems((prev) => ({
      ...prev,
      [key]: prev[key] === "Enclosed" ? "N.A." : "Enclosed",
    }));
  };

  // Handle supporting documents toggle
  const handleDocToggle = (key: string) => {
    setDocItems((prev) => ({
      ...prev,
      [key]: prev[key] === "Enclosed" ? "N.A." : "Enclosed",
    }));
  };

  // Render cover page
  const renderCoverPage = () => {
    if (!application) return null;

    return (
      <div className="bg-white p-8 rounded-lg shadow-md print-content">
        <style>{printStyles}</style>

        {/* Bank Information Form - Only show in edit mode */}
        <div
          className={`mb-8 p-4 bg-gray-50 rounded-lg bank-info-form ${
            isPrinting ? "hidden" : ""
          }`}
        >
          <h3 className="text-lg font-semibold mb-4">Bank Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Branch
              </label>
              <input
                type="text"
                value={bankBranch}
                onChange={(e) => setBankBranch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Address
              </label>
              <input
                type="text"
                value={bankAddress}
                onChange={(e) => setBankAddress(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Copy Type Selector */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Copy Type
            </label>
            <select
              value={copyType}
              onChange={(e) =>
                setCopyType(e.target.value as "Bank" | "Customer")
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="Bank">Bank COPY</option>
              <option value="Customer">Customer COPY</option>
            </select>
          </div>
        </div>

        {/* Copy Indicator */}
        <div className="text-right mb-4">
          <div className="inline-block border-2 border-blue-800 border-dashed px-4 py-1">
            <p className="font-bold text-blue-800">{copyType} COPY</p>
          </div>
        </div>

        {/* Restricted Use Notice */}
        <div className="text-center mb-6">
          <p className="text-lg font-bold">RESTRICTED USE</p>
        </div>

        {/* Report Title */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-8">
            FIXED ASSET VALUATION REPORT
          </h1>

          <p className="text-lg mb-6">For</p>

          <h2 className="text-2xl font-bold mb-1">{bankName}</h2>
          <p className="text-lg">{bankBranch}</p>
          {bankAddress && <p className="text-lg">{bankAddress}</p>}
        </div>

        {/* Property Details Table */}
        <div className="mb-12 space-y-2">
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-3 font-bold">Type of Property</div>
            <div className="col-span-1 text-center">:</div>
            <div className="col-span-8">Land and Building</div>
          </div>

          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-3 font-bold">Borrower</div>
            <div className="col-span-1 text-center">:</div>
            <div className="col-span-8">{application.borrowerName}</div>
          </div>

          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-3 font-bold">Address</div>
            <div className="col-span-1 text-center">:</div>
            <div className="col-span-8">{application.locationCoordinate}</div>
          </div>

          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-3 font-bold">Contact No.</div>
            <div className="col-span-1 text-center">:</div>
            <div className="col-span-8">-</div>
          </div>
        </div>

        {/* Owner Details */}
        <div className="mb-12 space-y-2">
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-3 font-bold">Owner of the Property</div>
            <div className="col-span-1 text-center">:</div>
            <div className="col-span-8">{application.ownerName}</div>
          </div>

          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-3 font-bold">
              Present Location of Property
            </div>
            <div className="col-span-1 text-center">:</div>
            <div className="col-span-8">{application.locationCoordinate}</div>
          </div>

          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-3 font-bold">
              Previous Location of Property
            </div>
            <div className="col-span-1 text-center">:</div>
            <div className="col-span-8">-</div>
          </div>
        </div>

        {/* Plot Details */}
        <div className="mb-12 space-y-2">
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-3 font-bold">Plot Nos.</div>
            <div className="col-span-1 text-center">:</div>
            <div className="col-span-8">{application.landPlotNo}</div>
          </div>

          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-3 font-bold">Total Area of The Land</div>
            <div className="col-span-1 text-center">:</div>
            <div className="col-span-8">{application.totalAreaLalpurja}</div>
          </div>

          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-3 font-bold pl-8">Plot No.</div>
            <div className="col-span-1 text-center">:</div>
            <div className="col-span-2">{application.landPlotNo}</div>
            <div className="col-span-1 text-center">:</div>
            <div className="col-span-2">{application.areaForValuation}</div>
            <div className="col-span-3">Sq.m</div>
          </div>
        </div>

        {/* Report Date */}
        <div className="mb-12 space-y-2">
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-3 font-bold">Date of the Report</div>
            <div className="col-span-1 text-center">:</div>
            <div className="col-span-8">
              {formatDate(application.date, "MM / DD / YYYY")}
            </div>
          </div>
        </div>

        {/* Prepared By */}
        <div className="mt-16 border-t pt-4">
          <p className="font-bold">Prepared by:</p>
          <p>Ajima Design And Construction Pvt. Ltd.</p>
          <p>Suryabinayak-4, Bhaktapur</p>
          <p>Tel. No.: 9851160726, 9802060726</p>
          <p>Email: Ajimadesign@gmail.com</p>
        </div>

        {/* Page Break before Table of Contents */}
        <div className="page-break"></div>

        {/* Table of Contents Section - This will be on the second page */}
        <div className="toc-section">
          {/* Table of Contents with Toggle Buttons */}
          <div className="mt-16 text-center">
            <div className="inline-block border-2 border-black px-12 py-2">
              <p className="font-bold text-xl">TABLE OF CONTENTS</p>
            </div>
          </div>

          {/* Contents Table with Toggle Buttons */}
          <div className="mt-6 border border-black">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-black">
                  <th className="border-r border-black p-2 w-16 text-left">
                    S.N.
                  </th>
                  <th className="border-r border-black p-2 text-left">
                    Description
                  </th>
                  <th className="border-r border-black p-2 text-center w-32">
                    Status
                  </th>
                  <th className="p-2 text-center w-32 no-print-column">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(tocItems).map(([key, value], index) => (
                  <tr key={key} className="border-b border-black">
                    <td className="border-r border-black p-2">
                      {String.fromCharCode(65 + index)}
                    </td>
                    <td className="border-r border-black p-2">{key}</td>
                    <td className="border-r border-black p-2 text-center">
                      <span
                        className={
                          value === "Enclosed"
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {value}
                      </span>
                    </td>
                    <td className="p-2 text-center no-print-column">
                      <button
                        onClick={() => handleTocToggle(key)}
                        className={`px-3 py-1 rounded text-sm font-medium ${
                          value === "Enclosed"
                            ? "bg-red-100 text-red-600 hover:bg-red-200"
                            : "bg-green-100 text-green-600 hover:bg-green-200"
                        }`}
                      >
                        {value === "Enclosed" ? "Mark N.A." : "Mark Enclosed"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Supporting Documents Table with Toggle Buttons */}
          <div className="mt-6 border border-black">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-black">
                  <th className="border-r border-black p-2 w-16 text-left">
                    S.N.
                  </th>
                  <th className="border-r border-black p-2 text-left">
                    Documents
                  </th>
                  <th className="border-r border-black p-2 text-center w-32">
                    Status
                  </th>
                  <th className="p-2 text-center w-32 no-print-column">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(docItems).map(([key, value], index) => (
                  <tr key={key} className="border-b border-black">
                    <td className="border-r border-black p-2">
                      {String.fromCharCode(97 + index)}
                    </td>
                    <td className="border-r border-black p-2">{key}</td>
                    <td className="border-r border-black p-2 text-center">
                      <span
                        className={
                          value === "Enclosed"
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {value}
                      </span>
                    </td>
                    <td className="p-2 text-center no-print-column">
                      <button
                        onClick={() => handleDocToggle(key)}
                        className={`px-3 py-1 rounded text-sm font-medium ${
                          value === "Enclosed"
                            ? "bg-red-100 text-red-600 hover:bg-red-200"
                            : "bg-green-100 text-green-600 hover:bg-green-200"
                        }`}
                      >
                        {value === "Enclosed" ? "Mark N.A." : "Mark Enclosed"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Page Number */}
          <div className="text-right mt-4 text-gray-500">
            <p>Page 2</p>
          </div>
        </div>
      </div>
    );
  };

  // Render summary section
  const renderSummary = () => {
    if (!application) return null;

    return (
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Executive Summary</h2>
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Property Valuation</h3>
            <div className="space-y-4">
              <div>
                <p className="font-medium">Fair Market Value:</p>
                <p className="text-gray-600">
                  {formatCurrency(application.fairMarketValueTotal)}
                </p>
              </div>
              <div>
                <p className="font-medium">Land Value:</p>
                <p className="text-gray-600">
                  {formatCurrency(application.fairMarketValueLand)}
                </p>
              </div>
              <div>
                <p className="font-medium">Building Value:</p>
                <p className="text-gray-600">
                  {formatCurrency(application.fairMarketValueBuilding)}
                </p>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Property Details</h3>
            <div className="space-y-4">
              <div>
                <p className="font-medium">Total Area (Lalpurja):</p>
                <p className="text-gray-600">{application.totalAreaLalpurja}</p>
              </div>
              <div>
                <p className="font-medium">Area for Valuation:</p>
                <p className="text-gray-600">{application.areaForValuation}</p>
              </div>
              <div>
                <p className="font-medium">Location:</p>
                <p className="text-gray-600">
                  {application.locationCoordinate}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render letter section
  const renderLetter = () => {
    if (!application) return null;

    return (
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Letter of Transmittal</h2>
        <div className="space-y-6">
          <div className="text-right mb-8">
            <p>Date: {formatDate(application.date)}</p>
            <p>Ref No: {application._id}</p>
          </div>

          <div className="mb-8">
            <p className="font-medium">To,</p>
            <p>The Branch Manager</p>
            <p>Bank Name</p>
            <p>Branch Office</p>
          </div>

          <div className="mb-8">
            <p className="font-medium">Subject: Valuation Report</p>
            <p className="mt-4">Dear Sir/Madam,</p>
            <p className="mt-4">
              As per your request, we have conducted a detailed valuation of the
              property located at {application.locationCoordinate}, owned by{" "}
              {application.ownerName}. The valuation has been carried out in
              accordance with professional standards and practices.
            </p>
            <p className="mt-4">
              The fair market value of the property has been assessed at{" "}
              {formatCurrency(application.fairMarketValueTotal)}. This includes
              the land value of{" "}
              {formatCurrency(application.fairMarketValueLand)} and building
              value of {formatCurrency(application.fairMarketValueBuilding)}.
            </p>
            <p className="mt-4">
              The detailed analysis and supporting documentation are included in
              the following report.
            </p>
          </div>

          <div className="mt-12">
            <p>Yours sincerely,</p>
            <p className="mt-4">{application.user.username}</p>
            <p>Valuation Expert</p>
            <p>Ajima Design & Construction</p>
          </div>
        </div>
      </div>
    );
  };

  // Render acceptance section
  const renderAcceptance = () => {
    if (!application) return null;

    return (
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">
          Certificate of Acceptance
        </h2>
        <div className="space-y-6">
          <p>
            This is to certify that I/We have read and understood the contents
            of this valuation report prepared by Ajima Design & Construction for
            the property located at {application.locationCoordinate}.
          </p>

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Property Details:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Plot No: {application.landPlotNo}</li>
              <li>Owner: {application.ownerName}</li>
              <li>Total Area: {application.totalAreaLalpurja}</li>
              <li>
                Valuation Amount:{" "}
                {formatCurrency(application.fairMarketValueTotal)}
              </li>
            </ul>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-8">
            <div>
              <p className="font-medium mb-2">Client's Signature:</p>
              <div className="h-24 border-b border-gray-300"></div>
              <p className="mt-2">Date: _________________</p>
            </div>
            <div>
              <p className="font-medium mb-2">Witness Signature:</p>
              <div className="h-24 border-b border-gray-300"></div>
              <p className="mt-2">Date: _________________</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render details section (existing report content)
  const renderDetails = () => {
    if (!application) return null;

    return (
      <div className="bg-white p-8 rounded-lg shadow-md">
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
                <span className="font-medium">Land Plot No. (Kitta No.):</span>{" "}
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
                <span className="font-medium">Total Area as per Lalpurja:</span>{" "}
                {application.totalAreaLalpurja || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-gray-700">
                <span className="font-medium">Total Area as per Actual:</span>{" "}
                {application.totalAreaActual || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-gray-700">
                <span className="font-medium">Area for Valuation:</span>{" "}
                {application.areaForValuation || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Valuation Summary */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
            Valuation Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium mb-3">Fair Market Value</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Land:</span>{" "}
                    {formatCurrency(application.fairMarketValueLand)}
                  </p>
                  <p>
                    <span className="font-medium">Building:</span>{" "}
                    {formatCurrency(application.fairMarketValueBuilding)}
                  </p>
                  <p className="text-lg font-semibold text-blue-600">
                    <span className="font-medium">Total:</span>{" "}
                    {formatCurrency(application.fairMarketValueTotal)}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-3">Distress Value</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Land:</span>{" "}
                    {formatCurrency(application.distressValueLand)}
                  </p>
                  <p>
                    <span className="font-medium">Building:</span>{" "}
                    {formatCurrency(application.distressValueBuilding)}
                  </p>
                  <p className="text-lg font-semibold text-red-600">
                    <span className="font-medium">Total:</span>{" "}
                    {formatCurrency(application.distressValueTotal)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render legal aspect section
  const renderLegal = () => {
    if (!application) return null;

    return (
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Legal Aspects</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Property Ownership</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p>
                <span className="font-medium">Owner's Name:</span>{" "}
                {application.ownerName}
              </p>
              <p>
                <span className="font-medium">Plot Number:</span>{" "}
                {application.landPlotNo}
              </p>
              <p>
                <span className="font-medium">Claimant Period:</span>{" "}
                {application.claimantPeriod}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Property Boundaries</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p>
                <span className="font-medium">Total Area (Lalpurja):</span>{" "}
                {application.totalAreaLalpurja}
              </p>
              <p>
                <span className="font-medium">Actual Area:</span>{" "}
                {application.totalAreaActual}
              </p>
              <p>
                <span className="font-medium">ROW Deduction:</span>{" "}
                {application.deductionROW}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Access Rights</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p>
                <span className="font-medium">Field Access Width:</span>{" "}
                {application.accessWidthField}
              </p>
              <p>
                <span className="font-medium">Blueprint Access Width:</span>{" "}
                {application.accessWidthBlueprint}
              </p>
              <p>
                <span className="font-medium">ROW:</span> {application.row}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render building details section
  const renderBuilding = () => {
    if (!application) return null;

    return (
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Building Details</h2>
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <pre className="whitespace-pre-wrap text-gray-700">
              {application.buildingDetails || "No building details provided."}
            </pre>
          </div>

          {application.buildingDetailsExtended && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">
                Additional Building Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="font-medium">Building Type:</p>
                  <p className="text-gray-700">
                    {application.buildingDetailsExtended.type || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Age of Building:</p>
                  <p className="text-gray-700">
                    {application.buildingDetailsExtended.age || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Building Condition:</p>
                  <p className="text-gray-700">
                    {application.buildingDetailsExtended.condition || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Specifications:</p>
                  <p className="text-gray-700">
                    {application.buildingDetailsExtended.specifications ||
                      "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render method of valuation section
  const renderMethod = () => {
    if (!application) return null;

    return (
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Method of Valuation</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Rate Analysis</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p>
                <span className="font-medium">Commercial Rate:</span>{" "}
                {application.commercialRate}
              </p>
              <p>
                <span className="font-medium">Government Rate:</span>{" "}
                {application.governmentRate}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Valuation Approach</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="whitespace-pre-wrap">
                {application.methodOfValuation ||
                  `The valuation has been carried out using standard methods considering:
                - Market comparison approach
                - Cost approach for buildings
                - Location and accessibility factors
                - Current market trends and conditions`}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render assumptions and observations section
  const renderAssumptions = () => {
    if (!application) return null;

    return (
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">
          Assumptions and Observations
        </h2>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold mb-3">Physical Features</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p>
                <span className="font-medium">Shape:</span> {application.shape}
              </p>
              <p>
                <span className="font-medium">Physical Features:</span>{" "}
                {application.physicalFeature}
              </p>
              <p>
                <span className="font-medium">Frontage:</span>{" "}
                {application.frontage}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Assumptions</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="whitespace-pre-wrap">
                {application.assumptions ||
                  `Standard assumptions applied in this valuation:
                1. The property title is valid and marketable
                2. All information provided is accurate and complete
                3. No encumbrances exist other than those noted
                4. The property complies with all relevant regulations`}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Observations</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="whitespace-pre-wrap">
                {application.observations ||
                  `Key observations during the valuation process:
                1. Property location and accessibility
                2. Current condition and maintenance
                3. Development potential
                4. Market conditions and trends`}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Update the renderContent function to include all sections
  const renderContent = () => {
    switch (activeTab) {
      case "cover":
        return renderCoverPage();
      case "summary":
        return renderSummary();
      case "letter":
        return renderLetter();
      case "acceptance":
        return renderAcceptance();
      case "details":
        return renderDetails();
      case "legal":
        return renderLegal();
      case "building":
        return renderBuilding();
      case "method":
        return renderMethod();
      case "assumptions":
        return renderAssumptions();
      default:
        return <div>Content coming soon...</div>;
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
      {/* Navigation - Hide during printing */}
      <nav className={`bg-gray-800 text-white shadow-md no-print`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/reports"
                className="flex items-center text-gray-300 hover:text-white transition-colors"
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
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to Reports
              </Link>
              <span className="text-gray-400">/</span>
              <Link
                href="/admin/dashboard"
                className="text-gray-300 hover:text-white"
              >
                Dashboard
              </Link>
              <span className="text-gray-400">/</span>
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
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div
        className={`max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 ${
          isPrinting ? "p-0 max-w-none" : ""
        }`}
      >
        {/* Tab Navigation - Hide during printing */}
        <div className={`mb-8 bg-white shadow rounded-lg no-print`}>
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-1 border-b border-gray-200 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 ${
                    activeTab === tab.id
                      ? "bg-white text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div
          className={`bg-white rounded-lg shadow-lg ${
            isPrinting ? "shadow-none" : ""
          }`}
          ref={reportRef}
        >
          {loading ? (
            <div className="flex justify-center items-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">
              <p className="text-xl font-semibold mb-2">Error</p>
              <p>{error}</p>
            </div>
          ) : (
            renderContent()
          )}
        </div>
      </div>
    </div>
  );
}
