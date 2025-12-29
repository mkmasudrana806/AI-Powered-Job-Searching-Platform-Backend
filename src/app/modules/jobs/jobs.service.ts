import { Types } from "mongoose";
import { TJob, TJOB_STATUS } from "./jobs.interface";
import { Job } from "./jobs.model";
import { buildEmbeddingText, validateJobBusinessRules } from "./jobs.utils";
import AppError from "../../utils/AppError";
import httpStatus from "http-status";
import { TCompanyMiddlewareData } from "../companies/companies.interface";

/**
 * ------------------ create job as draft or open ------------------
 *
 * @param company company id to which job belongs
 * @param createdBy who is creating the job
 * @param payload updated Job data
 * @returns message
 */
const createJobIntoDB = async (
  company: Types.ObjectId,
  createdBy: Types.ObjectId,
  payload: TJob
) => {
  // ----------- save job as draft --------------
  if (payload.status === "draft") {
    validateJobBusinessRules(payload);
    await Job.create({
      ...payload,
      company,
      createdBy,
    });

    return "Job saved as draft successfully";
  }

  // ----------- save job as open  -------------
  // apply business rules validation
  validateJobBusinessRules(payload);

  // build embedding input
  const embeddingText = buildEmbeddingText(payload);

  // generate embedding
  //   const embedding = await generateEmbedding(embeddingText);

  // save job to DB
  return await Job.create({
    ...payload,
    company,
    createdBy,
    // embedding:
    // embedding,
    embeddingModel: "gemini-text-embedding-004",
  });
};

/**
 * ------------------- publish draft job -------------------
 *
 * @param company company middleware data
 * @param userId who is publishing the job
 * @param jobId job to be published
 * @param payload update data
 * @returns message
 */
const publishDraftJobIntoDB = async (
  company: TCompanyMiddlewareData,
  userId: string,
  jobId: string,
  payload: Partial<TJob>
) => {
  const { companyId, userRoleInCompany } = company;

  // fetch existing job data
  const existingJob = await Job.findOne({ _id: jobId, company: companyId });
  if (!existingJob) {
    throw new AppError(httpStatus.NOT_FOUND, "Job not found");
  }

  // check job status as draft
  if (existingJob.status !== "draft") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Only draft jobs can be published"
    );
  }

  // owner and job creator can publish the job
  if (
    userRoleInCompany === "recruiter" &&
    existingJob.createdBy.toString() !== userId
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only the creator or owner can publish this job"
    );
  }

  if (!payload?.status) {
    throw new AppError(httpStatus.FORBIDDEN, "Job status should be open");
  }

  const mergedJob = { ...existingJob.toObject(), ...payload };

  // apply business rules validation
  validateJobBusinessRules(mergedJob);

  // build embedding input
  const embeddingText = buildEmbeddingText(mergedJob);
  // const embedding = await generateEmbedding(embeddingText);

  const updatedJob = {
    ...payload,
    // embedding: embedding,
    // embeddingModel: "gemini-text-embedding-004",
  };

  const updated = await Job.updateOne(
    { _id: jobId, company: companyId },
    { $set: updatedJob }
  );

  if (updated.matchedCount === 0) {
    throw new AppError(httpStatus.NOT_FOUND, "Job not found");
  }
  return "Job published successfully";
};

/**
 * ------------------- change job status ------------------
 *
 * @param companyId company id belong to job
 * @param jobId job id to change status
 * @param status new status of the job
 * @returns message
 */
const changeJobStatusIntoDB = async (
  company: TCompanyMiddlewareData,
  jobId: string,
  userId: string,
  status: TJOB_STATUS
) => {
  const { companyId, userRoleInCompany } = company;

  const STATUS_TRANSITIONS: Record<string, TJOB_STATUS[]> = {
    draft: ["open"],
    open: ["closed"],
    closed: ["archived"],
    archived: [],
  };

  // fetch existing job
  const job = await Job.findOne(
    { _id: jobId, company: companyId },
    { status: 1, createdBy: 1 }
  );

  if (!job) {
    throw new AppError(httpStatus.NOT_FOUND, "Job not found");
  }

  // only owner and creator can change status
  if (
    userRoleInCompany === "recruiter" &&
    job.createdBy.toString() !== userId
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only the creator or owner can change the job status"
    );
  }

  const allowedNextStatuses = STATUS_TRANSITIONS[job.status];

  if (!allowedNextStatuses.includes(status)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Invalid status transition from ${job.status} to ${status}`
    );
  }

  // if status is open, call draft to publish logic
  if (status === "open") {
    return await publishDraftJobIntoDB(company, userId, jobId, {
      status: "open",
    });
  }

  const updatePayload: Record<string, unknown> = {
    status,
  };

  if (status === "closed") {
    updatePayload.closedAt = new Date();
  }

  if (status === "archived") {
    updatePayload.archivedAt = new Date();
  }

  await Job.updateOne(
    {
      _id: jobId,
      company: companyId,
      status: job.status,
    },
    {
      $set: updatePayload,
    }
  );

  return "Job status updated successfully";
};

/**
 * ------------------- update job -------------------
 * @param companyId company to which job belongs
 * @param jobId job to be updated
 * @param payload update data
 * @returns message
 */
const updateJobIntoDB = async (
  companyId: Types.ObjectId,
  jobId: string,
  payload: Partial<TJob>
) => {
  // apply business rules validation
  validateJobBusinessRules(payload);

  const isSemanticFieldChanged =
    payload.title ||
    payload.description ||
    payload.responsibilities ||
    payload.requiredSkills ||
    payload.qualifications;

  const existingJob = await Job.findOne({ _id: jobId, company: companyId });
  if (!existingJob) {
    throw new AppError(httpStatus.NOT_FOUND, "Job not found");
  }

  const mergedJob = { ...existingJob.toObject(), ...payload };

  // update embedding if relevant fields are updated
  if (isSemanticFieldChanged) {
    const embeddingText = buildEmbeddingText(mergedJob);
    // const embedding = await generateEmbedding(embeddingText);
    // payload.embedding = embedding;
  }

  const updated = await Job.updateOne(
    { _id: jobId, company: companyId },
    { $set: payload }
  );

  if (updated.matchedCount === 0) {
    throw new AppError(httpStatus.NOT_FOUND, "Job not found");
  }

  return "Job updated successfully";
};

/**
 * ------------------- delete job -------------------
 * @param companyId company to which job belongs
 * @param jobId job id to be deleted
 * @returns message
 */
const deleteJobFromDB = async (companyId: Types.ObjectId, jobId: string) => {
  const deleted = await Job.findOneAndUpdate(
    {
      _id: jobId,
      company: companyId,
      isActive: true,
      isDeleted: false,
    },
    { isDeleted: true, isActive: false },
    { new: true }
  );

  if (!deleted) {
    throw new AppError(httpStatus.NOT_FOUND, "Job not found");
  }

  return null;
};

/**
 * ------------------- get company jobs -------------------
 * @param companyId company id, whose jobs are to be loaded
 * @returns list of jobs
 */
const getCompanyJobsFromDB = async (companyId: Types.ObjectId) => {
  const result = await Job.find({ company: companyId }).sort({ createdAt: -1 });
  return result;
};

export const JobServices = {
  createJobIntoDB,
  publishDraftJobIntoDB,
  changeJobStatusIntoDB,
  updateJobIntoDB,
  deleteJobFromDB,
  getCompanyJobsFromDB,
};
