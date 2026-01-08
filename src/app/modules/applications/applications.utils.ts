import httpStatus from "http-status";
import { Types } from "mongoose";
import AppError from "../../utils/AppError";
import { Job } from "../jobs/jobs.model";
import { Company } from "../companies/companies.model";
import { Application } from "./applications.model";

export const validateJobApplyBusinessRules = async (
  jobId: string,
  applicantId: string
) => {
  // job must exist and be open
  const job = await Job.findById(jobId).select("status company");
  if (!job) {
    throw new AppError(httpStatus.NOT_FOUND, "Job not found");
  }

  if (job.status !== "open") {
    throw new AppError(httpStatus.BAD_REQUEST, "Job is already closed!");
  }

  // prevent duplicate application
  const alreadyApplied = await Application.exists({
    job: jobId,
    applicant: applicantId,
  });

  if (alreadyApplied) {
    throw new AppError(
      httpStatus.CONFLICT,
      "You have already applied to this job"
    );
  }

  // prevent company members from applying
  const isCompanyMember = await Company.exists({
    _id: job.company,
    "members.userId": applicantId,
  });

  if (isCompanyMember) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Company members cannot apply to their own job"
    );
  }

  console.log("is company member: ", isCompanyMember);
  return job;
};
