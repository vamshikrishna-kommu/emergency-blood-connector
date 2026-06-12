// ============================================================
// routes/adminRoutes.js — Admin-Only Routes
// ============================================================
// All routes here require the ADMIN role.
// Provides platform-level management: stats, user control,
// and full request management (view all, force-delete).
//
// Available routes:
//   GET    /api/admin/stats             — Platform statistics
//   GET    /api/admin/users             — All non-admin users
//   PATCH  /api/admin/users/:id/status  — Activate/deactivate a user
//   GET    /api/admin/requests          — All requests (including closed)
//   DELETE /api/admin/requests/:id      — Force-delete any request

import express from "express";
import { UserModel } from "../models/UserModel.js";
import { RequestModel } from "../models/RequestModel.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// ── GET /api/admin/stats ────────────────────────────────────
// Returns aggregated counts for the admin dashboard overview.
router.get("/stats", verifyToken("ADMIN"), async (req, res) => {
  try {
    // Run all count queries in parallel for efficiency
    const [totalDonors, totalReceivers, openRequests, criticalRequests, fulfilledRequests] =
      await Promise.all([
        UserModel.countDocuments({ role: "DONOR" }),
        UserModel.countDocuments({ role: "RECEIVER" }),
        RequestModel.countDocuments({ status: "open" }),
        RequestModel.countDocuments({ urgency: "critical", status: "open" }),
        RequestModel.countDocuments({ status: "fulfilled" }),
      ]);

    res.status(200).json({
      message: "Stats fetched",
      payload: { totalDonors, totalReceivers, openRequests, criticalRequests, fulfilledRequests },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch stats", error: err.message });
  }
});

// ── GET /api/admin/users ────────────────────────────────────
// Returns all registered users EXCEPT admins.
// Password is excluded from the response for security.
router.get("/users", verifyToken("ADMIN"), async (req, res) => {
  try {
    const users = await UserModel.find(
      { role: { $ne: "ADMIN" } }, // exclude admin accounts
      { password: 0 }              // never expose hashed passwords
    ).sort({ createdAt: -1 });     // newest users first

    res.status(200).json({ message: "Users fetched", payload: users });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users", error: err.message });
  }
});

// ── PATCH /api/admin/users/:id/status ──────────────────────
// Activates or deactivates a user account.
// Deactivated users cannot log in (blocked at login check).
router.patch("/users/:id/status", verifyToken("ADMIN"), async (req, res) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({ message: "isActive must be a boolean value." });
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true, projection: { password: 0 } }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    const action = isActive ? "activated" : "deactivated";
    res.status(200).json({ message: `User ${action} successfully.`, payload: updatedUser });
  } catch (err) {
    res.status(500).json({ message: "Failed to update user status", error: err.message });
  }
});

// ── GET /api/admin/requests ─────────────────────────────────
// Returns ALL blood requests (open, fulfilled, and closed).
// Unlike the public /api/requests endpoint which only shows "open",
// this gives admins full visibility for moderation.
router.get("/requests", verifyToken("ADMIN"), async (req, res) => {
  try {
    const requests = await RequestModel.find()
      .sort({ createdAt: -1 })          // most recent first
      .populate("postedBy", "name email"); // include requester details

    res.status(200).json({ message: "All requests fetched", payload: requests });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch requests", error: err.message });
  }
});

// ── DELETE /api/admin/requests/:id ─────────────────────────
// Permanently removes a blood request from the platform.
// Admins can delete any request (e.g. fraudulent or duplicate entries).
router.delete("/requests/:id", verifyToken("ADMIN"), async (req, res) => {
  try {
    const deleted = await RequestModel.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Request not found." });
    }

    res.status(200).json({ message: "Request deleted by admin." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete request", error: err.message });
  }
});

export default router;
