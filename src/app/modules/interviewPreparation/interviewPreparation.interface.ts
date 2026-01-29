import { Types } from "mongoose";

// we categories question set 4 parts
export type TQuestionCategory =
  | "Role-Specific"
  | "Behavioral"
  | "Situational"
  | "Cultural-Fit";

// user attemps for each question
export type TUserAttempt = {
  user_answer: string;
  ai_feedback: string;
  readiness_score: number;
  suggested_refinement: string;
  attempted_at: Date;
};

// 10 interview question
export type TInterviewQuestion = {
  _id: string;
  question: string;
  category: TQuestionCategory;
  interviewer_intent: string;
  personal_anchor_hint: string;
  ideal_talking_points: string[];
  user_attempts: TUserAttempt[];
};

// requirements gaps
export type TRequirementGap = {
  missing_qualification: string;
  pivot_strategy: string;
};

// main interview preparation dashboard data
export type TInterviewPrep = {
  user: Types.ObjectId;
  job: Types.ObjectId;

  matchScore?: number;
  // high leve coach vibe and summary
  coaching_summary?: string;
  professional_vibe?: string;

  // core 10 questions
  question_bank?: TInterviewQuestion[];

  // job-resume weaknes
  gap_strategies?: TRequirementGap[];

  // ask question to the user
  smart_reverse_questions?: string[];

  status: "generating" | "generated" | "failed";
};
