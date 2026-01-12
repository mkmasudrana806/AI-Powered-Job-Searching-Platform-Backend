import { Types } from "mongoose";

export type TExperience = {
  _id: string;
  companyName: string;
  role: string;
  startDate: Date;
  endDate?: Date;
  isCurrent: boolean;
  description?: string;
};

export type TEducation = {
  _id: string;
  institution: string;
  degree?: string;
  fieldOfStudy?: string;
  startYear?: number;
  endYear?: number;
};

export type TCertification = {
  _id: string;
  name: string;
  issuer?: string;
  issueDate?: Date;
  expiryDate?: Date;
  credentialUrl?: string;
};

export type TProject = {
  _id: string;
  title: string;
  description: string;
  technologies: string[];
  link?: string;
};

// ------- user profile ----------
export type TUserProfile = {
  user: Types.ObjectId;
  headline: string;
  summary?: string;

  // structured skills & experience
  skills?: string[];
  experience?: TExperience[];
  education?: TEducation[];
  certifications?: TCertification[];
  projects?: TProject[];

  // career metadata
  totalYearsOfExperience?: number;
  currentRole?: string;
  preferredRoles?: string[];
  employmentType?: "full-time" | "part-time" | "contract" | "internship";

  // location & preferences
  location?: {
    city?: string;
    country?: string;
  };
  jobPreference: "remote" | "hybrid" | "onsite";
  resumeUrl?: string;

  // AI & semantic layer
  embedding?: number[];
  embeddingModel?: string;
  embeddingDirty: boolean;
  previousHash?: string;

  isDeleted: boolean;
};

// ------------ update user profile type -------
type TExperienceUpdate = {
  _id: string;
  companyName: string;
  role: string;
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
  description: string;
};

type TEducationUpdate = {
  _id: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startYear: number;
  endYear: number;
};

type TCertificationUpdate = {
  _id: string;
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate: Date;
  credentialUrl: string;
};

type TProjectUpdate = {
  _id: string;
  title: string;
  description: string;
  technologies: string[];
  link: string;
};

export type TUpdateUserProfile = {
  headline: string;
  summary: string;

  // structured skills & experience
  skills: string[];
  experience: {
    add?: TExperience[];
    update?: TExperienceUpdate[];
    remove?: string[];
  };
  education: {
    add?: TEducation[];
    update?: TEducationUpdate[];
    remove?: string[];
  };
  certifications: {
    add?: TCertification[];
    update?: TCertificationUpdate[];
    remove?: string[];
  };

  projects: {
    add?: TProject[];
    update?: TProjectUpdate[];
    remove?: string[];
  };

  // career metadata
  totalYearsOfExperience?: number;
  currentRole: string;
  preferredRoles: string[];
  employmentType: "full-time" | "part-time" | "contract" | "internship";
  location: {
    city?: string;
    country?: string;
  };
  jobPreference?: "remote" | "hybrid" | "onsite";
};

export type THasAtleastOneCrudOpt = {
  add?: unknown[];
  update?: unknown[];
  remove?: unknown[];
};
