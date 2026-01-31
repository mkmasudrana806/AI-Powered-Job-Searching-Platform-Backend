import httpStatus from "http-status";
import asyncHandler from "../../utils/asyncHandler";
import sendResponse from "../../utils/sendResponse";
import { CIQuestionService } from "./candidateInterviewQuetions.service";

/**
 * ------------------- candidate specific interview question -------------------
 */
const CIQuestionsGenerate = asyncHandler(async (req, res) => {
  const jobId = req.params.jobId;
  const candidateIds = req.body.candidateIds;

  const result = await CIQuestionService.generateCIQuestion(
    jobId,
    candidateIds,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Interview question is generating...",
    data: result,
  });
});

/**
 * ----------- get all indidividual interview questions -----------
 */
const getIndividualInterviewQuestions = asyncHandler(async (req, res) => {
  const jobId = req.params.jobId;
  const result = await CIQuestionService.getIndividualInterviewQuestions(jobId)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Interview question are retrived sucessfully",
    data: result,
  });
});

export const CIQuestionController = {
  CIQuestionsGenerate,
  getIndividualInterviewQuestions,
};
