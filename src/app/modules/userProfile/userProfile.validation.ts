import z from "zod";

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

const createProfile = z.object({
  headline: z.string().min(5).max(150),
  summary: z.string().min(50).max(5000),

  skills: z.array(z.string().min(1)).min(3),
  experience: z.array(experienceSchema).optional(),
  education: z.array(educationSchema).optional(),
  certifications: z.array(certificationSchema).optional(),
  projects: z.array(projectSchema).optional(),

  currentRole: z.string().optional(),
  preferredRoles: z.array(z.string()).optional(),

  employmentTypes: z
    .array(z.enum(["full-time", "part-time", "contract", "internship"]))
    .optional(),

  location: z
    .object({
      city: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
  jobPreference: z.enum(["remote", "hybrid", "onsite"]).optional(),
});

// ---------- create profile ---------
const createProfileSchema = z.object({
  body: createProfile.strict("Unknown field is not allowed"),
});

// --------- Update Profile ----------
const updateProfileSchema = z.object({
  body: createProfileSchema.partial(),
});

export const UserProfileValidations = {
  createProfileSchema,
  updateProfileSchema,
};
