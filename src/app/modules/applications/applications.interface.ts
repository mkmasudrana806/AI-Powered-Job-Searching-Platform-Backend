import { Types } from "mongoose";

export type TApplicationStatus =
  | "applied"
  | "reviewing"
  | "shortlisted"
  | "rejected"
  | "hired"
  | "withdrawn";

export type TApplication = {
  // relations
  job: Types.ObjectId;
  company: Types.ObjectId;
  applicant: Types.ObjectId;

  // snapshot at apply time
  resumeUrl?: string;
  coverLetter?: string;
  applicantProfileSnapshot?: {
    headline?: string;
    skills?: string[];
    experienceSummary?: string;
  };

  // lifecycle
  status: TApplicationStatus;

  // recruiter-side
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;

  // AI / scoring
  matchScore?: number; // 0–100
  rankingScore?: number;
  aiNotes?: string;

  // metadata
  appliedAt: Date;
  updatedAt?: Date;
};
