import z from "zod";
const CIQuestion = z.object({
  body: z.object({
    candidateIds: z.array(z.string()),
  }),
});


export const CIQuestionValidation = {
  CIQuestion,
};
