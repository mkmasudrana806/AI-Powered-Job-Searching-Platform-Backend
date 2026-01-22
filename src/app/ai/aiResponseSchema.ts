import { z } from "zod";

// application AI notes response schema
export const applicationAiNotesSchema = z.array(z.string());
