import httpStatus from "http-status";
import asyncHandler from "../../utils/asyncHandler";
import sendResponse from "../../utils/sendResponse";
import { JobServices } from "./jobs.service";

// ------------------- create job -------------------
const createJob = asyncHandler(async (req, res) => {
  const result = await JobServices.createJobIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Job created successfully",
    data: result,
  });
});

// ------------------- get all jobs -------------------
// const getAllJobs = asyncHandler(async (req, res) => {
//   const { meta, result } = await JobServices.getAllJobsFromDB(req.query);

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Jobs retrieved successfully",
//     meta,
//     data: result,
//   });
// });

export const JobControllers = {
  createJob,
  //   getAllJobs,
};
