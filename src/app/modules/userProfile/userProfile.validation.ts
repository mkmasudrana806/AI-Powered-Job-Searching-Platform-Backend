import z, { string } from "zod";
import { THasAtleastOneCrudOpt } from "./userProfile.interface";

// ------------ create profile =------------------
const experienceSchema = z.object({
  companyName: z.string().min(1),
  role: z.string().min(1),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  isCurrent: z.boolean(),
  description: z.string().optional(),
});

const educationSchema = z.object({
  institution: z.string().min(3),
  degree: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  startYear: z.number().int().optional(),
  endYear: z.number().int().optional(),
});

const certificationSchema = z.object({
  name: z.string().min(5),
  issuer: z.string(),
  issueDate: z.coerce.date().optional(),
  expiryDate: z.coerce.date().optional(),
  credentialUrl: z.string().url().optional(),
});

const projectSchema = z.object({
  title: z.string().min(15),
  description: z.string(),
  technologies: z.array(z.string()),
  link: z.string().url().optional(),
});

const EMPLOYMENT_TYPE = ["full-time", "part-time", "contract", "internship"];

const createProfile = z.object({
  headline: z.string().min(5).max(150),
  summary: z.string().min(50).max(5000).optional(),

  skills: z.array(z.string().min(1)).min(3).optional(),
  experience: z.array(experienceSchema).optional(),
  education: z.array(educationSchema).optional(),
  certifications: z.array(certificationSchema).optional(),
  projects: z.array(projectSchema).optional(),

  currentRole: z.string().optional(),
  preferredRoles: z.array(z.string()).optional(),
  totalYearsOfExperience: z.number().optional(),
  employmentType: z.enum(EMPLOYMENT_TYPE as [string, ...string[]]).optional(),

  location: z
    .object({
      city: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
  jobPreference: z.enum(["remote", "hybrid", "onsite"]).optional(),
});

const createProfileSchema = z.object({
  body: z
    .object({
      headline: z.string().min(5).max(150),
    })
    .strict("Unknown field is not allowed"),
});

// --------- Update Profile ----------

// validate mongoose objectid
const zObjectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid mongodb ObjectId");

const experienceUpdateSchema = experienceSchema.extend({
  _id: zObjectId,
  endDate: z.coerce.date(),
  description: z.string(),
});

const educationUpdateSchema = educationSchema.extend({ _id: zObjectId });
const certificationUpdateSchema = certificationSchema.extend({
  _id: zObjectId,
});
const projectUpdateSchema = projectSchema.extend({ _id: zObjectId });

// experience, projects, certifications, education validation
const hasAtleastOneCrudOpt = (val: THasAtleastOneCrudOpt) =>
  (val.add && val.add.length > 0) ||
  (val.remove && val.remove.length > 0) ||
  (val.update && val.update.length > 0);

// experience, projects, certifications, education schema reuse
type TAdd = z.ZodTypeAny;
type TUpdate = z.ZodTypeAny;
const crudSchema = (label: string, addSchema: TAdd, updateSchema: TUpdate) =>
  z
    .object({
      add: z.array(addSchema).optional(),
      update: z.array(updateSchema).optional(),
      remove: z.array(zObjectId).optional(),
    })
    .refine(hasAtleastOneCrudOpt, {
      message: `${label}: At least one CRUD option with value`,
    });

const cityCountryValidation = (val: { city: string; country: string }) => {
  const cityLength = val.city.length;
  const countryLength = val.country.length;

  return (
    cityLength > 3 && cityLength < 50 && countryLength > 3 && countryLength < 50
  );
};

// update profile main schema
const updateProfile = z.object({
  headline: z.string().min(5).max(150),
  summary: z.string().min(50).max(5000),
  skills: z.array(z.string().min(1)).min(3),
  experience: crudSchema(
    "experience",
    experienceSchema,
    experienceUpdateSchema
  ),
  education: crudSchema("education", educationSchema, educationUpdateSchema),
  certifications: crudSchema(
    "certification",
    certificationSchema,
    certificationUpdateSchema
  ),
  projects: crudSchema("project", projectSchema, projectUpdateSchema),
  currentRole: z.string(),
  preferredRoles: z.array(z.string()),
  totalYearsOfExperience: z.number(),
  employmentType: z.enum(EMPLOYMENT_TYPE as [string, ...string[]]),
  location: z
    .object({
      city: z.string(),
      country: z.string(),
    })
    .refine(cityCountryValidation, {
      message: "City or country length should between 3 and 60 chars",
    }),
  jobPreference: z.enum(["remote", "hybrid", "onsite"]),
});

// update allowed to only known field
const updateProfileSchema = z.object({
  body: updateProfile.partial().strict("Unkown field update not possible"),
});

export const UserProfileValidations = {
  createProfileSchema,
  updateProfileSchema,
};
