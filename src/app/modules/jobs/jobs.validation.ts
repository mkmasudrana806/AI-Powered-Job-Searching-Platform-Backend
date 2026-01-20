import z from "zod";

// Salary
const salarySchema = z.object({
  type: z.enum(["fixed", "range", "negotiable", "not_disclosed"]),
  min: z.number().nullable().optional(),
  max: z.number().nullable().optional(),
  currency: z.string().default("BDT"),
  rawText: z.string({
    required_error: "Salary text is required",
  }),
});

// location
const locationSchema = z.object({
  city: z.string().optional(),
  country: z.string().optional(),
  remote: z.boolean().optional(),
  officeAddress: z.string().nullable().optional(),
  geo: z
    .object({
      lat: z.number().optional(),
      lng: z.number().optional(),
    })
    .optional(),
});

// qualifications
const qualificationSchema = z.object({
  educationLevel: z.enum([
    "ssc",
    "hsc",
    "diploma",
    "bachelor",
    "master",
    "phd",
    "not_required",
  ]),
  fieldsOfStudy: z.array(z.string()).optional(),
  text: z.string({
    required_error: "Qualification description is required",
  }),
});

const createJobSchema = z.object({
  title: z.string(),
  description: z.string(),
  responsibilities: z.array(z.string()).optional(),
  requiredSkills: z.array(z.string()).optional(),
  experienceLevel: z.enum(["junior", "mid", "senior", "lead"]),
  employmentType: z.enum(["full-time", "part-time", "contract", "internship"]),
  qualifications: qualificationSchema,
  rankingConfig: z.object({
    name: z.string().optional().default("default"),
    matchScore: z.number().optional().default(0.4),
    titleMatch: z.number().optional().default(0.1),
    skills: z.number().optional().default(0.2),
    experienceYears: z.number().optional().default(0.15),
    employmentType: z.number().optional().default(0.05),
    fieldOfStudy: z.number().optional().default(0.05),
    recency: z.number().optional().default(0.05),
  }),
  salary: salarySchema,
  location: locationSchema,
  expiresAt: z.date().optional(),
});

// -------- create job --------
const createJobValidationSchema = z.object({
  body: createJobSchema.strict("No unknown keys allowed"),
});

// -------- draft job publish --------
const createJobSchemaExtended = createJobSchema.extend({
  status: z.enum(["open"]),
});

const draftJobValidationSchema = z.object({
  body: createJobSchemaExtended.strict("No unknown keys allowedss"),
});

// -------- change job status --------
const changeJobStatusValidationSchema = z.object({
  body: z
    .object({
      status: z.enum(["open", "closed", "archived"], {
        required_error: "New status is required",
        invalid_type_error: "Invalid status value",
      }),
    })
    .strict("No unknown keys allowed"),
});

// -------- update job --------
const updateJobValidationSchema = z.object({
  body: createJobSchema.partial().strict(),
});

export const JobValidations = {
  createJobValidationSchema,
  updateJobValidationSchema,
  changeJobStatusValidationSchema,
  draftJobValidationSchema,
};
