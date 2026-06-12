import { useAuth } from "../store/authStore";
import { NavLink } from "react-router";
import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import {
  Droplets, AlertTriangle, Users, CheckCircle,
  Clock, PlusCircle, Search, Shield, Heart
} from "lucide-react";

// donors must wait 90 days between donations
function checkEligibility(lastDonationDate) {
  if (!lastDonationDate) return true;
  const days = Math.floor((new Date() - new Date(lastDonationDate)) / (1000 * 60 * 60 * 24));
  return days >= 90;
}

function Dashboard() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const isEligible = checkEligibility(currentUser?.lastDonationDate);

  const fetchData = async () => {
    try {
      setLoading(true);
      const reqRes = await axiosInstance.get("/api/requests");
      setRecentRequests(reqRes.data.payload.slice(0, 3));

      if (currentUser?.role === "ADMIN") {
        const statsRes = await axiosInstance.get("/api/admin/stats");
        setStats(statsRes.data.payload);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-fade-in">

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {currentUser?.name}! 👋
        </h1>
        <p className="text-gray-500 mt-1">
          {currentUser?.role === "DONOR" && "Thank you for being a life-saver. Here's your donor dashboard."}
          {currentUser?.role === "RECEIVER" && "Manage your blood requests and find donors nearby."}
          {currentUser?.role === "ADMIN" && "Platform overview and management tools."}
        </p>
      </div>

      {/* Donor section */}
      {currentUser?.role === "DONOR" && (
        <>
          <div className={`rounded-2xl p-6 mb-8 border-2 ${isEligible ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}`}>
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isEligible ? "bg-green-100" : "bg-yellow-100"}`}>
                {isEligible
                  ? <CheckCircle className="w-6 h-6 text-green-600" />
                  : <Clock className="w-6 h-6 text-yellow-600" />
                }
              </div>
              <div className="flex-1">
                <h2 className={`text-lg font-bold mb-1 ${isEligible ? "text-green-700" : "text-yellow-700"}`}>
                  {isEligible ? "✅ You are Eligible to Donate!" : "⏳ Not Eligible Yet"}
                </h2>
                <p className="text-sm text-gray-600 mb-3">
                  {isEligible
                    ? "You haven't donated in the last 90 days (or never donated). You can donate right now."
                    : `You donated on ${new Date(currentUser.lastDonationDate).toLocaleDateString()}. Wait 90 days before donating again.`
                  }
                </p>
                <div className="bg-white rounded-lg px-3 py-2 text-xs text-gray-500 border border-gray-200">
                  📋 <strong>Rule:</strong> Donors must wait at least <strong>90 days</strong> between donations.
                  {!isEligible && currentUser.lastDonationDate && (
                    <span className="block mt-1">
                      Next eligible date: <strong>
                        {new Date(new Date(currentUser.lastDonationDate).getTime() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                      </strong>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Blood Group", value: currentUser?.bloodGroup || "Not set", icon: <Droplets className="w-5 h-5 text-red-500" /> },
              { label: "City", value: currentUser?.city || "Not set", icon: <Search className="w-5 h-5 text-blue-500" /> },
              { label: "Status", value: currentUser?.availability ? "Available" : "Unavailable", icon: <Heart className="w-5 h-5 text-green-500" /> },
              { label: "Age", value: currentUser?.age || "Not set", icon: <Users className="w-5 h-5 text-purple-500" /> },
            ].map((item) => (
              <div key={item.label} className="card text-center">
                <div className="flex justify-center mb-2">{item.icon}</div>
                <div className="font-bold text-gray-900">{item.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{item.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <NavLink to="/donors" className="card card-hover flex items-center gap-4 no-underline">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <Search className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="font-bold text-gray-800">Find Nearby Donors</p>
                <p className="text-sm text-gray-500">Search by blood group and city</p>
              </div>
            </NavLink>
            <NavLink to="/requests" className="card card-hover flex items-center gap-4 no-underline">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="font-bold text-gray-800">Emergency Requests</p>
                <p className="text-sm text-gray-500">See hospitals needing blood</p>
              </div>
            </NavLink>
          </div>
        </>
      )}

      {/* Receiver section */}
      {currentUser?.role === "RECEIVER" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <NavLink to="/create-request" className="card card-hover flex items-center gap-4 no-underline">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <PlusCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="font-bold text-gray-800">Post Blood Request</p>
                <p className="text-sm text-gray-500">Create an emergency SOS</p>
              </div>
            </NavLink>
            <NavLink to="/donors" className="card card-hover flex items-center gap-4 no-underline">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Search className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="font-bold text-gray-800">Find Donors</p>
                <p className="text-sm text-gray-500">Filter by blood group & city</p>
              </div>
            </NavLink>
            <NavLink to="/requests" className="card card-hover flex items-center gap-4 no-underline">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="font-bold text-gray-800">All Requests</p>
                <p className="text-sm text-gray-500">View active SOS requests</p>
              </div>
            </NavLink>
          </div>
        </>
      )}

      {/* Admin section */}
      {currentUser?.role === "ADMIN" && (
        <>
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              {[
                { label: "Total Donors", value: stats.totalDonors, icon: <Heart className="w-5 h-5 text-red-500" />, bg: "bg-red-50" },
                { label: "Receivers", value: stats.totalReceivers, icon: <Users className="w-5 h-5 text-blue-500" />, bg: "bg-blue-50" },
                { label: "Open Requests", value: stats.openRequests, icon: <AlertTriangle className="w-5 h-5 text-orange-500" />, bg: "bg-orange-50" },
                { label: "Critical", value: stats.criticalRequests, icon: <AlertTriangle className="w-5 h-5 text-red-600" />, bg: "bg-red-100" },
                { label: "Fulfilled", value: stats.fulfilledRequests, icon: <CheckCircle className="w-5 h-5 text-green-500" />, bg: "bg-green-50" },
              ].map((item) => (
                <div key={item.label} className={`card text-center ${item.bg}`}>
                  <div className="flex justify-center mb-2">{item.icon}</div>
                  <div className="text-2xl font-bold text-gray-900">{item.value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{item.label}</div>
                </div>
              ))}
            </div>
          )}

          <NavLink to="/admin" className="card card-hover flex items-center gap-4 no-underline mb-8">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="font-bold text-gray-800">Open Admin Panel</p>
              <p className="text-sm text-gray-500">Manage users, requests, and platform</p>
            </div>
          </NavLink>
        </>
      )}

      {/* Recent requests — shown to all */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Recent Emergency Requests</h2>
          <NavLink to="/requests" className="text-sm text-red-600 hover:underline font-medium">
            View all →
          </NavLink>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : recentRequests.length === 0 ? (
          <div className="card text-center py-8 text-gray-400">
            <AlertTriangle className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p>No active emergency requests right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentRequests.map((req) => (
              <div key={req._id} className="card card-hover relative overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-1 ${
                  req.urgency === "critical" ? "bg-red-500" :
                  req.urgency === "urgent" ? "bg-yellow-500" : "bg-green-500"
                }`} />
                <div className="mt-2">
                  <div className="flex items-start justify-between">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      req.urgency === "critical" ? "urgency-critical" :
                      req.urgency === "urgent" ? "urgency-urgent" : "urgency-normal"
                    }`}>
                      {req.urgency === "critical" && "🚨 "}{req.urgency.toUpperCase()}
                    </span>
                    <div className="blood-badge w-10 h-10 text-sm">{req.bloodGroup}</div>
                  </div>
                  <div className="mt-3">
                    <p className="font-bold text-gray-800 text-sm">{req.hospital}</p>
                    <p className="text-xs text-gray-500 mt-0.5">📍 {req.city}</p>
                    <p className="text-xs text-gray-500">🩸 {req.unitsRequired} unit(s) needed</p>
                    <p className="text-xs text-gray-500">📞 {req.contact}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
