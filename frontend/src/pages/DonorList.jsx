// ============================================================
// pages/DonorList.jsx — Find Blood Donors
// ============================================================
// Allows any authenticated user to search for available donors
// filtered by blood group and/or city (case-insensitive).
//
// Each donor card shows:
//   - Name, city, blood group
//   - Phone number (for direct contact)
//   - Eligibility status (90-day rule)
//   - Availability status (donor-controlled)

import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../api/axiosInstance";
import { Search, Droplets, MapPin, Phone, CheckCircle, Clock } from "lucide-react";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

/**
 * Returns true if the donor is eligible to donate (hasn't donated in 90 days).
 * @param {string|null} lastDonationDate - ISO date string or null
 */
function isDonorEligible(lastDonationDate) {
  if (!lastDonationDate) return true; // never donated → eligible
  const daysSince = Math.floor((new Date() - new Date(lastDonationDate)) / (1000 * 60 * 60 * 24));
  return daysSince >= 90;
}

function DonorList() {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState("");
  const [citySearch, setCitySearch] = useState("");

  /**
   * Fetches donors from the API with current filter values.
   * Wrapped in useCallback to prevent stale closures — this ensures
   * it always reads the latest state values at call time.
   */
  const fetchDonors = useCallback(async (bloodGroup = "", city = "") => {
    try {
      setLoading(true);
      setError(null);

      // Build query string from active filters
      const params = new URLSearchParams();
      if (bloodGroup) params.append("bloodGroup", bloodGroup);
      if (city.trim()) params.append("city", city.trim());

      const res = await axiosInstance.get(`/api/donors?${params.toString()}`);
      setDonors(res.data.payload);
    } catch (err) {
      setError("Failed to load donors. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []); // empty deps — no external state references inside

  // Initial load on mount
  useEffect(() => {
    fetchDonors("", "");
  }, [fetchDonors]);

  // Submit the search form with current filter values
  const handleSearch = (e) => {
    e.preventDefault();
    fetchDonors(selectedBloodGroup, citySearch);
  };

  // BUG FIX: Previously used setTimeout(fetchDonors, 100) which captured
  // stale state. Now we pass empty strings directly to fetchDonors,
  // which bypasses the old state values entirely.
  const handleReset = () => {
    setSelectedBloodGroup("");
    setCitySearch("");
    fetchDonors("", ""); // pass cleared values directly — no stale closure issue
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-fade-in">

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Droplets className="w-7 h-7 text-red-600" />
          Find Blood Donors
        </h1>
        <p className="text-gray-500 mt-1">Search verified donors by blood group and city.</p>
      </div>

      {/* Search / Filter Form */}
      <form onSubmit={handleSearch} className="card mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Blood Group Filter */}
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Blood Group</label>
            <div className="relative">
              <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                className="form-input pl-10"
                value={selectedBloodGroup}
                onChange={(e) => setSelectedBloodGroup(e.target.value)}
              >
                <option value="">All Blood Groups</option>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
          </div>

          {/* City Search Filter */}
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">City</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                className="form-input pl-10"
                placeholder="e.g. Hyderabad"
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-end gap-2">
            <button type="submit" className="btn-primary py-2.5 px-6 flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search
            </button>
            <button type="button" onClick={handleReset} className="btn-outline py-2.5 px-4">
              Reset
            </button>
          </div>
        </div>
      </form>

      {/* Result count */}
      {!loading && (
        <p className="text-sm text-gray-500 mb-4">
          {donors.length > 0 ? `Found ${donors.length} donor(s)` : "No donors match your search"}
        </p>
      )}

      {/* Loading spinner */}
      {loading && (
        <div className="flex justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">Searching donors...</p>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4 mb-4">
          ⚠️ {error}
        </div>
      )}

      {/* Donor Cards Grid */}
      {!loading && donors.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {donors.map((donor) => {
            const eligible = isDonorEligible(donor.lastDonationDate);
            return (
              <div key={donor._id} className="card card-hover">
                {/* Donor avatar + name + city */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-red-600 font-bold text-sm">
                        {donor.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{donor.name}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {donor.city || "City not set"}
                      </p>
                    </div>
                  </div>
                  {/* Blood group badge */}
                  <div className="blood-badge">{donor.bloodGroup || "?"}</div>
                </div>

                {/* Donor details */}
                <div className="space-y-1.5 mb-4">
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{donor.phone || "Not provided"}</span>
                  </p>
                  {donor.age && <p className="text-sm text-gray-500">Age: {donor.age} years</p>}
                  {donor.lastDonationDate && (
                    <p className="text-sm text-gray-500">
                      Last donation: {new Date(donor.lastDonationDate).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* Status badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${eligible ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {eligible
                      ? <><CheckCircle className="w-3 h-3" /> Eligible</>
                      : <><Clock className="w-3 h-3" /> Not Eligible</>
                    }
                  </span>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${donor.availability ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
                    {donor.availability ? "🟢 Available" : "🔴 Unavailable"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!loading && donors.length === 0 && !error && (
        <div className="text-center py-16">
          <Droplets className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="font-bold text-gray-400 text-lg mb-2">No donors found</h3>
          <p className="text-gray-400 text-sm">Try a different blood group or city.</p>
        </div>
      )}
    </div>
  );
}

export default DonorList;
