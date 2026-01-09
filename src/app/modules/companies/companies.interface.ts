import { Model, Types } from "mongoose";
export type TCOMPANY_STATUS = "pending" | "approved" | "rejected";

export type TCompanyMember = {
  userId: string;
  role: "owner" | "recruiter";
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

// Company type
export type TCompany = {
  name: string;
  slug: string;
  description: string;
  industry: string;
  website?: string;
  logo?: string;
  status: TCOMPANY_STATUS;
  isPublic: boolean;
  createdBy: Types.ObjectId | string;
  members: TCompanyMember[];
  location?: TCompanyLocation;
  isDeleted: boolean;
};

// Company update type
export type TCompanyUpdate = Partial<
  Pick<
    TCompany,
    "name" | "description" | "industry" | "website" | "logo" | "location"
  >
>;

export type TCompanyMiddlewareData = {
  companyId: string;
  companyMembers: TCompany["members"];
  userRoleInCompany: TCompanyMember["role"];
};

export interface ICompany extends Model<TCompany> {}
