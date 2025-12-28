import { Model, Types } from "mongoose";

export type TCompanyMember = {
  userId: string;
  role: "owner" | "admin" | "recruiter";
};

export type TCompanyLocation = {
  city?: string;
  country?: string;
  officeAddress?: string;
  geo?: {
    lat?: number;
    lng?: number;
  };
};

export type TCompany = {
  name: string;
  slug: string;
  description: string;
  industry: string;
  website?: string;
  logo?: string;
  status: "pending" | "approved" | "rejected";
  isPublic: boolean;
  createdBy: Types.ObjectId | string;
  members: TCompanyMember[];
  location?: TCompanyLocation;
  isDeleted: boolean;
};

export interface ICompany extends Model<TCompany> {}
