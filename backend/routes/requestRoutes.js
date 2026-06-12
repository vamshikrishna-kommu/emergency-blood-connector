// ============================================================
// routes/requestRoutes.js — Blood Request Routes
// ============================================================
// Manages emergency blood requests posted by RECEIVER users.
//
// Available routes:
//   GET    /api/requests        — All open requests (sorted by urgency)
//   POST   /api/requests        — Create a new request (RECEIVER / ADMIN)
//   PATCH  /api/requests/:id    — Update request status (owner or ADMIN only)
//   DELETE /api/requests/:id    — Delete request (owner or ADMIN only)

import express from "express";
import { RequestModel } from "../models/RequestModel.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// ── GET /api/requests ───────────────────────────────────────
// Returns all currently open blood requests.
// Sorted: critical first → urgent → normal.
// Authenticated users of any role can view these.
router.get("/", verifyToken("DONOR", "RECEIVER", "ADMIN"), async (req, res) => {
  try {
    const requests = await RequestModel.find({ status: "open" })
      .sort({ createdAt: -1 })  // client re-sorts by urgency priority after receiving
      .populate("postedBy", "name email");

    res.status(200).json({ message: "Requests fetched", payload: requests });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch requests", error: err.message });
  }
});

// ── POST /api/requests ──────────────────────────────────────
// Creates a new emergency blood request.
// Only RECEIVER and ADMIN roles can post requests.
router.post("/", verifyToken("RECEIVER", "ADMIN"), async (req, res, next) => {
  try {
    const { requesterName, bloodGroup, hospital, city, contact, urgency, unitsRequired } = req.body;

    const newRequest = new RequestModel({
      requesterName,
      bloodGroup,
      hospital,
      city,
      contact,
      urgency,
      unitsRequired,
      postedBy: req.user.id, // set automatically from the authenticated user's token
    });

    await newRequest.save();
    res.status(201).json({ message: "Emergency request posted successfully!", payload: newRequest });
  } catch (err) {
    next(err); // pass to global error handler for validation errors
  }
});

// ── PATCH /api/requests/:id ─────────────────────────────────
// Updates the status of a blood request (e.g. mark as "fulfilled").
//
// BUG FIX: Previously any RECEIVER could update any request.
// Now we check: only the request owner OR an ADMIN may do this.
router.patch("/:id", verifyToken("RECEIVER", "ADMIN"), async (req, res) => {
  try {
    const { status } = req.body;

    // First fetch the request to check ownership
    const request = await RequestModel.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Request not found." });
    }

    // Ownership check: the user who posted it, or an admin
    const isOwner = request.postedBy.toString() === req.user.id;
    const isAdmin = req.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "You can only update your own requests." });
    }

    request.status = status;
    await request.save();

    res.status(200).json({ message: "Request updated successfully.", payload: request });
  } catch (err) {
    res.status(500).json({ message: "Failed to update request", error: err.message });
  }
});

// ── DELETE /api/requests/:id ─────────────────────────────────
// Permanently deletes a blood request.
// Only the original poster or an ADMIN can delete a request.
router.delete("/:id", verifyToken("RECEIVER", "ADMIN"), async (req, res) => {
  try {
    const request = await RequestModel.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found." });
    }

    // Only the person who posted it, or an admin, can delete
    const isOwner = request.postedBy.toString() === req.user.id;
    const isAdmin = req.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "You can only delete your own requests." });
    }

    await RequestModel.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Request deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete request", error: err.message });
  }
});

export default router;
