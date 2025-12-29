import z from "zod";

const memberSchema = z.object({
  userId: z.string(),
  role: z.enum(["owner", "admin", "recruiter"]),
});

const locationSchema = z.object({
  city: z.string().optional(),
  country: z.string().optional(),
  officeAddress: z.string().optional(),
  geo: z
    .object({
      lat: z.number().optional(),
      lng: z.number().optional(),
    })
    .optional(),
});

const createCompanySchema = z.object({
  name: z.string({
    required_error: "Company name is required",
  }),
  description: z
    .string({
      required_error: "Company description is required",
    })
    .min(15, "Description should be at least 15 characters long"),
  industry: z.string({
    required_error: "Industry is required",
  }),
  website: z.string().url().optional(),
  logo: z.string().optional(),
  location: locationSchema.optional(),
});

// ------------------- create company -------------------
const createCompanyValidationSchema = z.object({
  body: createCompanySchema.strict("No unknown keys allowed"),
});

// ------------------- update company -------------------
const updateCompanyValidationSchema = z.object({
  body: createCompanySchema.partial().strict("No unknown keys allowed"),
});

// ------------------- add recruiter -------------------
const addRecruiterValidationSchema = z.object({
  body: z.object({
    userId: z.string({
      required_error: "userId is required",
    }),
  }),
});

export const CompanyValidations = {
  createCompanyValidationSchema,
  updateCompanyValidationSchema,
  addRecruiterValidationSchema,
};
