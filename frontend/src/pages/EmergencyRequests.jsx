// ============================================================
// pages/EmergencyRequests.jsx — Active Blood Requests
// ============================================================
// Shows all open blood requests sorted by urgency (critical first).
// Auto-refreshes every 30 seconds to show the latest requests.
//
// Donors: can view and contact hospitals
// Receivers/Admin: can mark requests as fulfilled or delete them

import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../store/authStore";
import { toast } from "react-hot-toast";
import {
  AlertTriangle, Clock, CheckCircle, Phone,
  Building2, MapPin, Droplets, Trash2, RefreshCw
} from "lucide-react";

/**
 * Maps urgency level to the correct CSS class name.
 * Using a function instead of template literals avoids
 * Tailwind purging dynamic class strings in production builds.
 */
function getUrgencyClass(urgency) {
  if (urgency === "critical") return "urgency-critical";
  if (urgency === "urgent") return "urgency-urgent";
  return "urgency-normal";
}

/** Returns a human-readable label with emoji for the urgency level */
function getUrgencyLabel(urgency) {
  if (urgency === "critical") return "🚨 CRITICAL";
  if (urgency === "urgent") return "⚠️ URGENT";
  return "ℹ️ NORMAL";
}

function EmergencyRequests() {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  /**
   * Fetches open blood requests from the API.
   * The backend already sorts by urgency; we re-sort client-side
   * to guarantee order after any local state updates.
   */
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/api/requests");

      // Sort: critical → urgent → normal
      const urgencyOrder = { critical: 1, urgent: 2, normal: 3 };
      const sorted = [...res.data.payload].sort(
        (a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
      );

      setRequests(sorted);
      setLastRefresh(new Date());
    } catch (err) {
      console.error("Failed to fetch requests:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and set up a 30-second auto-refresh interval
  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval); // cleanup on unmount
  }, []);

  /** Deletes a blood request (owner or admin only) */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this request?")) return;
    try {
      await axiosInstance.delete(`/api/requests/${id}`);
      toast.success("Request deleted.");
      setRequests((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete request");
    }
  };

  /** Marks a blood request as fulfilled (removes it from the open list) */
  const handleFulfill = async (id) => {
    try {
      await axiosInstance.patch(`/api/requests/${id}`, { status: "fulfilled" });
      toast.success("Request marked as fulfilled! 🎉");
      setRequests((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update request");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-fade-in">

      {/* Header with refresh button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-7 h-7 text-red-600" />
            Emergency Blood Requests
          </h1>
          <p className="text-gray-500 mt-1">Active requests sorted by urgency. Auto-refreshes every 30 seconds.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">Updated: {lastRefresh.toLocaleTimeString()}</span>
          <button
            onClick={fetchRequests}
            disabled={loading}
            className="btn-outline text-sm py-2 px-4 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Critical alert banner — shown when any critical requests exist */}
      {requests.some((r) => r.urgency === "critical") && (
        <div className="bg-red-600 text-white rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-bold">🚨 Critical Emergency!</p>
            <p className="text-sm text-red-100">
              {requests.filter((r) => r.urgency === "critical").length} critical request(s) need immediate attention.
            </p>
          </div>
        </div>
      )}

      {/* Loading spinner */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Request Cards Grid */}
      {!loading && requests.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((req) => {
            // BUG FIX: After .populate(), postedBy._id is a Mongoose ObjectId object.
            // Strict equality (===) fails between an object and a string.
            // .toString() converts both sides to strings for safe comparison.
            const isOwner =
              req.postedBy?._id?.toString() === currentUser?.id?.toString() ||
              req.postedBy?.toString() === currentUser?.id?.toString();
            const isAdmin = currentUser?.role === "ADMIN";

            return (
              <div
                key={req._id}
                className={`card relative overflow-hidden ${req.urgency === "critical" ? "ring-2 ring-red-400" : ""}`}
              >
                {/* Urgency colour bar at top of card */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                  req.urgency === "critical" ? "bg-red-500" :
                  req.urgency === "urgent" ? "bg-yellow-500" : "bg-green-500"
                }`} />

                <div className="mt-2">
                  {/* Urgency badge + blood group */}
                  <div className="flex items-start justify-between mb-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getUrgencyClass(req.urgency)}`}>
                      {getUrgencyLabel(req.urgency)}
                    </span>
                    <div className="blood-badge">{req.bloodGroup}</div>
                  </div>

                  {/* Requester name */}
                  <h3 className="font-bold text-gray-800 mb-1">{req.requesterName}</h3>

                  {/* Request details */}
                  <div className="space-y-1 mb-4">
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      {req.hospital}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      {req.city}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      {/* Clickable tel: link for mobile devices */}
                      <a href={`tel:${req.contact}`} className="text-red-600 font-medium hover:underline">
                        {req.contact}
                      </a>
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      {req.unitsRequired} unit(s) required
                    </p>
                  </div>

                  {/* Posted time */}
                  <p className="text-xs text-gray-400 mb-4 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Posted {new Date(req.createdAt).toLocaleString()}
                  </p>

                  {/* Owner/admin action buttons */}
                  {(isOwner || isAdmin) && (
                    <div className="flex gap-2 border-t border-gray-100 pt-3">
                      {/* Only the owner can mark as fulfilled */}
                      {isOwner && (
                        <button
                          onClick={() => handleFulfill(req._id)}
                          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium bg-green-50 text-green-700 border border-green-200 rounded-lg py-2 hover:bg-green-100"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Mark Fulfilled
                        </button>
                      )}
                      {/* Owner or admin can delete */}
                      <button
                        onClick={() => handleDelete(req._id)}
                        className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium bg-red-50 text-red-700 border border-red-200 rounded-lg py-2 hover:bg-red-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state — no open requests */}
      {!loading && requests.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h3 className="font-bold text-gray-600 text-lg mb-2">No Active Emergencies</h3>
          <p className="text-gray-400 text-sm">All blood needs are currently met. Check back later.</p>
        </div>
      )}
    </div>
  );
}

export default EmergencyRequests;
