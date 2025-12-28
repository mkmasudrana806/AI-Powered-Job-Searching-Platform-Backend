import { model, Schema } from "mongoose";
import { TJob } from "./jobs.interface";

const JobSchema = new Schema<TJob>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    title: { type: String, required: true, index: "text" },
    description: { type: String, required: true },

    responsibilities: { type: [String], default: [] },
    requiredSkills: { type: [String], default: [], index: true },

    experienceLevel: {
      type: String,
      enum: ["junior", "mid", "senior", "lead"],
      index: true,
    },

    employmentType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship"],
      index: true,
    },

    qualifications: {
      educationLevel: {
        type: String,
        enum: [
          "ssc",
          "hsc",
          "diploma",
          "bachelor",
          "master",
          "phd",
          "not_required",
        ],
        default: "not_required",
      },
      fieldsOfStudy: [String],
      text: { type: String, required: true },
    },

    salary: {
      type: {
        type: String,
        enum: ["fixed", "range", "negotiable", "not_disclosed"],
        required: true,
      },
      min: Number,
      max: Number,
      currency: { type: String, default: "BDT" },
      rawText: { type: String, required: true },
    },

    location: {
      city: String,
      country: String,
      remote: { type: Boolean, default: false },
      officeAddress: String,
      geo: {
        lat: Number,
        lng: Number,
      },
    },

    embedding: {
      type: [Number],
      required: true,
      select: false,
    },

    embeddingModel: {
      type: String,
      default: "gemini-text-embedding-004",
    },

    isActive: { type: Boolean, default: true, index: true },
    expiresAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const Job = model<TJob>("Jobs", JobSchema);
