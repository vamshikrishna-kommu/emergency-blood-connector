import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-hot-toast";
import { AlertTriangle, Building2, MapPin, Phone, Droplets, Hash, Send } from "lucide-react";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const URGENCY_LEVELS = [
  { value: "critical", label: "🚨 Critical — Life threatening, need blood immediately" },
  { value: "urgent", label: "⚠️ Urgent — Need within a few hours" },
  { value: "normal", label: "ℹ️ Normal — Planned procedure" },
];

function CreateRequest() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const onSubmit = async (formData) => {
    try {
      setLoading(true);
      setApiError(null);
      const res = await axiosInstance.post("/api/requests", formData);
      if (res.status === 201) {
        toast.success("Emergency request posted! Donors will be notified.");
        navigate("/requests");
      }
    } catch (err) {
      setApiError(err.response?.data?.error || err.response?.data?.message || "Failed to post request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-fade-in">

      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Post Emergency Blood Request</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Fill in the details below. Matching donors will be able to see and respond.
        </p>
      </div>

      <div className="card">

        {apiError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5">
            ⚠️ {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Urgency Level <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {URGENCY_LEVELS.map((level) => (
                <label key={level.value} className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:border-red-300 hover:bg-red-50 has-[:checked]:border-red-500 has-[:checked]:bg-red-50">
                  <input
                    type="radio"
                    value={level.value}
                    className="accent-red-600 w-4 h-4"
                    {...register("urgency", { required: "Please select urgency level" })}
                  />
                  <span className="text-sm text-gray-700">{level.label}</span>
                </label>
              ))}
            </div>
            {errors.urgency && <p className="text-red-500 text-xs mt-1">{errors.urgency.message}</p>}
          </div>

          <div className="border-t border-gray-100" />

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Requester / Patient Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Patient name or organization name"
              {...register("requesterName", { required: "Requester name is required" })}
            />
            {errors.requesterName && <p className="text-red-500 text-xs mt-1">{errors.requesterName.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                  <option value="">Select group</option>
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
              {errors.bloodGroup && <p className="text-red-500 text-xs mt-1">{errors.bloodGroup.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Units Required <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  className="form-input pl-10"
                  placeholder="1–10"
                  min={1}
                  max={10}
                  {...register("unitsRequired", {
                    required: "Units required",
                    min: { value: 1, message: "At least 1 unit" },
                    max: { value: 10, message: "Max 10 units" },
                    valueAsNumber: true,
                  })}
                />
              </div>
              {errors.unitsRequired && <p className="text-red-500 text-xs mt-1">{errors.unitsRequired.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Hospital Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                className="form-input pl-10"
                placeholder="Apollo Hospital, AIIMS, etc."
                {...register("hospital", { required: "Hospital name is required" })}
              />
            </div>
            {errors.hospital && <p className="text-red-500 text-xs mt-1">{errors.hospital.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                City <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  className="form-input pl-10"
                  placeholder="Hyderabad"
                  {...register("city", { required: "City is required" })}
                />
              </div>
              {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Contact Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  className="form-input pl-10"
                  placeholder="Emergency phone"
                  {...register("contact", { required: "Contact number is required" })}
                />
              </div>
              {errors.contact && <p className="text-red-500 text-xs mt-1">{errors.contact.message}</p>}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3.5 rounded-xl flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Posting request...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Post Emergency Request
                </>
              )}
            </button>
            <p className="text-xs text-gray-400 text-center mt-3">
              This request will be visible to all registered donors immediately.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateRequest;
