import { Model, Types } from "mongoose";

export type TSalary = {
  type: "fixed" | "range" | "negotiable" | "not_disclosed";
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
  educationLevel:
    | "ssc"
    | "hsc"
    | "diploma"
    | "bachelor"
    | "master"
    | "phd"
    | "not_required";
  fieldsOfStudy?: string[];
  text: string;
};

export type TJob = {
  companyId: Types.ObjectId | string;
  title: string;
  description: string;
  responsibilities: string[];
  requiredSkills: string[];

  experienceLevel: "junior" | "mid" | "senior" | "lead";
  employmentType: "full-time" | "part-time" | "contract" | "internship";

  qualifications: TQualifications;
  salary: TSalary;
  location: TLocation;

  embedding: number[];
  embeddingModel: string;

  isActive: boolean;
  expiresAt?: Date;
};

export interface IJob extends Model<TJob> {}
