import httpStatus from "http-status";
import aiServices from "../../ai/aiService";
import config from "../../config/env";
import { Job } from "../../modules/jobs/jobs.model";
import { buildJobEmbeddingText } from "../../modules/jobs/jobs.utils";
import { UserProfile } from "../../modules/userProfile/userProfile.model";
import AppError from "../../utils/AppError";

/**
 * --------- generate job embedding as background job -------------
 *
 * @param jobId jobId for generating embedding
 * @returns message
 */
export const jobEmbeddingHandler = async (jobId: string) => {
  const job = await Job.findById(jobId).select("embeddingDirty embeddingText");
  if (!job) return;

  const embeddingText = buildJobEmbeddingText(job);
  //   generate job embedding
  const embedding = await aiServices.generateEmbedding(embeddingText);
  job.embeddingModel = config.embedding_model_name;
  job.embedding = embedding;

  await job.save();
  return "Embedding for job description is generated!";
};

/**
 * --------- generate proifle embedding as background job -------------
 *
 * @param profileId profile for generating embedding
 * @returns message
 */
export const profileEmbeddingHandler = async (profileId: string) => {
  const profile = await UserProfile.findById(profileId).select(
    "embeddingDirty embeddingText",
  );

  if (!profile || profile.isDeleted) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Embedding not possible as user is deleted!",
    );
  }

  // if embedding dirty true, then generate embedding
  if (profile?.embeddingDirty) {
    profile.embeddingDirty = false;
    profile.embedding = await aiServices.generateEmbedding(
      profile.embeddingText ?? "",
    );

    await profile.save();
  }

  return "Embedding for profile is generated!";
};
