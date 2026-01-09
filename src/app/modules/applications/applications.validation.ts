import { z } from "zod";
import errorMap from "zod/lib/locales/en";

// apply job schema
const applyJobSchema = z.object({
  coverLetter: z
    .string()
    .max(1000, "Cover letter should not be more than 1000 characters")
    .optional(),
});

const applyJobValidationSchema = z.object({
  body: applyJobSchema.strict("Unknown key is not allowed!"),
});

// update application status
const applicationStatus = z.object({
  status: z.enum(
    ["applied", "reviewing", "shortlisted", "rejected", "hired", "withdrawn"],
    { errorMap: () => ({ message: "Invalid job status" }) }
  ),
});

const updateApplicationStatusValidation = z.object({
  body: applicationStatus.strict("Unknown fields is not allowed!"),
});

export const ApplicationValidations = {
  applyJobValidationSchema,
  updateApplicationStatusValidation,
};
