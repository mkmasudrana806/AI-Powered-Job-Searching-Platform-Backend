import { Schema, model } from "mongoose";
import { TSalaryPrediction } from "./salaryPrediction.interface";

// salary prediction mongoose schema
const SalaryPredictionSchema = new Schema<TSalaryPrediction>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["idle", "processing", "completed", "failed"],
      default: "idle",
      required: true,
    },
    result: {
      currency: { type: String },
      min: { type: Number },
      median: { type: Number },
      max: { type: Number },
      confidence: {
        type: String,
        enum: ["low", "medium", "high"],
      },
      sampleSize: { type: Number },
    },
    error: {
      type: String,
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

const SalaryPrediction = model<TSalaryPrediction>(
  "SalaryPrediction",
  SalaryPredictionSchema,
);

export default SalaryPrediction;
