import z from "zod";

const practiceInterviewQuestion = z.object({
  body: z.object({
    user_answer: z.string(),
  }),
});

export const InterviewPreparationSchema = {
  practiceInterviewQuestion,
};
