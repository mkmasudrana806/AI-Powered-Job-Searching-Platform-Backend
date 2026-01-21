import { Types } from "mongoose";
import { TJob, TJOB_STATUS, TRankingConfig } from "./jobs.interface";
import { Job } from "./jobs.model";
import { buildJobEmbeddingText, validateJobBusinessRules } from "./jobs.utils";
import AppError from "../../utils/AppError";
import httpStatus from "http-status";
import { TCompanyMiddlewareData } from "../companies/companies.interface";
import { validateObjectIDs } from "../../utils/validateObjectIDs";
import { embeddingQueue } from "../../jobs/queues/embedding.queue";

/**
 * ------------------ create job as draft or open ------------------
 *
 * @param company company id to which job belongs
 * @param createdBy who is creating the job
 * @param payload updated Job data
 * @returns message
 */
const createJobIntoDB = async (
  companyId: string,
  createdBy: string,
  payload: TJob,
) => {
  // validate object ids
  validateObjectIDs(
    { name: "company id", value: companyId },
    { name: "user id", value: createdBy },
  );

  // ----------- save job as draft --------------
  if (payload.status === "draft") {
    validateJobBusinessRules(payload);
    await Job.create({
      ...payload,
      company: companyId,
      createdBy,
    });

    return "Job saved as draft successfully";
  }

  // ----------- save job as open  -------------
  // apply business rules validation
  validateJobBusinessRules(payload);

  // save job to DB
  const result = await Job.create({
    ...payload,
    company: companyId,
    createdBy,
  });

  // submit new job embedding to worker
  embeddingQueue.add(
    "job",
    { jobId: result._id },
    {
      attempts: 2,
      backoff: {
        type: "exponential",
        delay: 3000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    },
  );

  return result;
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
  payload: Partial<TJob>,
) => {
  // validate object ids
  validateObjectIDs(
    { name: "job id", value: jobId },
    { name: "user id", value: userId },
  );

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
      "Only draft jobs can be published",
    );
  }

  // owner and job creator can publish the job
  if (
    userRoleInCompany === "recruiter" &&
    existingJob.createdBy.toString() !== userId
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only the creator or owner can publish this job",
    );
  }

  if (!payload?.status) {
    throw new AppError(httpStatus.FORBIDDEN, "Job status should be open");
  }

  const mergedJob = { ...existingJob.toObject(), ...payload };

  // apply business rules validation
  validateJobBusinessRules(mergedJob);

  // build embedding input
  const embeddingText = buildJobEmbeddingText(mergedJob);
  // const embedding = await generateEmbedding(embeddingText);

  const updatedJob = {
    ...payload,
    // embedding: embedding,
    // embeddingModel: "gemini-text-embedding-004",
  };

  const updated = await Job.updateOne(
    { _id: jobId, company: companyId },
    { $set: updatedJob },
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
  status: TJOB_STATUS,
) => {
  // validate object ids
  validateObjectIDs(
    { name: "job id", value: jobId },
    { name: "user id", value: userId },
  );
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
    { status: 1, createdBy: 1 },
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
      "Only the creator or owner can change the job status",
    );
  }

  const allowedNextStatuses = STATUS_TRANSITIONS[job.status];

  if (!allowedNextStatuses.includes(status)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Invalid status transition from ${job.status} to ${status}`,
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
    },
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
  companyId: string,
  jobId: string,
  payload: Partial<TJob>,
) => {
  // validate object ids
  validateObjectIDs(
    { name: "company id", value: companyId },
    { name: "job id", value: jobId },
  );

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
    const embeddingText = buildJobEmbeddingText(mergedJob);
    // const embedding = await generateEmbedding(embeddingText);
    // payload.embedding = embedding;
  }

  const updated = await Job.updateOne(
    { _id: jobId, company: companyId },
    { $set: payload },
  );

  if (updated.matchedCount === 0) {
    throw new AppError(httpStatus.NOT_FOUND, "Job not found");
  }

  return "Job updated successfully";
};

const updateJobRankingConfigIntoDB = async (
  companyId: string,
  jobId: string,
  payload: TRankingConfig,
) => {
  // validate object ids
  validateObjectIDs(
    { name: "company id", value: companyId },
    { name: "job id", value: jobId },
  );

  // validate that weights sum to 1.0
  const totalWeight =
    (payload.matchScore || 0) +
    (payload.titleMatch || 0) +
    (payload.skills || 0) +
    (payload.experienceYears || 0) +
    (payload.employmentType || 0) +
    (payload.fieldOfStudy || 0) +
    (payload.recency || 0);

  if (totalWeight > 1.0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Total weights sum expected 1.0 but got " + totalWeight.toFixed(2),
    );
  }
  const updated = await Job.updateOne(
    { _id: jobId, company: companyId },
    { $set: { rankingConfig: payload } },
  );
  if (updated.matchedCount === 0) {
    throw new AppError(httpStatus.NOT_FOUND, "Job not found");
  }
  return "Job ranking config updated successfully";
};

/**
 * ------------------- delete job -------------------
 * @param companyId company to which job belongs
 * @param jobId job id to be deleted
 * @returns message
 */
const deleteJobFromDB = async (companyId: string, jobId: string) => {
  // validate object ids
  validateObjectIDs(
    { name: "company id", value: companyId },
    { name: "job id", value: jobId },
  );

  const deleted = await Job.findOneAndUpdate(
    {
      _id: jobId,
      company: companyId,
      isActive: true,
      isDeleted: false,
    },
    { isDeleted: true, isActive: false },
    { new: true },
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
const getCompanyJobsFromDB = async (companyId: string) => {
  // validate object ids
  validateObjectIDs({ name: "company id", value: companyId });

  const result = await Job.find({ company: companyId }).sort({ createdAt: -1 });
  return result;
};

export const JobServices = {
  createJobIntoDB,
  publishDraftJobIntoDB,
  changeJobStatusIntoDB,
  updateJobIntoDB,
  updateJobRankingConfigIntoDB,
  deleteJobFromDB,
  getCompanyJobsFromDB,
};
