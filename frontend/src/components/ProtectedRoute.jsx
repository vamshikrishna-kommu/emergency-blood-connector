// ============================================================
// components/ProtectedRoute.jsx — Role-Based Route Guard
// ============================================================
// Wraps any page that requires authentication or a specific role.
//
// Behaviour:
//   Loading  → Shows a spinner (waiting for checkAuth to resolve)
//   Not logged in → Redirects to /login with a toast message
//   Wrong role → Redirects to /unauthorized
//   Correct role → Renders children (the actual page)
//
// Usage in App.jsx:
//   <ProtectedRoute allowedRoles={["DONOR"]}>
//     <Profile />
//   </ProtectedRoute>

import { useAuth } from "../store/authStore";
import { Navigate } from "react-router";
import { toast } from "react-hot-toast";

function ProtectedRoute({ children, allowedRoles }) {
  const { loading, currentUser, isAuthenticated } = useAuth();

  // While checkAuth() is still running on page refresh, show a spinner
  // instead of immediately redirecting (which would log users out on refresh)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // No session — redirect to login
  if (!isAuthenticated) {
    toast.error("Please login to continue");
    return <Navigate to="/login" replace />;
  }

  // Logged in but with wrong role — show unauthorized page
  if (allowedRoles && !allowedRoles.includes(currentUser?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // All checks passed — render the protected page
  return children;
}

export default ProtectedRoute;
