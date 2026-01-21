import { Types } from "mongoose";
import { Application } from "../../modules/applications/applications.model";
import { CandidateRanking } from "./worker.handler.utils";
import aiServices from "../../ai/aiService";
import getAINotesPrompt from "../../ai/prompts/aiNotes.prompt";
import cosineSimilarity from "../../utils/consineSimilarityMatching";
import AppError from "../../utils/AppError";
import httpStatus from "http-status";
import { TUserProfile } from "../../modules/userProfile/userProfile.interface";
import { TJob } from "../../modules/jobs/jobs.interface";

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
  const aiNotes = await aiServices.generateContent(userPrompt, systemPrompt);

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
