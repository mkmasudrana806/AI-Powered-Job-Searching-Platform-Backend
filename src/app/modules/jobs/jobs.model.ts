import { model, Schema } from "mongoose";
import { TJob, TRankingConfig } from "./jobs.interface";

const rankingConfigSchema = new Schema<TRankingConfig>({
  name: { type: String, required: true, unique: true, default: "default" },
  titleMatch: { type: Number, default: 0 },
  matchScore: { type: Number, default: 0.55 },
  skills: { type: Number, default: 0.2 },
  experienceYears: { type: Number, default: 0.1 },
  employmentType: { type: Number, default: 0.1 },
  recency: { type: Number, default: 0.05 },
  fieldOfStudy: { type: Number, default: 0 },
});

const ScoreRubricSchema = new Schema(
  {
    score_1: { type: String, required: true },
    score_3: { type: String, required: true },
    score_5: { type: String, required: true },
  },
  { _id: false },
);

const StandardQuestionSchema = new Schema({
  question: { type: String, required: true },
  category: {
    type: String,
    enum: [
      "Core_Competency",
      "Situational_Judgment",
      "Behavioral_Traits",
      "Operational_Knowledge",
      "Leadership_Potential",
      "Culture_Values",
    ],
    required: true,
  },
  intent: { type: String, required: true },
  good_answer_signals: [{ type: String }],
  red_flags: [{ type: String }],
  score_rubric: { type: ScoreRubricSchema, required: true },
});

const StandardInterviewKitSchema = new Schema(
  {
    strategy: { type: String, required: true },
    questions: [StandardQuestionSchema],
  },
  { _id: false },
);

// ------------ job schema ---------
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

    interviewKitStatus: {
      type: String,
      enum: ["generating", "generated", "failed"],
      default: "generating",
    },

    interviewKit: {
      type: StandardInterviewKitSchema,
      default: null,
    },

    rankingConfig: {
      type: rankingConfigSchema,
      default: () => ({}),
      required: true,
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
  },
);

export const Job = model<TJob>("Job", JobSchema);
