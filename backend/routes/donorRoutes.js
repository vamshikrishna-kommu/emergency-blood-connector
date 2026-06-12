// ============================================================
// routes/donorRoutes.js — Donor Routes
// ============================================================
// Handles listing donors and allowing donors to update their
// own profile (blood group, availability, last donation date).
//
// Available routes:
//   GET   /api/donors          — List donors with optional filters
//   PATCH /api/donors/profile  — Donor updates their own profile

import express from "express";
import { UserModel } from "../models/UserModel.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// ── GET /api/donors ─────────────────────────────────────────
// Returns all active DONOR users.
// Supports optional query params:
//   ?bloodGroup=A+   — exact match on blood group
//   ?city=Hyderabad  — case-insensitive partial match on city
//
// Any authenticated user (DONOR, RECEIVER, ADMIN) can view this list.
router.get("/", verifyToken("DONOR", "RECEIVER", "ADMIN"), async (req, res) => {
  try {
    // Start with base filter: active donors only
    const filter = { role: "DONOR", isActive: true };

    // Narrow down by blood group if provided
    if (req.query.bloodGroup) {
      filter.bloodGroup = req.query.bloodGroup;
    }

    // Case-insensitive partial city search (regex)
    if (req.query.city) {
      filter.city = { $regex: req.query.city, $options: "i" };
    }

    // Exclude password from results — never send hashed passwords to clients
    const donors = await UserModel.find(filter, { password: 0 });
    res.status(200).json({ message: "Donors fetched", payload: donors });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch donors", error: err.message });
  }
});

// ── PATCH /api/donors/profile ───────────────────────────────
// Allows a logged-in DONOR to update their own profile details.
// Only the fields explicitly provided in the body are updated
// (undefined fields are simply skipped — no accidental overwrites).
router.patch("/profile", verifyToken("DONOR"), async (req, res) => {
  try {
    const { bloodGroup, age, phone, city, lastDonationDate, availability } = req.body;

    // Build update object only with fields that were sent
    const updateData = {};
    if (bloodGroup !== undefined) updateData.bloodGroup = bloodGroup;
    if (age !== undefined) updateData.age = age;
    if (phone !== undefined) updateData.phone = phone;
    if (city !== undefined) updateData.city = city;

    // Validate lastDonationDate — cannot be a future date
    if (lastDonationDate !== undefined) {
      if (lastDonationDate && new Date(lastDonationDate) > new Date()) {
        return res.status(400).json({ message: "Last donation date cannot be in the future." });
      }
      updateData.lastDonationDate = lastDonationDate || null;
    }

    if (availability !== undefined) updateData.availability = availability;

    const updatedUser = await UserModel.findByIdAndUpdate(
      req.user.id,
      updateData,
      {
        new: true,          // return the updated document
        runValidators: true, // enforce schema validations on the update
        projection: { password: 0 }, // exclude password from response
      }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ message: "Profile updated successfully.", payload: updatedUser });
  } catch (err) {
    res.status(500).json({ message: "Failed to update profile", error: err.message });
  }
});

export default router;
