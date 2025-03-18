"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Props {
  applicationId: string;
}

export default function EditApplicationForm({ applicationId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch application data
    const fetchApplication = async () => {
      try {
        // Get token from localStorage
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch(
          `https://ajima-design.onrender.com/api/applications/${applicationId}`,
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
        console.log("Application data:", data);

        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching application:", err);
        setError(err.message || "Failed to load application data");
        setLoading(false);
      }
    };

    fetchApplication();
  }, [applicationId, router]);

  if (loading) {
    return <div className="p-6 text-center">Loading application data...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-6">Edit Valuation Report</h2>
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <p className="text-yellow-700">
          This is a placeholder for the edit form. The actual form will be
          implemented soon.
        </p>
        <p className="text-yellow-700 mt-2">Application ID: {applicationId}</p>
      </div>

      <div className="flex justify-end mt-6">
        <button
          onClick={() =>
            router.push(`/dashboard/applications/${applicationId}`)
          }
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          View Report
        </button>
      </div>
    </div>
  );
}
