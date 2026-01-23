import { Types } from "mongoose";

export type TSalaryPredictionStatus =
  | "idle"
  | "processing"
  | "completed"
  | "failed";

export type TSalaryPrediction = {
  user: Types.ObjectId;
  status: TSalaryPredictionStatus;
  result?: {
    currency: string;
    min: number;
    median: number;
    max: number;
    confidence: "low" | "medium" | "high";
    sampleSize: number;
  };
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
};
