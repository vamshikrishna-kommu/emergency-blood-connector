// ============================================================
// store/authStore.js — Global Auth State (Zustand)
// ============================================================
// Zustand store that manages authentication state across the app.
//
// State:
//   currentUser     — full user object from the DB (or null)
//   isAuthenticated — boolean: is there a valid session?
//   loading         — true while an auth request is in-flight
//   error           — error message from the last failed login
//
// The JWT is stored server-side in an HTTP-only cookie.
// We never read the cookie directly in JS — instead we call
// /api/auth/check-auth which validates the cookie and returns
// fresh user data from the DB.

import { create } from "zustand";
import axiosInstance from "../api/axiosInstance";

export const useAuth = create((set) => ({
  currentUser: null,
  isAuthenticated: false,
  loading: false,
  error: null,

  /**
   * Attempts to log in with email + password.
   * On success, stores the user in state (the server sets the cookie).
   * On failure, stores the error message for the UI to display.
   *
   * @param {{ email: string, password: string }} credentials
   */
  login: async (credentials) => {
    try {
      set({ loading: true, error: null });
      const res = await axiosInstance.post("/api/auth/login", credentials);
      if (res.status === 200) {
        set({
          currentUser: res.data.payload,
          isAuthenticated: true,
          loading: false,
          error: null,
        });
      }
    } catch (err) {
      set({
        loading: false,
        isAuthenticated: false,
        currentUser: null,
        error: err.response?.data?.message || "Login failed. Please try again.",
      });
    }
  },

  /**
   * Logs out the current user.
   * Calls the backend to clear the HTTP-only cookie,
   * then resets the local state.
   */
  logout: async () => {
    try {
      await axiosInstance.get("/api/auth/logout");
    } catch (err) {
      // Even if the server call fails, clear local state
      console.warn("Logout server call failed:", err.message);
    } finally {
      set({ currentUser: null, isAuthenticated: false, error: null, loading: false });
    }
  },

  /**
   * Called on every page load/refresh to restore the user session.
   * The backend validates the cookie and returns fresh user data from the DB.
   * This ensures that profile changes (e.g. availability) are always current.
   *
   * Returns early (without error) if not logged in (401 response).
   */
  checkAuth: async () => {
    try {
      set({ loading: true });
      const res = await axiosInstance.get("/api/auth/check-auth");
      set({
        currentUser: res.data.payload,
        isAuthenticated: true,
        loading: false,
      });
    } catch (err) {
      if (err.response?.status === 401) {
        // No session — this is normal when user is not logged in
        set({ currentUser: null, isAuthenticated: false, loading: false });
        return;
      }
      // Other errors (network issue, server error)
      console.error("Auth check failed:", err.message);
      set({ loading: false });
    }
  },
}));
