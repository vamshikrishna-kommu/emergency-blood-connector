// ============================================================
// pages/AdminDashboard.jsx — Admin Control Panel
// ============================================================
// Only accessible to ADMIN role users.
// Three tabs:
//   Overview  — Platform statistics (donor/receiver counts, request stats)
//   Users     — All registered non-admin users with activate/deactivate control
//   Requests  — All requests (including closed/fulfilled) with delete option

import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-hot-toast";
import {
  Shield, Users, AlertTriangle, CheckCircle, Trash2, Droplets, Heart
} from "lucide-react";

const TABS = ["Overview", "Users", "Requests"];

/**
 * Maps a color name to a static Tailwind class.
 *
 * WHY: Dynamic Tailwind classes like `text-${color}-500` are purged
 * in production builds because the Tailwind scanner can't find them.
 * This lookup table uses complete static strings that Tailwind keeps.
 */
const COLOR_CLASS_MAP = {
  red: "text-red-500",
  blue: "text-blue-500",
  orange: "text-orange-500",
  green: "text-green-500",
};

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all admin data in parallel on mount
  useEffect(() => {
    fetchAll();
  }, []);

  /**
   * Loads all three data sets (stats, users, requests) simultaneously
   * using Promise.all to minimize total wait time.
   */
  const fetchAll = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, requestsRes] = await Promise.all([
        axiosInstance.get("/api/admin/stats"),
        axiosInstance.get("/api/admin/users"),
        axiosInstance.get("/api/admin/requests"),
      ]);
      setStats(statsRes.data.payload);
      setUsers(usersRes.data.payload);
      setRequests(requestsRes.data.payload);
    } catch (err) {
      toast.error("Failed to load admin data. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Toggles a user's isActive status.
   * Optimistically updates the UI, then confirms with the server.
   */
  const toggleUserStatus = async (userId, currentStatus) => {
    const newStatus = !currentStatus;
    try {
      await axiosInstance.patch(`/api/admin/users/${userId}/status`, { isActive: newStatus });
      // Update local state without re-fetching the full list
      setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, isActive: newStatus } : u));
      toast.success(`User ${newStatus ? "activated" : "deactivated"} successfully.`);
    } catch (err) {
      toast.error("Failed to update user status.");
    }
  };

  /**
   * Permanently deletes a blood request (admin force-delete).
   * Asks for confirmation before proceeding.
   */
  const deleteRequest = async (id) => {
    if (!window.confirm("Permanently delete this request?")) return;
    try {
      await axiosInstance.delete(`/api/admin/requests/${id}`);
      setRequests((prev) => prev.filter((r) => r._id !== id));
      toast.success("Request deleted.");
    } catch (err) {
      toast.error("Failed to delete request.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-fade-in">

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Shield className="w-7 h-7 text-purple-600" />
          Admin Control Panel
        </h1>
        <p className="text-gray-500 mt-1">Manage the Emergency Blood Connector platform</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-8 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* ── Overview Tab ──────────────────────────────────── */}
      {!loading && activeTab === "Overview" && stats && (
        <div>
          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[
              { label: "Total Donors", value: stats.totalDonors, icon: <Heart className="w-5 h-5" />, color: "red" },
              { label: "Receivers", value: stats.totalReceivers, icon: <Users className="w-5 h-5" />, color: "blue" },
              { label: "Open Requests", value: stats.openRequests, icon: <AlertTriangle className="w-5 h-5" />, color: "orange" },
              { label: "Critical", value: stats.criticalRequests, icon: <AlertTriangle className="w-5 h-5" />, color: "red" },
              { label: "Fulfilled", value: stats.fulfilledRequests, icon: <CheckCircle className="w-5 h-5" />, color: "green" },
            ].map((item) => (
              <div key={item.label} className="card text-center">
                {/* Static color class from lookup map — avoids Tailwind purge issue */}
                <div className={`flex justify-center mb-2 ${COLOR_CLASS_MAP[item.color]}`}>
                  {item.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900">{item.value}</div>
                <div className="text-xs text-gray-500 mt-1">{item.label}</div>
              </div>
            ))}
          </div>

          {/* Summary card */}
          <div className="card bg-purple-50 border-purple-100">
            <h3 className="font-bold text-purple-800 mb-3">📊 Platform Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
              <p>👥 Total users: <strong>{stats.totalDonors + stats.totalReceivers}</strong></p>
              <p>🩸 Active requests: <strong>{stats.openRequests}</strong></p>
              <p>✅ Fulfilled: <strong>{stats.fulfilledRequests}</strong></p>
            </div>
          </div>
        </div>
      )}

      {/* ── Users Tab ─────────────────────────────────────── */}
      {!loading && activeTab === "Users" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800">Registered Users ({users.length})</h2>
          </div>

          <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {["Name", "Email", "Role", "Blood", "City", "Status", "Action"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{user.name}</td>
                      <td className="px-4 py-3 text-gray-500">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          user.role === "DONOR" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {user.bloodGroup
                          ? <span className="font-bold text-red-600">{user.bloodGroup}</span>
                          : <span className="text-gray-400">—</span>
                        }
                      </td>
                      <td className="px-4 py-3 text-gray-500">{user.city || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleUserStatus(user._id, user.isActive)}
                          className={`text-xs px-3 py-1.5 rounded-lg font-medium ${
                            user.isActive
                              ? "bg-red-50 text-red-700 hover:bg-red-100"
                              : "bg-green-50 text-green-700 hover:bg-green-100"
                          }`}
                        >
                          {user.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Requests Tab ──────────────────────────────────── */}
      {!loading && activeTab === "Requests" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800">All Blood Requests ({requests.length})</h2>
          </div>

          <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {["Requester", "Blood", "Hospital", "City", "Urgency", "Status", "Action"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {requests.map((req) => (
                    <tr key={req._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{req.requesterName}</td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-red-600">{req.bloodGroup}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{req.hospital}</td>
                      <td className="px-4 py-3 text-gray-500">{req.city}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          req.urgency === "critical" ? "urgency-critical" :
                          req.urgency === "urgent" ? "urgency-urgent" : "urgency-normal"
                        }`}>
                          {req.urgency.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          req.status === "open" ? "bg-blue-100 text-blue-700" :
                          req.status === "fulfilled" ? "bg-green-100 text-green-700" :
                          "bg-gray-100 text-gray-600"
                        }`}>
                          {req.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => deleteRequest(req._id)}
                          className="flex items-center gap-1 text-xs px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 font-medium"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
