import z from "zod";

// -------- salary --------
const salarySchema = z.object({
  type: z.enum(["fixed", "range", "negotiable", "not_disclosed"]),
  min: z.number().nullable().optional(),
  max: z.number().nullable().optional(),
  currency: z.string().default("BDT"),
  rawText: z.string({
    required_error: "Salary text is required",
  }),
});

// -------- location --------
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

// -------- qualifications --------
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

// -------- create job --------
const createJobValidationSchema = z.object({
  body: z.object({
    companyId: z.string(),

    title: z.string(),
    description: z.string(),

    responsibilities: z.array(z.string()).optional(),
    requiredSkills: z.array(z.string()).optional(),

    experienceLevel: z.enum(["junior", "mid", "senior", "lead"]),
    employmentType: z.enum([
      "full-time",
      "part-time",
      "contract",
      "internship",
    ]),

    qualifications: qualificationSchema,
    salary: salarySchema,
    location: locationSchema,
  }),
});

export const JobValidations = {
  createJobValidationSchema,
};
