import { Types } from "mongoose";
// import { Application } from "./application.model";

import { Application } from "./applications.model";
import { validateJobApplyBusinessRules } from "./applications.utils";

export const applyJobIntoDB = async (
  jobId: string,
  applicantId: string,
  payload: {
    resumeUrl?: string;
    coverLetter?: string;
  }
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

  // NOTE:
  // AI matchScore & rankingScore should be generated ASYNC (queue)
  // NOT here

  return application;
};
