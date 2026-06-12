// ============================================================
// pages/Login.jsx — User Login Page
// ============================================================
// Handles user authentication. On successful login, the server
// sets an HTTP-only JWT cookie and we update the Zustand store.
// The user is then redirected to their dashboard.
//
// useEffect watches for isAuthenticated state change (set by the
// Zustand login action) and redirects after login succeeds.

import { useForm } from "react-hook-form";
import { NavLink, useNavigate } from "react-router";
import { useAuth } from "../store/authStore";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { Droplets, Mail, Lock } from "lucide-react";

function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const { login, isAuthenticated, currentUser, loading, error } = useAuth();

  /** Submit handler — calls the Zustand login action */
  const onSubmit = (formData) => {
    login(formData);
  };

  // Redirect to dashboard after successful login
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      toast.success(`Welcome back, ${currentUser.name}! 🩸`);
      navigate("/dashboard");
    }
  }, [isAuthenticated, currentUser, navigate]);

  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md page-fade-in">
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Droplets className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to Emergency Blood Connector</p>
          </div>

          {/* Server/auth error banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* Email field */}
            <div>
              <label htmlFor="login-email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                {/* Icon positioned absolutely inside the input container */}
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  className="form-input pl-10"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Enter a valid email address",
                    },
                  })}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="login-password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                {/* Icon positioned absolutely inside the input container */}
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  className="form-input pl-10"
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Must be at least 6 characters" },
                  })}
                />
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {/* Submit button with loading state */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 rounded-xl mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : "Sign In"}
            </button>
          </form>

          {/* Register link */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{" "}
            <NavLink to="/register" className="text-red-600 font-semibold hover:underline">
              Register here
            </NavLink>
          </p>
        </div>

        {/* Demo hint */}
        <p className="text-center text-xs text-gray-400 mt-4">
          💡 For demo: Register a new account or use existing credentials
        </p>
      </div>
    </div>
  );
}

export default Login;
