// ============================================================
// pages/Unauthorized.jsx — Access Denied Page
// ============================================================
// Shown when a user tries to access a page they don't have
// permission for (e.g., a DONOR trying to access admin panel).

import { NavLink } from "react-router";
import { ShieldX, ArrowLeft } from "lucide-react";

function Unauthorized() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md page-fade-in">

        {/* Icon */}
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldX className="w-12 h-12 text-red-500" />
        </div>

        {/* Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Access Denied</h1>
        <p className="text-gray-500 mb-2">
          You don't have permission to view this page.
        </p>
        <p className="text-gray-400 text-sm mb-8">
          This area requires a different role. Please contact your administrator if you believe this is an error.
        </p>

        {/* Back Button */}
        <NavLink
          to="/"
          className="btn-primary px-8 py-3 rounded-xl inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Go to Home
        </NavLink>
      </div>
    </div>
  );
}

export default Unauthorized;
