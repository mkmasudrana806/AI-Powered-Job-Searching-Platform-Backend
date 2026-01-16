import { Job } from "../../modules/jobs/jobs.model";
import { buildJobEmbeddingText } from "../../modules/jobs/jobs.utils";
import { UserProfile } from "../../modules/userProfile/userProfile.model";

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
  // TODO: generate embedding
  // generate job embedding
  //   const embedding = generateEmbedding(embeddingText)
  //   job.embeddingModel = config.embedding_model_name;
  //   job.embedding = embedding;

  await job.save();
  return "Embedding is generated!";
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

  // if embedding dirty true, then generate embedding
  if (profile?.embeddingDirty) {
    profile.embeddingDirty = false;

    // TODO: generate embedding
    // set embedding value
    // profile.embedding = generateEmbedding(profile.embeddingText)
    await profile.save();
  }

  return "Embedding is generated!";
};
