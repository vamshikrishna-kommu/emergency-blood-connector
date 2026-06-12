// ============================================================
// components/RootLayout.jsx — App Shell / Layout Wrapper
// ============================================================
// This is the top-level layout component rendered for all routes.
// It provides the consistent shell: Navbar → Page Content → Footer.
//
// It also runs checkAuth() once on mount to restore the user session
// from the HTTP-only JWT cookie on every page load / browser refresh.
// Without this, users would appear logged out after a refresh even
// though their cookie is still valid.

import { Outlet } from "react-router";
import { useEffect } from "react";
import { useAuth } from "../store/authStore";
import Navbar from "./Navbar";
import Footer from "./Footer";

function RootLayout() {
  // Extract only what we need — avoids subscribing to the whole store
  const checkAuth = useAuth((state) => state.checkAuth);

  // On first render, verify the JWT cookie with the server
  // This sets isAuthenticated and currentUser in the Zustand store
  useEffect(() => {
    checkAuth();
  }, []); // empty deps — run only once on mount

  return (
    <div className="min-h-screen flex flex-col">
      {/* Sticky top navigation bar */}
      <Navbar />

      {/* Page content rendered by the active route */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer always at the bottom */}
      <Footer />
    </div>
  );
}

export default RootLayout;
