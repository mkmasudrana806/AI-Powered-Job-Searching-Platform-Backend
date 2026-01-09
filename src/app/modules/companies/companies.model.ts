import { model, Schema } from "mongoose";
import { ICompany, TCompany } from "./companies.interface";

const memberSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["owner", "admin"],
      required: true,
    },
  },
  { _id: false }
);

const companySchema = new Schema<TCompany, ICompany>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    description: {
      type: String,
      required: true,
    },

    industry: {
      type: String,
      required: true,
      index: true,
    },

    website: {
      type: String,
    },

    logo: {
      type: String,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },

    isPublic: {
      type: Boolean,
      default: true,
      index: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    members: {
      type: [memberSchema],
      required: true,
    },

    location: {
      city: String,
      country: String,
      officeAddress: String,
      geo: {
        lat: Number,
        lng: Number,
      },
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

export const Company = model<TCompany, ICompany>("Company", companySchema);
