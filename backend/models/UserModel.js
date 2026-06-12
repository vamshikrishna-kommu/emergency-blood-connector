// ============================================================
// models/UserModel.js — Mongoose User Schema
// ============================================================
// Defines the shape of a user document in MongoDB.
//
// Three roles:
//   DONOR    — Can donate blood, has blood group & availability
//   RECEIVER — Posts emergency blood requests (hospitals/patients)
//   ADMIN    — Platform manager (created manually in DB)
//
// The 90-day eligibility rule is calculated at the application
// layer (frontend + backend) using the lastDonationDate field.

import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    // Full name of the user
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    // Email is the unique login identifier — stored lowercase
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,     // MongoDB unique index — duplicate emails return code 11000
      lowercase: true,
      trim: true,
    },

    // Bcrypt-hashed password — never stored as plain text
    password: {
      type: String,
      required: [true, "Password is required"],
    },

    // User role — determines what routes and pages they can access
    role: {
      type: String,
      enum: ["DONOR", "RECEIVER", "ADMIN"],
      required: [true, "Role is required"],
    },

    // Blood group — required for DONOR, optional (null) for RECEIVER
    // null is explicitly allowed in the enum so RECEIVER can register without it
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", null],
      default: null,
    },

    // Donor's age — must be 18–65 to be eligible to donate
    age: {
      type: Number,
      min: [18, "Must be at least 18 years old to donate"],
      max: [65, "Age cannot exceed 65"],
      default: null,
    },

    // Contact phone number — optional, shown to receivers looking for donors
    phone: {
      type: String,
      trim: true,
      default: "",
    },

    // City — used to filter donors by location
    city: {
      type: String,
      trim: true,
      default: "",
    },

    // Used to calculate the 90-day wait period between donations.
    // If null, the donor is assumed to be eligible (never donated).
    lastDonationDate: {
      type: Date,
      default: null,
    },

    // Whether the donor is currently willing to donate.
    // Donors can toggle this off when temporarily unavailable.
    availability: {
      type: Boolean,
      default: true,
    },

    // Admin-controlled flag. Set to false to block a user from logging in
    // (e.g. for abuse, duplicate accounts, or fraudulent activity).
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // auto-adds createdAt and updatedAt fields
    versionKey: false, // removes the __v field from documents
  }
);

export const UserModel = model("user", userSchema);
