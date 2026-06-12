// ============================================================
// models/RequestModel.js — Mongoose Blood Request Schema
// ============================================================
// Defines the shape of a blood request document in MongoDB.
//
// Lifecycle:
//   open → fulfilled (when donor donates)
//   open → closed    (when request is cancelled or no longer needed)
//
// Urgency levels determine display order and visual priority:
//   critical — life-threatening, shown first with red border
//   urgent   — needed within hours
//   normal   — planned surgery or procedure

import { Schema, model, Types } from "mongoose";

const requestSchema = new Schema(
  {
    // Name of the patient or organization requesting blood
    requesterName: {
      type: String,
      required: [true, "Requester name is required"],
      trim: true,
    },

    // Blood type needed — must be one of the 8 standard types
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      required: [true, "Blood group is required"],
    },

    // Hospital or location where blood is needed
    hospital: {
      type: String,
      required: [true, "Hospital name is required"],
      trim: true,
    },

    // City — helps donors identify if they're nearby
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },

    // Emergency contact number — displayed to potential donors
    contact: {
      type: String,
      required: [true, "Contact number is required"],
      trim: true,
    },

    // How urgent is this request?
    // critical → urgent → normal (also determines sort order)
    urgency: {
      type: String,
      enum: ["critical", "urgent", "normal"],
      default: "normal",
    },

    // Number of blood units (bags) required — capped at 10
    unitsRequired: {
      type: Number,
      required: [true, "Units required is required"],
      min: [1, "At least 1 unit required"],
      max: [10, "Cannot request more than 10 units at once"],
    },

    // Current lifecycle status of the request
    status: {
      type: String,
      enum: ["open", "fulfilled", "closed"],
      default: "open",
    },

    // Reference to the User who created this request (RECEIVER or ADMIN).
    // Used to check ownership for edit/delete operations.
    postedBy: {
      type: Types.ObjectId,
      ref: "user",     // refers to the "user" model for .populate()
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index the most common query patterns:
//   - GET /api/requests filters by status="open" and sorts by createdAt
//   - Admin fetches all requests sorted by createdAt
//   - Ownership checks look up postedBy
requestSchema.index({ status: 1, createdAt: -1 });
requestSchema.index({ urgency: 1 });
requestSchema.index({ postedBy: 1 });

export const RequestModel = model("request", requestSchema);