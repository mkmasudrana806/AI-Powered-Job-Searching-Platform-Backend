import config from "../../config/env";
import { Job } from "../../modules/jobs/jobs.model";
import { buildJobEmbeddingText } from "../../modules/jobs/jobs.utils";

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
