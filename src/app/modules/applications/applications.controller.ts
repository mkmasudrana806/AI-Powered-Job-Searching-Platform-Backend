import { Request, Response } from "express";
import httpStatus from "http-status";
import asyncHandler from "../../utils/asyncHandler";
import { applyJobIntoDB } from "./applications.service";
import sendResponse from "../../utils/sendResponse";

const applyJob = asyncHandler(async (req: Request, res: Response) => {
  const jobId = req.params.jobId;
  const applicantId = req.user.userId;
  const payload = req.body;
  const result = await applyJobIntoDB(jobId, applicantId, payload);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Application submitted successfully",
    data: {
      applicationId: result._id,
      status: result.status,
    },
  });
});

export const ApplicationControllers = {
  applyJob,
};
