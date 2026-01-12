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
  _id: Types.ObjectId;
  job: Types.ObjectId;
  company: Types.ObjectId;
  applicant: Types.ObjectId;

  // snapshot
  resumeUrl: string | null; // application time either present or make null
  coverLetter: string | null;
  applicantProfileSnapshot: {
    headline: string;
    skills: string[];
    experienceSummary: string | null;
  };

  // lifecycle
  status: ApplicationStatus;
  statusHistory: TApplicationStatusHistory[];

  // recruiter-side
  // these are later of life cycle. not application creation time
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
