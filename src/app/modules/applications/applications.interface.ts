import { Types } from "mongoose";

type ApplicationStatus =
  | "applied"
  | "reviewing"
  | "shortlisted"
  | "rejected"
  | "hired"
  | "withdrawn";

// application status history
export type TApplicationStatusHistory = {
  status: ApplicationStatus;
  at: Date;
  by?: Types.ObjectId; // recruiter/system
};

export type TApplication = {
  job: Types.ObjectId;
  company: Types.ObjectId;
  applicant: Types.ObjectId;

  // snapshot
  resumeUrl: string;
  coverLetter?: string;
  applicantProfileSnapshot?: {
    headline?: string;
    skills?: string[];
    experienceSummary?: string;
  };

  // lifecycle
  status: ApplicationStatus;
  statusHistory: TApplicationStatusHistory[];

  // recruiter-side
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;

  // AI
  matchScore?: number;
  rankingScore?: number;
  aiNotes?: string;

  withdrawnAt?: Date;
  appliedAt: Date;
};

export type TApplicationStatus = {
  status: ApplicationStatus;
};
