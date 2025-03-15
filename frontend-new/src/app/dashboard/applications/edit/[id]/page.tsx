"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import Link from "next/link";
import EditApplicationForm from "../../../../../components/EditApplicationForm";

export default function EditApplicationPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    setLoading(false);
  }, [router]);

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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-md">
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
              <span className="text-gray-700">Edit Report</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href={`/dashboard/applications/${params.id}`}
                className="text-gray-600 hover:text-gray-900"
              >
                View Report
              </Link>
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
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-semibold mb-6">Edit Valuation Report</h1>
          <EditApplicationForm applicationId={params.id as string} />
        </div>
      </main>
    </div>
  );
}
