import { Model, Types } from "mongoose";

export type TSALARY = "fixed" | "range" | "negotiable" | "not_disclosed";
export type TEDUCATION_LEVEL =
  | "ssc"
  | "hsc"
  | "diploma"
  | "bachelor"
  | "master"
  | "phd"
  | "not_required";
export type TEXPERIENCE_LEVEL = "junior" | "mid" | "senior" | "lead";
export type TEMPLOYMENT = "full-time" | "part-time" | "contract" | "internship";
export type TJOB_STATUS = "draft" | "open" | "closed" | "archived";

export type TSalary = {
  type: TSALARY;
  min?: number | null;
  max?: number | null;
  currency: string;
  rawText: string;
};

export type TLocation = {
  city?: string;
  country?: string;
  remote?: boolean;
  officeAddress?: string | null;
  geo?: {
    lat?: number;
    lng?: number;
  };
};

export type TQualifications = {
  educationLevel: TEDUCATION_LEVEL;
  fieldsOfStudy?: string[];
  text: string;
};

export type TRankingConfig = {
  name: string;
  matchScore: number;
  titleMatch: number;
  skills: number;
  experienceYears: number;
  employmentType: number;
  fieldOfStudy: number;
  recency: number;
};

export type TJob = {
  company: Types.ObjectId;
  createdBy: Types.ObjectId;
  title: string;
  description: string;
  responsibilities: string[];
  requiredSkills: string[];
  experienceLevel: TEXPERIENCE_LEVEL;
  employmentType: TEMPLOYMENT;
  qualifications: TQualifications;
  salary: TSalary;
  location: TLocation;
  embedding?: number[];
  embeddingModel?: string;
  status: TJOB_STATUS;
  rankingConfig: TRankingConfig;
  isDeleted: boolean;
  expiresAt: Date;
  closedAt?: Date;
  archivedAt?: Date;
};

export interface IJob extends Model<TJob> {}
