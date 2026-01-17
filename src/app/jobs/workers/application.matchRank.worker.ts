import { Worker } from "bullmq";
import redisConnection from "../../config/redis";
import { getApplicationDetails } from "../workerHandlers/application.matchRank.handler";
import AppError from "../../utils/AppError";
import httpStatus from "http-status";
import cosineSimilarity from "../../utils/consineSimilarityMatching";
import { TJob } from "../../modules/jobs/jobs.interface";
import { TUserProfile } from "../../modules/userProfile/userProfile.interface";
import aiServices from "../../ai/aiService";
import getAINotesPromt from "../../ai/prompts/aiNotes.prompt";

const applicationMatchRankWorker = new Worker(
  "application-match-queue",
  async (job) => {
    const applicationId = job.data.applicationId;

    // fetch application data with profile and job data
    const application = await getApplicationDetails(applicationId);
    const jobData: Partial<TJob> = application.job;
    const profile: Partial<TUserProfile> = application.profile;

    // check both profile and job has embedding data
    if (!jobData?.embedding || !profile?.embedding) {
      throw new AppError(httpStatus.BAD_REQUEST, "Embedding missing!");
    }

    // calculate match score
    const matchScore = cosineSimilarity(jobData.embedding, profile.embedding);

    // generate prompt
    const { userPrompt, systemPrompt } = getAINotesPromt(jobData, {
      ...profile,
      experienceSnapshot: application.applicantProfileSnapshot,
    });

    // ai notes
    const aiNotes = await aiServices.generateContent(userPrompt, systemPrompt);

    // TODO: application rank score
  },
  {
    connection: redisConnection,
    concurrency: 3,
  },
);

// active job
applicationMatchRankWorker.on("active", (job, prev) => {
  console.log(`${job.name.toUpperCase()} scoring is active`);
});

// log on any completed job
applicationMatchRankWorker.on("completed", (job) => {
  console.log(
    `${job.name.toUpperCase()} scoring is completed for ID: ${job.data.applicationId}`,
  );
});

// log on any failed job
applicationMatchRankWorker.on("failed", (job, err) => {
  if (job) {
    console.error(
      `${job.name.toUpperCase()} scoring failed for ID: ${job.data.applicationId}. Reason: ${
        err.message
      }`,
    );
  }
});

export default applicationMatchRankWorker;
