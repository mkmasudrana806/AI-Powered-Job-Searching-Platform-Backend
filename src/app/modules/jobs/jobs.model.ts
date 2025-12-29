import { model, Schema } from "mongoose";
import { TJob } from "./jobs.interface";

const JobSchema = new Schema<TJob>(
  {
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
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
      select: false,
    },

    embeddingModel: {
      type: String,
    },

    status: {
      type: String,
      enum: ["draft", "open", "closed", "archived"],
      default: "open",
      index: true,
    },
    expiresAt: {
      type: Date,
      default: () => {
        const date = new Date();
        date.setDate(date.getDate() + 7);
        return date;
      },
    },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const Job = model<TJob>("Jobs", JobSchema);
