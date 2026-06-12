import { NavLink, useNavigate } from "react-router";
import { useAuth } from "../store/authStore";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Menu, X, Droplets } from "lucide-react";

function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, currentUser, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/");
    setMenuOpen(false);
  };

  const linkClass = "text-gray-600 hover:text-red-600 font-medium text-sm";
  const activeClass = "text-red-600 font-semibold text-sm border-b-2 border-red-600";

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <Droplets className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">
              Blood<span className="text-red-600">Connect</span>
            </span>
          </NavLink>

          {/* Desktop nav links */}
          <ul className="hidden md:flex items-center gap-6">
            <li>
              <NavLink to="/" end className={({ isActive }) => isActive ? activeClass : linkClass}>
                Home
              </NavLink>
            </li>

            {isAuthenticated && (
              <>
                <li>
                  <NavLink to="/dashboard" className={({ isActive }) => isActive ? activeClass : linkClass}>
                    Dashboard
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/donors" className={({ isActive }) => isActive ? activeClass : linkClass}>
                    Find Donors
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/requests" className={({ isActive }) => isActive ? activeClass : linkClass}>
                    Emergency Requests
                  </NavLink>
                </li>

                {currentUser?.role === "DONOR" && (
                  <li>
                    <NavLink to="/profile" className={({ isActive }) => isActive ? activeClass : linkClass}>
                      My Profile
                    </NavLink>
                  </li>
                )}
                {currentUser?.role === "RECEIVER" && (
                  <li>
                    <NavLink to="/create-request" className={({ isActive }) => isActive ? activeClass : linkClass}>
                      Post Request
                    </NavLink>
                  </li>
                )}
                {currentUser?.role === "ADMIN" && (
                  <li>
                    <NavLink to="/admin" className={({ isActive }) => isActive ? activeClass : linkClass}>
                      Admin
                    </NavLink>
                  </li>
                )}
              </>
            )}
          </ul>

          {/* Desktop auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <NavLink to="/login" className="text-sm font-medium text-gray-600 hover:text-red-600">
                  Login
                </NavLink>
                <NavLink to="/register" className="btn-primary text-sm py-2 px-4 rounded-lg">
                  Register
                </NavLink>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Welcome,</p>
                  <p className="text-sm font-semibold text-gray-800">{currentUser?.name}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  currentUser?.role === "DONOR" ? "bg-green-100 text-green-700" :
                  currentUser?.role === "RECEIVER" ? "bg-blue-100 text-blue-700" :
                  "bg-purple-100 text-purple-700"
                }`}>
                  {currentUser?.role}
                </span>
                <button onClick={handleLogout} className="btn-outline text-sm py-1.5 px-3">
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-red-600"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 space-y-3">
            <NavLink to="/" end onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-gray-700 hover:text-red-600 py-1">Home</NavLink>

            {isAuthenticated ? (
              <>
                <NavLink to="/dashboard" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-gray-700 hover:text-red-600 py-1">Dashboard</NavLink>
                <NavLink to="/donors" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-gray-700 hover:text-red-600 py-1">Find Donors</NavLink>
                <NavLink to="/requests" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-gray-700 hover:text-red-600 py-1">Emergency Requests</NavLink>
                {currentUser?.role === "DONOR" && <NavLink to="/profile" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-gray-700 hover:text-red-600 py-1">My Profile</NavLink>}
                {currentUser?.role === "RECEIVER" && <NavLink to="/create-request" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-gray-700 hover:text-red-600 py-1">Post Request</NavLink>}
                {currentUser?.role === "ADMIN" && <NavLink to="/admin" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-gray-700 hover:text-red-600 py-1">Admin Panel</NavLink>}
                <button onClick={handleLogout} className="w-full text-left text-sm font-medium text-red-600 py-1 mt-2 border-t border-gray-100 pt-3">
                  Logout ({currentUser?.name})
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-gray-700 hover:text-red-600 py-1">Login</NavLink>
                <NavLink to="/register" onClick={() => setMenuOpen(false)} className="block btn-primary text-center py-2 rounded-lg text-sm">Register</NavLink>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
