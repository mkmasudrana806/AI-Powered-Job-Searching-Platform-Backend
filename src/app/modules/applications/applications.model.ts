import { Schema, model } from "mongoose";
import {
  TApplication,
  TApplicationStatusHistory,
} from "./applications.interface";
import { string } from "zod";

const APPLICATION_STATUS = [
  "applied",
  "reviewing",
  "shortlisted",
  "rejected",
  "hired",
  "withdrawn",
];

// application status history
const applicationStatusHistorySchema = new Schema<TApplicationStatusHistory>(
  {
    status: {
      type: String,
      enum: APPLICATION_STATUS,
      required: true,
    },
    at: {
      type: Date,
      required: true,
      default: Date.now,
    },
    by: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { _id: false }
);

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
      enum: APPLICATION_STATUS,
      default: "applied",
      index: true,
    },
    statusHistory: {
      type: [applicationStatusHistorySchema],
      default: [],
      required: true,
    },

    withdrawnAt: {
      type: Date,
    },

    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    reviewedAt: {
      type: Date,
    },

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

applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

// pre hooks
applicationSchema.pre("save", function (next) {
  if (this.isNew) {
    this.statusHistory.push({
      status: "applied",
      at: this.appliedAt || new Date(),
      by: this.applicant,
    });
  }
  next();
});

export const Application = model<TApplication>(
  "Application",
  applicationSchema
);
