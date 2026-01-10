import { Types } from "mongoose";

export type TExperience = {
  companyName: string;
  role: string;
  startDate: Date;
  endDate?: Date;
  isCurrent: boolean;
  description?: string;
};

export type TEducation = {
  institution: string;
  degree?: string;
  fieldOfStudy?: string;
  startYear?: number;
  endYear?: number;
};

export type TCertification = {
  name: string;
  issuer?: string;
  issueDate?: Date;
  expiryDate?: Date;
  credentialUrl?: string;
};

export type TProject = {
  title: string;
  description: string;
  technologies: string[];
  link?: string;
};

// user profile
export type TUserProfile = {
  user: Types.ObjectId;
  headline?: string;
  summary?: string;

  // structured skills & experience
  skills: string[];
  experience: TExperience[];
  education: TEducation[];
  certifications?: TCertification[];
  projects?: TProject[];

  // career metadata
  totalYearsOfExperience?: number;
  currentRole?: string;
  preferredRoles?: string[];
  employmentTypes?: ("full-time" | "part-time" | "contract" | "internship")[];

  // location & preferences
  location?: {
    city?: string;
    country?: string;
  };
  jobPreference?: "remote" | "hybrid" | "onsite";
  resumeUrl?: string;

  // AI & semantic layer
  profileText: string; // canonical derived text
  embedding?: number[];
  embeddingModel?: string;
  embeddingDirty: boolean;

  isDeleted: boolean;
};
