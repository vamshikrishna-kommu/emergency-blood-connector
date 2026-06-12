// ============================================================
// api/axiosInstance.js — Configured Axios HTTP Client
// ============================================================
// Creates a shared Axios instance used across the entire app.
//
// baseURL: In dev, an empty string means all /api/* requests go
//   to the Vite proxy (port 5173) which forwards to Express (4000).
//   In production, set VITE_API_URL to your backend URL on Render.
//
// withCredentials: REQUIRED for cookies to be sent cross-origin.
//   Without this, the JWT cookie is never sent and all protected
//   endpoints return 401.
//
// Response Interceptor: Handles expired/invalid sessions globally.
//   If any API call returns 401, we clear local auth state and
//   redirect to /login instead of showing raw error messages.

import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  withCredentials: true,
});

// Global 401 handler — catches expired or invalid JWT cookies.
// When triggered, we clear any stale local state and send the user
// to the login page rather than letting the UI silently fail.
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Avoid redirect loops on the login page itself
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
