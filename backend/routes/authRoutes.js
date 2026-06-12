// ============================================================
// routes/authRoutes.js — Authentication Routes
// ============================================================
// Handles user registration, login, logout, and session check.
// All passwords are hashed with bcrypt before storage.
// Sessions are maintained via JWT stored in an HTTP-only cookie
// (so JavaScript cannot read it — prevents XSS token theft).

import express from "express";
import { hash, compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/UserModel.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// ── POST /api/auth/register ─────────────────────────────────
// Creates a new DONOR or RECEIVER account.
// ADMIN accounts must be created manually in the DB for security.
router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password, role, bloodGroup, age, phone, city, lastDonationDate } = req.body;

    // Only allow self-registration as DONOR or RECEIVER
    if (!["DONOR", "RECEIVER"].includes(role)) {
      return res.status(400).json({ message: "Invalid role. Choose DONOR or RECEIVER." });
    }

    // Validate email format server-side (defence-in-depth)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email address format." });
    }

    // Hash the password with bcrypt (12 rounds = good security vs speed balance)
    const hashedPassword = await hash(password, 12);

    // Build the user document — start with common fields
    const userPayload = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
      phone: phone?.trim() || "",
      city: city?.trim() || "",
    };

    // Only set bloodGroup if it was provided and non-empty
    if (bloodGroup && bloodGroup.trim() !== "") {
      userPayload.bloodGroup = bloodGroup;
    }

    // Only set age if it was provided and is a valid number
    if (age !== undefined && age !== "" && age !== null) {
      userPayload.age = Number(age);
    }

    // BUG FIX: lastDonationDate was previously missing from userPayload.
    // Donors who filled this field at registration had it silently ignored.
    // Validate that the date is not in the future before saving.
    if (lastDonationDate && lastDonationDate.trim() !== "") {
      const donationDate = new Date(lastDonationDate);
      if (donationDate > new Date()) {
        return res.status(400).json({ message: "Last donation date cannot be in the future." });
      }
      userPayload.lastDonationDate = donationDate;
    }

    const newUser = new UserModel(userPayload);
    await newUser.save();

    res.status(201).json({ message: "Account created successfully! Please login." });
  } catch (err) {
    // Pass to global error handler (handles duplicate email, validation errors, etc.)
    next(err);
  }
});

// ── POST /api/auth/login ────────────────────────────────────
// Verifies credentials and issues a JWT stored in an HTTP-only cookie.
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    // Find user by email (case-insensitive since we store lowercase)
    const user = await UserModel.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({ message: "No account found with this email." });
    }

    // Block deactivated accounts from logging in
    if (!user.isActive) {
      return res.status(403).json({ message: "Account has been deactivated. Contact admin." });
    }

    // Compare submitted password against stored bcrypt hash
    const isPasswordCorrect = await compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Incorrect password." });
    }

    // Create JWT payload — do NOT include sensitive data like password
    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bloodGroup: user.bloodGroup,
        city: user.city,
        lastDonationDate: user.lastDonationDate,
        availability: user.availability,
      },
      process.env.SECRET_KEY,
      { expiresIn: "7d" }
    );

    // Store JWT in HTTP-only cookie — JS on the page cannot access this
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",     // HTTPS only in prod
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // cross-site in prod
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });

    // Return user data (without password) for the frontend store
    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({ message: "Login successful", payload: userObj });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
});

// ── GET /api/auth/logout ────────────────────────────────────
// Clears the JWT cookie, effectively logging out the user.
router.get("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  res.status(200).json({ message: "Logged out successfully." });
});

// ── GET /api/auth/check-auth ────────────────────────────────
// Called on every page refresh to restore the user session.
// If the cookie is valid, returns fresh user data from the DB
// (not just the JWT payload, which may be stale).
router.get("/check-auth", verifyToken("DONOR", "RECEIVER", "ADMIN"), async (req, res) => {
  try {
    // Fetch fresh data from DB so profile changes are reflected immediately
    const freshUser = await UserModel.findById(req.user.id, { password: 0 });
    if (!freshUser) {
      return res.status(401).json({ message: "User no longer exists." });
    }

    res.status(200).json({
      message: "Authenticated",
      payload: freshUser,
    });
  } catch (err) {
    res.status(500).json({ message: "Auth check failed", error: err.message });
  }
});

export default router;
