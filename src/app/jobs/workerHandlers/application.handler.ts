import { Types } from "mongoose";
import { Application } from "../../modules/applications/applications.model";
import { CandidateRanking } from "./utils";
import aiServices from "../../ai/aiService";
import getAINotesPrompt from "../../ai/prompts/aiNotes.prompt";
import cosineSimilarity from "../../utils/consineSimilarityMatching";
import AppError from "../../utils/AppError";
import httpStatus from "http-status";
import { TUserProfile } from "../../modules/userProfile/userProfile.interface";
import { TJob } from "../../modules/jobs/jobs.interface";
import { Job } from "../../modules/jobs/jobs.model";
import { AiResponseSchema } from "../../ai/aiResponseSchema";
import geminiRateLimiter from "../../ai/geminiRateLimit";

/**
 * ------------ fetch application details with job and profile ------------
 *
 * @param applicationId applicant id for getting details
 * @returns found application data
 */
export const applicationMatchaiNoteHandler = async (applicationId: string) => {
  const pipeline = [
    // find application
    {
      $match: {
        _id: new Types.ObjectId(applicationId),
      },
    },

    // join job
    {
      $lookup: {
        from: "jobs",
        localField: "job",
        foreignField: "_id",
        as: "job",
      },
    },
    { $unwind: "$job" },
    // join user profile
    {
      $lookup: {
        from: "userprofiles",
        localField: "applicant",
        foreignField: "user",
        as: "profile",
      },
    },
    { $unwind: "$profile" },
  ];

  const result = await Application.aggregate(pipeline);
  const application = result[0];
  const jobData: TJob = application.job;
  const profile: TUserProfile = application.profile;

  // check both profile and job has embedding data
  if (!jobData?.embedding || !profile?.embedding) {
    throw new AppError(httpStatus.BAD_REQUEST, "Embedding missing!");
  }

  // calculate match score
  const matchScore = cosineSimilarity(jobData.embedding, profile.embedding);

  // generate prompt
  const { userPrompt, systemPrompt } = getAINotesPrompt(jobData, {
    ...profile,
    experienceSnapshot: application.applicantProfileSnapshot,
  });

  // ai notes
  const response = await geminiRateLimiter.schedule(() =>
    aiServices.generateContent(
      userPrompt,
      systemPrompt,
      AiResponseSchema.applicationAiNotes,
    ),
  );
  const aiNotes = JSON.parse(response);

  // application rank score
  const rankingScore = new CandidateRanking().calculate(
    profile,
    jobData,
    matchScore,
  );

  // save application into database
  await Application.findByIdAndUpdate(
    applicationId,
    {
      matchScore,
      rankingScore,
      aiNotes,
    },
    { new: true },
  );

  return "Application Match/Rank Score Updated Successfully";
};

export const applicantReRankHandler = async (jobId: string) => {
  const job = await Job.findById(jobId);
  if (!job) {
    throw new AppError(httpStatus.NOT_FOUND, "Job not found");
  }

  // fet all applications for the job with profile data
  const applications = await Application.aggregate([
    {
      $match: {
        job: new Types.ObjectId(jobId),
      },
    },
    {
      $lookup: {
        from: "userprofiles",
        localField: "applicant",
        foreignField: "user",
        as: "profile",
      },
    },
    { $unwind: "$profile" },
    {
      $project: {
        _id: 1,
        matchScore: 1,
        "profile.headline": 1,
        "profile.skills": 1,
        "profile.experience": 1,
        "profile.employmentType": 1,
        "profile.totalYearsOfExperience": 1,
        "profile.education": 1,
      },
    },
  ]);

  // loop through each application and recalculate rank score only
  const bulkOps = applications.map((app) => {
    const profile: TUserProfile = app.profile;
    const matchScore: number = app.matchScore;
    const newRankScore = new CandidateRanking().calculate(
      profile,
      job,
      matchScore,
    );

    return {
      updateOne: {
        filter: { _id: app._id },
        update: { rankingScore: newRankScore },
      },
    };
  });

  if (bulkOps.length > 0) {
    await Application.bulkWrite(bulkOps);
  }

  return "Applicant Re-Ranking Completed Successfully";
};
