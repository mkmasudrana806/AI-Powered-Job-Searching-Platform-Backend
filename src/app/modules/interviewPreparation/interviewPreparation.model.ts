import { Schema, model, models } from "mongoose";
import {
  TInterviewPrep,
  TInterviewQuestion,
  TUserAttempt,
} from "./interviewPreparation.interface";

const userAttemptSchema = new Schema<TUserAttempt>({
  user_answer: { type: String },
  ai_feedback: { type: String },
  readiness_score: { type: Number },
  suggested_refinement: { type: String },
  attempted_at: { type: Date, default: Date.now },
});

const questionSchema = new Schema<TInterviewQuestion>({
  question: { type: String, required: true },
  category: {
    type: String,
    enum: ["Role-Specific", "Behavioral", "Situational", "Cultural-Fit"],
    required: true,
  },
  interviewer_intent: { type: String, required: true },
  personal_anchor_hint: { type: String, required: true },
  ideal_talking_points: [{ type: String }],

  user_attempts: [userAttemptSchema],
});

// interview preparation schema
const InterviewPrepSchema = new Schema<TInterviewPrep>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },

    // match score between them
    matchScore: { type: Number, min: 0, max: 100, required: true },

    // coaching summary
    coaching_summary: { type: String, required: true },
    professional_vibe: { type: String },

    // question back (10 questions)
    question_bank: [questionSchema],

    // profile-job description gaps
    gap_strategies: [
      {
        missing_qualification: { type: String },
        pivot_strategy: { type: String },
      },
    ],

    // question should ask to interviewer if any chances
    smart_reverse_questions: [{ type: String }],
  },
  {
    timestamps: true,
  },
);

// we use compound index so that 1st load gets faster response from db
InterviewPrepSchema.index({ userId: 1, jobId: 1 }, { unique: true });

export const InterviewPrep = model<TInterviewPrep>(
  "InterviewPrep",
  InterviewPrepSchema,
);
