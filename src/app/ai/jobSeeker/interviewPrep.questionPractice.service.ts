import httpStatus from "http-status";
import AppError from "../../utils/AppError";
import { InterviewPrep } from "../../modules/interviewPreparation/interviewPreparation.model";
import { AiResponseSchema } from "../aiResponseSchema";
import aiServices from "../aiService";
import getQuestionPracticePrompt from "../prompts/interviewQuestionPractice.prompt";

const interviewQuestionPracticeService = async (
  userId: string,
  prepId: string,
  questionId: string,
  userAnswer: { user_answer: string },
) => {
  // fetch the existing context
  const prep = await InterviewPrep.findOne({ user: userId, _id: prepId });
  if (!prep)
    throw new AppError(httpStatus.NOT_FOUND, "Preparation session not found.");

  // find the question ID
  const questionData = prep.question_bank.find(
    (q) => q._id.toString() === questionId,
  );

  if (!questionData)
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Question not found in this session.",
    );

  // get prompt
  const { systemPrompt, userPrompt } = getQuestionPracticePrompt(
    questionData,
    userAnswer,
  );

  // evaluate the answer
  const evaluation = JSON.parse(
    await aiServices.generateContent(
      systemPrompt,
      userPrompt,
      AiResponseSchema.interviewQuestionEvaluation,
    ),
  );
  const newAttempt = {
    user_answer: userAnswer.user_answer,
    ai_feedback: evaluation.ai_feedback,
    readiness_score: evaluation.readiness_score,
    suggested_refinement: evaluation.suggested_refinement,
    attempted_at: Date,
  };

  // update user attempts for that question
  const updatedPrep = await InterviewPrep.findOneAndUpdate(
    { _id: prepId, user: userId, "question_bank._id": questionId },
    {
      $push: {
        "question_bank.$.user_attempts": newAttempt,
      },
    },
    { new: true },
  );

  return evaluation;
};

export default interviewQuestionPracticeService;
