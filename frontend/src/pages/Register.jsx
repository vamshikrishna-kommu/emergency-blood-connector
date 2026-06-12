import { useForm } from "react-hook-form";
import { NavLink, useNavigate } from "react-router";
import { useState } from "react";
import { toast } from "react-hot-toast";
import axiosInstance from "../api/axiosInstance";
import { Droplets, User, Mail, Lock, Phone, MapPin, Droplet, Calendar } from "lucide-react";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function Register() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { role: "DONOR" }
  });

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const selectedRole = watch("role");

  const onSubmit = async (formData) => {
    try {
      setLoading(true);
      setApiError(null);
      const res = await axiosInstance.post("/api/auth/register", formData);
      if (res.status === 201) {
        toast.success("Account created! Please login.");
        navigate("/login");
      }
    } catch (err) {
      setApiError(err.response?.data?.error || err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg page-fade-in">
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8">

          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Droplets className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
            <p className="text-gray-500 text-sm mt-1">Join the Emergency Blood Network</p>
          </div>

          {apiError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5">
              ⚠️ {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* Role selection */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">I am registering as:</p>
              <div className="grid grid-cols-2 gap-3">
                <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer ${selectedRole === "DONOR" ? "border-red-500 bg-red-50" : "border-gray-200"}`}>
                  <input type="radio" value="DONOR" {...register("role")} className="sr-only" />
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedRole === "DONOR" ? "border-red-500" : "border-gray-300"}`}>
                    {selectedRole === "DONOR" && <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-800">🩸 Donor</p>
                    <p className="text-xs text-gray-500">I want to donate blood</p>
                  </div>
                </label>

                <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer ${selectedRole === "RECEIVER" ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}>
                  <input type="radio" value="RECEIVER" {...register("role")} className="sr-only" />
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedRole === "RECEIVER" ? "border-blue-500" : "border-gray-300"}`}>
                    {selectedRole === "RECEIVER" && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-800">🏥 Hospital/Receiver</p>
                    <p className="text-xs text-gray-500">I need blood for patients</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="border-t border-gray-100" />

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Your full name"
                  className="form-input pl-10"
                  {...register("name", {
                    required: "Name is required",
                    minLength: { value: 2, message: "Name must be at least 2 characters" },
                  })}
                />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="form-input pl-10"
                  {...register("email", { required: "Email is required" })}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  placeholder="Min. 6 characters"
                  className="form-input pl-10"
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Must be at least 6 characters" },
                  })}
                />
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="tel" placeholder="10-digit number" className="form-input pl-10" {...register("phone")} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">City</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Hyderabad" className="form-input pl-10" {...register("city")} />
                </div>
              </div>
            </div>

            {/* Extra fields for donors */}
            {selectedRole === "DONOR" && (
              <div className="bg-red-50 rounded-xl p-4 space-y-4 border border-red-100">
                <p className="text-sm font-semibold text-red-700">🩸 Donor Information</p>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Blood Group</label>
                  <div className="relative">
                    <Droplet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      className="form-input pl-10"
                      {...register("bloodGroup", {
                        required: selectedRole === "DONOR" ? "Blood group is required" : false,
                      })}
                    >
                      <option value="">Select blood group</option>
                      {BLOOD_GROUPS.map((bg) => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                  {errors.bloodGroup && <p className="text-red-500 text-xs mt-1">{errors.bloodGroup.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Age</label>
                  <input
                    type="number"
                    placeholder="18–65"
                    className="form-input"
                    {...register("age", {
                      min: { value: 18, message: "Must be at least 18 to donate" },
                      max: { value: 65, message: "Age cannot exceed 65" },
                    })}
                  />
                  {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Last Donation Date (optional)</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      className="form-input pl-10"
                      max={new Date().toISOString().split("T")[0]}
                      {...register("lastDonationDate")}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    If donated within 90 days, you'll be shown as "Not Eligible"
                  </p>
                </div>
              </div>
            )}

            <button
              id="register-submit"
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 rounded-xl"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : "Create Account →"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <NavLink to="/login" className="text-red-600 font-semibold hover:underline">
              Sign in
            </NavLink>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
