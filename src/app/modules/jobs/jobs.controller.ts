import httpStatus from "http-status";
import asyncHandler from "../../utils/asyncHandler";
import sendResponse from "../../utils/sendResponse";
import { JobServices } from "./jobs.service";
import { TCompanyMiddlewareData } from "../companies/companies.interface";
import AppError from "../../utils/AppError";
import { TJOB_STATUS } from "./jobs.interface";
import generateJobDraftService from "../../ai/employer/jobDraftGenerate.service";

/**
 * ------------------- create job -------------------
 */
const createJob = asyncHandler(async (req, res) => {
  const { companyId } = req.company;
  const { userId } = req.user;
  const data = req.body;
  const job = await JobServices.createJobIntoDB(companyId, userId, data);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Job created successfully",
    data: job,
  });
});

/**
 * ------------------- publish draft job -------------------
 */
const publishDraftJob = asyncHandler(async (req, res) => {
  const company = req.company;
  const { userId } = req.user;
  const { jobId } = req.params;
  const data = req.body;

  const result = await JobServices.publishDraftJobIntoDB(
    company,
    userId,
    jobId,
    data,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Draft job published successfully",
    data: result,
  });
});

/**
 * ------------------- change job status -------------------
 */
const changeJobStatus = asyncHandler(async (req, res) => {
  // take action status from api route
  const statusMap = {
    open: "open",
    close: "closed",
    archive: "archived",
  };

  const action = req.path.split("/").pop();
  const status = action
    ? statusMap[action as keyof typeof statusMap]
    : undefined;

  if (!status) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid job status action");
  }

  const company = req.company;
  const { userId } = req.user;
  const { jobId } = req.params;

  const result = await JobServices.changeJobStatusIntoDB(
    company,
    jobId,
    userId,
    status as TJOB_STATUS,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Job status changed to ${status} successfully`,
    data: result,
  });
});

/**
 * ------------------- update job -------------------
 */
const updateJob = asyncHandler(async (req, res) => {
  const { companyId } = req.company;
  const { jobId } = req.params;
  const updatedData = req.body;
  await JobServices.updateJobIntoDB(companyId, jobId, updatedData);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Job updated successfully",
    data: null,
  });
});

/**
 * ------------------- update job ranking config -------------------
 */
const updateJobRankingConfig = asyncHandler(async (req, res) => {
  const { companyId } = req.company;
  const { jobId } = req.params;
  const { rankingConfig } = req.body;
  await JobServices.updateJobRankingConfigIntoDB(
    companyId,
    jobId,
    rankingConfig,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Job ranking config updated successfully",
    data: null,
  });
});

/**
 * ------------------- delete job -------------------
 */
const deleteJob = asyncHandler(async (req, res) => {
  const { companyId } = req.company;
  const { jobId } = req.params;

  await JobServices.deleteJobFromDB(companyId, jobId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Job deleted successfully",
    data: null,
  });
});

/**
 * ------------------- get company jobs -------------------
 */
const getCompanyJobs = asyncHandler(async (req, res) => {
  const { companyId } = req.company;

  const jobs = await JobServices.getCompanyJobsFromDB(companyId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Company jobs retrieved successfully",
    data: jobs,
  });
});

// ================= ai related controller ================
/**
 * ------------------- job post draft assistant -------------------
 */
const jobPostDraftAssistant = asyncHandler(async (req, res) => {
  const { companyId } = req.company;
  const userInput = req.body.userInput;

  const jobs = await generateJobDraftService(companyId, userInput);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Job draft created successfully",
    data: jobs,
  });
});

export const JobControllers = {
  createJob,
  publishDraftJob,
  changeJobStatus,
  updateJob,
  updateJobRankingConfig,
  deleteJob,
  getCompanyJobs,
  jobPostDraftAssistant,
};
