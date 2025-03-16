"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
  fairMarketValueTotal: number;
  distressValueTotal: number;
  status: string;
  createdAt: string;
  user?: User;
}

export default function ApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<
    Application[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [userFilter, setUserFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [uniqueUsers, setUniqueUsers] = useState<
    { id: string; username: string; email: string }[]
  >([]);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // Get user data to check if admin
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
      const userIsAdmin = userData.role === "admin";
      setIsAdmin(userIsAdmin);

      // Fetch applications - use admin endpoint if user is admin
      const fetchApplications = async () => {
        try {
          // Use different endpoints for admin and regular users
          const endpoint = userIsAdmin
            ? "http://localhost:5000/api/admin/applications" // Admin endpoint to fetch all reports
            : "http://localhost:5000/api/applications"; // Regular endpoint for user's own reports

          const response = await fetch(endpoint, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            // If admin endpoint returns 404 (not implemented yet), fall back to regular endpoint
            if (userIsAdmin && response.status === 404) {
              console.log(
                "Admin endpoint not available, falling back to regular endpoint"
              );
              const regularResponse = await fetch(
                "http://localhost:5000/api/applications",
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              if (!regularResponse.ok) {
                throw new Error("Failed to fetch applications");
              }

              return await regularResponse.json();
            }
            throw new Error("Failed to fetch applications");
          }

          return await response.json();
        } catch (err: any) {
          console.error("Error fetching applications:", err);
          setError(
            err.message || "An error occurred while fetching applications"
          );
          return null;
        }
      };

      const processApplications = async () => {
        try {
          const data = await fetchApplications();

          if (!data) {
            setLoading(false);
            return;
          }

          if (
            !data ||
            !Array.isArray(data.applications) ||
            data.applications.length === 0
          ) {
            // Only show placeholder data if explicitly requested
            if (userIsAdmin && false) {
              // Set to true to enable placeholder data
              console.log(
                "No applications returned for admin, showing placeholder data"
              );
              // Placeholder data code...
              // ...
            } else {
              setApplications([]);
              setFilteredApplications([]);
            }
            setLoading(false);
            return;
          }

          // Log the response data for debugging
          console.log("Applications response:", data);

          // Map applications with proper validation
          const mappedApplications = data.applications.map((app) => {
            // Ensure _id is present
            if (!app._id) {
              console.error("Application missing _id:", app);
            }

            return {
              ...app,
              _id: app._id || "unknown", // Fallback ID to prevent errors
              fairMarketValueTotal: parseFloat(app.fairMarketValueTotal) || 0,
              distressValueTotal: parseFloat(app.distressValueTotal) || 0,
              status: app.status || "pending",
            };
          });

          setApplications(mappedApplications);
          setFilteredApplications(mappedApplications);

          // Extract unique users for the filter dropdown if admin
          if (userIsAdmin) {
            const users = new Map();
            mappedApplications.forEach((app) => {
              if (app.user && app.user._id) {
                users.set(app.user._id, {
                  id: app.user._id,
                  username: app.user.username,
                  email: app.user.email,
                });
              }
            });
            setUniqueUsers(Array.from(users.values()));
          }
        } catch (error) {
          console.error("Error processing applications:", error);
        } finally {
          setLoading(false);
        }
      };

      processApplications();
    } catch (error) {
      console.error("Error parsing user data:", error);
      router.push("/login");
    }
  }, [router]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
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

  // Handle user filter change
  const handleUserFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = e.target.value;
    setUserFilter(userId);

    applyFilters(userId, statusFilter);
  };

  // Handle status filter change
  const handleStatusFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const status = e.target.value;
    setStatusFilter(status);

    applyFilters(userFilter, status);
  };

  // Apply both filters
  const applyFilters = (userId: string, status: string) => {
    let filtered = [...applications];

    // Apply user filter
    if (userId !== "all") {
      filtered = filtered.filter((app) => app.user && app.user._id === userId);
    }

    // Apply status filter
    if (status !== "all") {
      filtered = filtered.filter((app) => app.status === status);
    }

    setFilteredApplications(filtered);
  };

  // Handle status change for admin
  const handleAdminStatusChange = async (
    applicationId: string,
    newStatus: string
  ) => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      // Try the admin endpoint first
      const adminResponse = await fetch(
        `http://localhost:5000/api/admin/applications/${applicationId}/status`,
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

      // If admin endpoint fails, fall back to regular endpoint
      if (!adminResponse.ok) {
        console.log("Admin endpoint failed, falling back to regular endpoint");
        const regularResponse = await fetch(
          `http://localhost:5000/api/applications/${applicationId}/status`,
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

        // Update the application status in the UI
        setApplications(
          applications.map((app) =>
            app._id === applicationId ? { ...app, status: newStatus } : app
          )
        );
        setFilteredApplications(
          filteredApplications.map((app) =>
            app._id === applicationId ? { ...app, status: newStatus } : app
          )
        );

        alert("Status updated successfully (via regular endpoint)");
        return;
      }

      const data = await adminResponse.json();

      // Update the application status in the UI
      setApplications(
        applications.map((app) =>
          app._id === applicationId ? { ...app, status: newStatus } : app
        )
      );
      setFilteredApplications(
        filteredApplications.map((app) =>
          app._id === applicationId ? { ...app, status: newStatus } : app
        )
      );

      alert("Status updated successfully");
    } catch (err: any) {
      console.error("Error updating status:", err);
      alert("Failed to update status. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading...</div>
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
              <span className="text-gray-700">Valuation Reports</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/create-application"
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
              >
                Create New Valuation Report
              </Link>
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900"
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
          <h1 className="text-2xl font-semibold mb-6">
            {isAdmin ? "All Valuation Reports" : "My Valuation Reports"}
          </h1>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {isAdmin && (
            <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-400 text-blue-700 rounded">
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
                  <p className="text-sm">
                    <strong>Admin Notice:</strong> Fetching all reports from
                    MongoDB using the admin API. You are now viewing real data
                    from all users in the database. If no reports are shown, it
                    means there are no reports in the database yet.
                  </p>
                </div>
              </div>
            </div>
          )}

          {isAdmin && uniqueUsers.length > 0 && (
            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="userFilter"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Filter by User:
                </label>
                <select
                  id="userFilter"
                  value={userFilter}
                  onChange={handleUserFilterChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="all">All Users</option>
                  {uniqueUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.username} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="statusFilter"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Filter by Status:
                </label>
                <select
                  id="statusFilter"
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          )}

          {filteredApplications.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-500">
                {isAdmin
                  ? userFilter !== "all" || statusFilter !== "all"
                    ? `No valuation reports found matching the selected filters.`
                    : "There are no valuation reports in the system yet."
                  : "You haven't created any valuation reports yet."}
              </p>
              <Link
                href="/dashboard/create-application"
                className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
              >
                Create New Valuation Report
              </Link>
            </div>
          ) : (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Land Plot No.
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Borrower
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Owner
                    </th>
                    {isAdmin && (
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Created By
                      </th>
                    )}
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Market Value
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredApplications.map((application) => (
                    <tr key={application._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(application.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {application.landPlotNo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {application.borrowerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {application.ownerName}
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {application.user ? (
                            <span
                              className="cursor-help border-b border-dotted border-gray-500"
                              title={`Email: ${application.user.email}`}
                            >
                              {application.user.username}
                            </span>
                          ) : (
                            "Unknown"
                          )}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(application.fairMarketValueTotal)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            application.status
                          )}`}
                        >
                          {application.status.charAt(0).toUpperCase() +
                            application.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {isAdmin ? (
                            <Link
                              href={`/admin/reports/${application._id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View
                            </Link>
                          ) : (
                            <Link
                              href={`/dashboard/applications/${application._id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View
                            </Link>
                          )}
                          {application.status === "pending" && !isAdmin && (
                            <Link
                              href={`/dashboard/applications/edit/${application._id}`}
                              className="text-green-600 hover:text-green-900"
                            >
                              Edit
                            </Link>
                          )}
                          {isAdmin && (
                            <div className="relative ml-2">
                              <select
                                value={application.status}
                                onChange={(e) => {
                                  handleAdminStatusChange(
                                    application._id,
                                    e.target.value
                                  );
                                }}
                                className="text-sm border border-gray-300 rounded px-2 py-1"
                              >
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                              </select>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
