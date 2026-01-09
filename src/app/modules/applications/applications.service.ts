import { Application } from "./applications.model";
import { validateJobApplyBusinessRules } from "./applications.utils";
import QueryBuilder from "../../queryBuilder/queryBuilder";
import { TApplication, TApplicationStatus } from "./applications.interface";
import AppError from "../../utils/AppError";
import httpStatus from "http-status";
import { APPLICATION_STATUS_TRANSITIONS } from "./applications.constant";
import { Types } from "mongoose";

/**
 * --------------------- apply job ----------------------
 *
 * @param jobId job id
 * @param applicantId applicant id
 * @param payload cover letter (optional)
 * @returns application id and status
 */
const applyJobIntoDB = async (
  jobId: string,
  applicantId: string,
  payload: Partial<TApplication>
) => {
  // validate business rules
  const job = await validateJobApplyBusinessRules(jobId, applicantId);

  // fetch applicant profile snapshot
  //   const profile = await UserProfile.findOne({ user: applicantId }).select(
  //     "headline skills summary"
  //   );

  // build snapshot (safe even if profile is missing)
  //   const snapshot = profile
  //     ? {
  //         headline: profile.headline,
  //         skills: profile.skills,
  //         experienceSummary: profile.summary,
  //       }
  //     : undefined;

  // create application
  const application = await Application.create({
    job: jobId,
    company: job.company,
    applicant: applicantId,
    resumeUrl: payload.resumeUrl,
    coverLetter: payload.coverLetter,
    // applicantProfileSnapshot: snapshot,
    status: "applied",
    appliedAt: new Date(),
  });

  return {
    applicationId: application._id,
    status: application.status,
  };
};

/**
 * ------------------ get my applications --------------------
 *
 * @param applicantId user id used in job apply
 * @returns
 */
const getMyApplicationsFromDB = async (
  applicantId: string,
  query: Record<string, unknown>
) => {
  const applicationQuery = new QueryBuilder<TApplication>(
    Application.find(),
    query
  ).fieldsLimiting();
  const meta = await applicationQuery.countTotal();
  const result = await applicationQuery.modelQuery;

  return { meta, result };
};

/**
 * -------------------- withdrawalApplication ----------------------
 *
 * @param applicationId application id
 * @param userId who want withdrawal
 * @returns message
 * @rules applied and reviewing job allowed to withdraw
 *
 */
const withdrawApplicationFromDB = async (
  applicationId: string,
  userId: string
) => {
  // atomic action, avoid race condition
  const result = await Application.findOneAndUpdate(
    {
      _id: applicationId,
      applicant: userId,
      status: { $in: ["applied", "reviewing"] },
    },
    {
      status: "withdrawn",
      $push: {
        statusHistory: {
          status: "withdrawn",
          at: new Date(),
          by: userId,
        },
      },
      withdrawnAt: new Date(),
    },
    { new: true }
  );

  if (!result) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Application cannot be withdrawn"
    );
  }

  return result;
};

/**
 * --------------------- Get applications for a job -----------------
 * @param companyId company id
 * @param jobId job id
 * @returns lists of applications for this job
 */
const getApplicationsForAJobFromDB = async (
  companyId: string,
  jobId: string,
  query: Record<string, unknown>
) => {
  const applicationQuery = new QueryBuilder<TApplication>(
    Application.find({ company: companyId, job: jobId }),
    query
  );
  const meta = await applicationQuery.countTotal();
  const data = await applicationQuery.modelQuery;

  return { meta, data };
};

/**
 * ------------------ update application status -------------------
 *
 * @param companyId company id
 * @param applicationId application id
 * @param userId who change the status (recruiter or owner)
 * @param payload new status
 * @returns message
 */
const updateApplicationStatusIntoDB = async (
  companyId: string,
  applicationId: string,
  userId: string,
  payload: TApplicationStatus
) => {
  // read application status
  const application = await Application.findOne({
    _id: applicationId,
    company: companyId,
  }).select("status");

  if (!application) {
    throw new AppError(httpStatus.NOT_FOUND, "Application not found");
  }

  // enfore application transition status validation
  const allowedNextStatuses =
    APPLICATION_STATUS_TRANSITIONS[application.status] || [];

  if (!allowedNextStatuses.includes(payload.status)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Invalid status transition from '${application.status}' to '${payload.status}'`
    );
  }

  // optimistic update
  const updatedApplication = await Application.findOneAndUpdate(
    {
      _id: applicationId,
      status: application.status, // optimistic concurrency
    },
    {
      status: payload.status,
      $push: {
        statusHistory: {
          status: payload.status,
          at: new Date(),
          by: userId,
        },
      },
    },
    { new: true }
  );

  if (!updatedApplication) {
    throw new AppError(
      httpStatus.CONFLICT,
      "Application status was updated by another process"
    );
  }

  return updatedApplication;
};

/**
 * ------------------- get single application ------------------
 *
 * @param applicationId application id to get details
 * @param userId whos application
 * @returns single application details
 */
const getMySingleApplicationFromDB = async (
  applicationId: string,
  applicantId: string
) => {
  // create pipeline as populate less efficient
  const pipeline = [
    {
      $match: {
        _id: new Types.ObjectId(applicationId),
        applicant: new Types.ObjectId(applicantId),
      },
    },

    // lookup job data
    {
      $lookup: {
        from: "jobs",
        localField: "job",
        foreignField: "_id",
        as: "job",
      },
    },
    { $unwind: "$job" },

    // lookup company details
    {
      $lookup: {
        from: "companies",
        localField: "company",
        foreignField: "_id",
        as: "company",
      },
    },
    { $unwind: "$company" },

    // shape the result
    {
      $project: {
        _id: 1,
        status: 1,
        createdAt: 1,
        withdrawnAt: 1,

        job: {
          _id: "$job._id",
          title: "$job.title",
          location: "$job.location",
          employmentType: "$job.employmentType",
        },

        company: {
          _id: "$company._id",
          name: "$company.name",
          logo: "$company.logo",
        },
      },
    },
  ];

  const result = await Application.aggregate(pipeline);

  if (!result.length) {
    throw new AppError(httpStatus.NOT_FOUND, "Application not found");
  }

  return result[0];
};

export const ApplicationServices = {
  applyJobIntoDB,
  getMyApplicationsFromDB,
  withdrawApplicationFromDB,
  getApplicationsForAJobFromDB,
  updateApplicationStatusIntoDB,
  getMySingleApplicationFromDB,
};
