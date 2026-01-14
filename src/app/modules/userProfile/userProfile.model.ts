import { Schema, model } from "mongoose";
import {
  TCertification,
  TEducation,
  TExperience,
  TProject,
  TUserProfile,
} from "./userProfile.interface";

const experienceSchema = new Schema<TExperience>({
  companyName: { type: String, required: true },
  role: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  isCurrent: { type: Boolean, default: false },
  description: { type: String },
});

const educationSchema = new Schema<TEducation>({
  institution: { type: String, required: true },
  degree: { type: String },
  fieldOfStudy: { type: String },
  startYear: { type: Number },
  endYear: { type: Number },
});

const certificationSchema = new Schema<TCertification>({
  name: { type: String, required: true },
  issuer: { type: String },
  issueDate: { type: Date },
  expiryDate: { type: Date },
  credentialUrl: { type: String },
});

const projectSchema = new Schema<TProject>({
  title: { type: String, required: true },
  description: { type: String },
  technologies: [{ type: String }],
  link: { type: String },
});

// user profile schema
const userProfileSchema = new Schema<TUserProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    headline: { type: String, minLength: 5, maxlength: 150, required: true },
    summary: { type: String, minlength: 50, maxlength: 5000 },

    skills: {
      type: [String],
      default: [],
      index: true,
    },

    experience: {
      type: [experienceSchema],
      default: [],
    },

    education: {
      type: [educationSchema],
      default: [],
    },

    certifications: {
      type: [certificationSchema],
      default: [],
    },

    projects: {
      type: [projectSchema],
      default: [],
    },

    totalYearsOfExperience: {
      type: Number,
      min: 0,
      max: 30,
    },

    currentRole: {
      type: String,
    },

    preferredRoles: {
      type: [String],
      default: [],
    },

    employmentType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship"],
    },

    location: {
      city: String,
      country: String,
    },
    jobPreference: {
      type: String,
      enum: ["remote", "hybrid", "onsite"],
      default: "onsite",
    },
    resumeUrl: {
      type: String,
    },

    embedding: {
      type: [Number],
      select: false,
    },
    embeddingText: {
       type: String,

    },
    embeddingModel: {
      type: String,
    },

    embeddingDirty: {
      type: Boolean,
      default: false,
    },

    previousHash: {
      type: String,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// compound indexes for recruiter search
userProfileSchema.index({ skills: 1, totalYearsOfExperience: -1 });
userProfileSchema.index({ "location.country": 1 });

export const UserProfile = model<TUserProfile>(
  "UserProfile",
  userProfileSchema
);
