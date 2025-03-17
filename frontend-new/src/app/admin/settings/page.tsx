"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Settings {
  siteName: string;
  contactEmail: string;
  maintenanceMode: boolean;
  defaultCurrency: string;
  allowUserRegistration: boolean;
  requireEmailVerification: boolean;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    siteName: "Ajima Design & Construction",
    contactEmail: "info@ajimadesign.com",
    maintenanceMode: false,
    defaultCurrency: "NPR",
    allowUserRegistration: true,
    requireEmailVerification: true,
  });

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

      // Fetch settings
      const fetchSettings = async () => {
        try {
          // This would normally fetch from an API
          // For now, we'll just use the default settings
          setLoading(false);
        } catch (err: any) {
          console.error("Error fetching settings:", err);
          setError(err.message || "An error occurred while fetching settings");
          setLoading(false);
        }
      };

      fetchSettings();
    } catch (error) {
      console.error("Error parsing user data:", error);
      router.push("/login");
    }
  }, [router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    setSettings({
      ...settings,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // This would normally send to an API
      // For now, we'll just simulate a successful save
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("Settings saved successfully!");
    } catch (err: any) {
      console.error("Error saving settings:", err);
      alert("Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-gray-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-2xl font-bold text-white">
                Admin Dashboard
              </Link>
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-300">System Settings</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-gray-300 hover:text-white"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            System Settings
          </h1>

          {/* Notice about placeholder */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  This is a placeholder settings page. Changes made here will
                  not be saved to the backend until the API is implemented.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">General Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="siteName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Site Name
                    </label>
                    <input
                      type="text"
                      id="siteName"
                      name="siteName"
                      value={settings.siteName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contactEmail"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Contact Email
                    </label>
                    <input
                      type="email"
                      id="contactEmail"
                      name="contactEmail"
                      value={settings.contactEmail}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="defaultCurrency"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Default Currency
                    </label>
                    <select
                      id="defaultCurrency"
                      name="defaultCurrency"
                      value={settings.defaultCurrency}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="NPR">Nepalese Rupee (NPR)</option>
                      <option value="USD">US Dollar (USD)</option>
                      <option value="EUR">Euro (EUR)</option>
                      <option value="GBP">British Pound (GBP)</option>
                      <option value="INR">Indian Rupee (INR)</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="maintenanceMode"
                      name="maintenanceMode"
                      checked={settings.maintenanceMode}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="maintenanceMode"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Maintenance Mode
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">User Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="allowUserRegistration"
                      name="allowUserRegistration"
                      checked={settings.allowUserRegistration}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="allowUserRegistration"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Allow User Registration
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="requireEmailVerification"
                      name="requireEmailVerification"
                      checked={settings.requireEmailVerification}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="requireEmailVerification"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Require Email Verification
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">
                  System Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Application Version
                    </p>
                    <p className="text-gray-900">1.0.0</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Server Environment
                    </p>
                    <p className="text-gray-900">Production</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Database Status
                    </p>
                    <p className="text-green-600">Connected</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Last Backup
                    </p>
                    <p className="text-gray-900">Never</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isSaving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
