import httpStatus from "http-status";
import asyncHandler from "../../utils/asyncHandler";
import sendResponse from "../../utils/sendResponse";
import interviewPrepDashboardService from "../../ai/jobSeeker/interviewPrep.service";

/*
 * ---------------------- interview Preparation Dashboard -----------------------
 */
const interviewPrepDashboard = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const jobId = req.params.jobId;

  const result = await interviewPrepDashboardService(userId, jobId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Interview preparation dashboard is Ready!",
    data: result,
  });
});

export const InterviewPrepController = {
  interviewPrepDashboard,
};
