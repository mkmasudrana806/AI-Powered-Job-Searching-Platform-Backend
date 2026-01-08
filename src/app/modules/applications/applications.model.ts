import { Schema, model } from "mongoose";
import { TApplication } from "./applications.interface";

const applicationSchema = new Schema<TApplication>(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },

    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    applicant: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // snapshot
    resumeUrl: {
      type: String,
      required: true,
    },

    coverLetter: {
      type: String,
      maxlength: 1000,
    },

    applicantProfileSnapshot: {
      headline: String,
      skills: [String],
      experienceSummary: String,
    },

    status: {
      type: String,
      enum: [
        "applied",
        "reviewing",
        "shortlisted",
        "rejected",
        "hired",
        "withdrawn",
      ],
      default: "applied",
      index: true,
    },

    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    reviewedAt: {
      type: Date,
    },

    // AI fields
    matchScore: {
      type: Number,
      min: 0,
      max: 100,
    },

    rankingScore: {
      type: Number,
    },

    aiNotes: {
      type: String,
    },

    appliedAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate applications
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

export const Application = model<TApplication>(
  "Applications",
  applicationSchema
);
