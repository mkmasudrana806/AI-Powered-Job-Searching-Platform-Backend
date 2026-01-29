import httpStatus from "http-status";
import asyncHandler from "../../utils/asyncHandler";
import sendResponse from "../../utils/sendResponse";
import interviewQuestionPracticeService from "../../ai/jobSeeker/interviewPrep.questionPractice.service";
import { interviewPrepService } from "./interviewPreparation.service";

/*
 * ---------------------- interview Preparation Dashboard -----------------------
 */
const interviewPrepDashboard = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const jobId = req.params.jobId;

  const result = await interviewPrepService.interviewPrepStart(userId, jobId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Interview preparation dashboard is Ready!",
    data: result,
  });
});

/*
 * ---------------------- interview question practice -----------------------
 */
const interviewQuestionPractice = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const prepId = req.params.prepId;
  const questionId = req.params.questionId;
  const userAnswer = req.body;

  const result = await interviewQuestionPracticeService(
    userId,
    prepId,
    questionId,
    userAnswer,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Interview preparation dashboard is Ready!",
    data: result,
  });
});

export const InterviewPrepController = {
  interviewPrepDashboard,
  interviewQuestionPractice,
};
