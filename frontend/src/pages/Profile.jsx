// ============================================================
// pages/Profile.jsx — Donor Profile Editor
// ============================================================
// Allows a logged-in DONOR to update their profile details:
//   - Blood group, age, phone, city
//   - Last donation date (used for 90-day eligibility rule)
//   - Availability toggle
//
// On save, calls checkAuth() to refresh the Zustand store
// with the latest data from the DB.

import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../store/authStore";
import { toast } from "react-hot-toast";
import { User, Droplets, MapPin, Phone, Calendar, CheckCircle, Clock, Save } from "lucide-react";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

/**
 * Checks if a donor is eligible to donate based on the 90-day rule.
 * Returns true if they haven't donated in the past 90 days (or never).
 */
function checkEligibility(lastDonationDate) {
  if (!lastDonationDate) return true;
  const daysSince = Math.floor((new Date() - new Date(lastDonationDate)) / (1000 * 60 * 60 * 24));
  return daysSince >= 90;
}

function Profile() {
  const { currentUser, checkAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Track availability separately for controlled toggle display
  const [isAvailable, setIsAvailable] = useState(currentUser?.availability ?? true);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();

  // Pre-fill form with current user data whenever currentUser changes
  useEffect(() => {
    if (currentUser) {
      const availVal = currentUser.availability ?? true;
      setIsAvailable(availVal);
      reset({
        bloodGroup: currentUser.bloodGroup || "",
        age: currentUser.age || "",
        phone: currentUser.phone || "",
        city: currentUser.city || "",
        lastDonationDate: currentUser.lastDonationDate
          ? new Date(currentUser.lastDonationDate).toISOString().split("T")[0]
          : "",
        availability: availVal,
      });
    }
  }, [currentUser, reset]);

  const isEligible = checkEligibility(currentUser?.lastDonationDate);

  const onSubmit = async (formData) => {
    try {
      setLoading(true);
      setSaveSuccess(false);

      // Ensure availability is sent as a proper boolean
      await axiosInstance.patch("/api/donors/profile", {
        ...formData,
        availability: formData.availability === true || formData.availability === "true",
      });

      // Refresh Zustand store with fresh data from the DB
      await checkAuth();
      toast.success("Profile updated successfully!");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-fade-in">

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <User className="w-7 h-7 text-red-600" />
          My Donor Profile
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Keep your profile updated so receivers can find you in emergencies.
        </p>
      </div>

      {/* Eligibility status banner */}
      <div className={`rounded-xl p-4 mb-6 flex items-center gap-3 ${isEligible ? "bg-green-50 border border-green-200" : "bg-yellow-50 border border-yellow-200"}`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isEligible ? "bg-green-100" : "bg-yellow-100"}`}>
          {isEligible
            ? <CheckCircle className="w-5 h-5 text-green-600" />
            : <Clock className="w-5 h-5 text-yellow-600" />
          }
        </div>
        <div>
          <p className={`font-bold text-sm ${isEligible ? "text-green-700" : "text-yellow-700"}`}>
            {isEligible ? "✅ You are currently ELIGIBLE to donate" : "⏳ Not eligible to donate yet"}
          </p>
          <p className="text-xs text-gray-500">
            {isEligible
              ? "You can respond to emergency blood requests right now."
              : `Wait until: ${currentUser?.lastDonationDate
                  ? new Date(new Date(currentUser.lastDonationDate).getTime() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString()
                  : "Unknown"}`
            }
          </p>
        </div>
      </div>

      {/* Profile form card */}
      <div className="card">
        <h2 className="font-bold text-gray-800 mb-5 text-lg">Edit Profile Details</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* Blood Group */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Blood Group <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                className="form-input pl-10"
                {...register("bloodGroup", { required: "Blood group is required" })}
              >
                <option value="">Select blood group</option>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
            {errors.bloodGroup && <p className="text-red-500 text-xs mt-1">{errors.bloodGroup.message}</p>}
          </div>

          {/* Age + Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Age</label>
              <input
                type="number"
                className="form-input"
                placeholder="18–65"
                {...register("age", {
                  min: { value: 18, message: "Min age is 18" },
                  max: { value: 65, message: "Max age is 65" },
                  valueAsNumber: true,
                })}
              />
              {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  className="form-input pl-10"
                  placeholder="Emergency contact"
                  {...register("phone")}
                />
              </div>
            </div>
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">City</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                className="form-input pl-10"
                placeholder="Your city"
                {...register("city")}
              />
            </div>
          </div>

          {/* Last Donation Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Last Donation Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                className="form-input pl-10"
                max={new Date().toISOString().split("T")[0]} // Cannot be in the future
                {...register("lastDonationDate")}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Used to calculate if you're eligible to donate (90-day rule)
            </p>
          </div>

          {/* Availability Toggle — BUG FIX: was using peer-checked without peer class */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div>
              <p className="font-semibold text-sm text-gray-700">Availability Status</p>
              <p className="text-xs text-gray-500 mt-0.5">Turn OFF if you're temporarily unavailable to donate</p>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              {/* Hidden real checkbox — register it with react-hook-form */}
              <input
                type="checkbox"
                className="sr-only peer"
                {...register("availability")}
                onChange={(e) => setIsAvailable(e.target.checked)}
              />
              {/* Visual toggle — uses peer class from the input above */}
              <div className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${isAvailable ? "bg-red-500" : "bg-gray-300"}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${isAvailable ? "translate-x-7" : "translate-x-1"}`} />
              </div>
              <span className={`text-sm font-medium ${isAvailable ? "text-green-600" : "text-gray-500"}`}>
                {isAvailable ? "Available" : "Unavailable"}
              </span>
            </label>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-colors ${saveSuccess ? "bg-green-500" : "btn-primary"}`}
          >
            {loading ? (
              <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
            ) : saveSuccess ? (
              <><CheckCircle className="w-5 h-5" /> Saved!</>
            ) : (
              <><Save className="w-5 h-5" /> Save Profile</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
