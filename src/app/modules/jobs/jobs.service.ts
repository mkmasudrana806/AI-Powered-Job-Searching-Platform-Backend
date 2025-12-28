import { TJob } from "./jobs.interface";
import { Job } from "./jobs.model";
import { buildEmbeddingText, validateJobBusinessRules } from "./jobs.utils";

const searchableFields = ["title", "description", "requiredSkills"];

/**
 * ------------------ create job ------------------
 * @param payload Job data
 * @returns message
 */
const createJobIntoDB = async (payload: TJob) => {
  // apply business rules validation
  validateJobBusinessRules(payload);

  // build embedding input
  const embeddingText = buildEmbeddingText(payload);

  // generate embedding
  //   const embedding = await generateEmbedding(embeddingText);

  // save job to DB
  return await Job.create({
    ...payload,
    // embedding,
    embeddingModel: "gemini-text-embedding-004",
  });
};

export const JobServices = {
  createJobIntoDB,
  //   getAllJobsFromDB,
};
