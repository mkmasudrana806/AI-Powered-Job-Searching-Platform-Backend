import { z } from "zod";

const applyJobSchema = z.object({
  coverLetter: z
    .string()
    .max(1000, "Cover letter should not be more than 1000 characters")
    .optional(),
});

const applyJobValidationSchema = z.object({
  body: applyJobSchema.strict("Unknown key is not allowed!"),
});

export const ApplicationValidations = {
  applyJobValidationSchema,
};
