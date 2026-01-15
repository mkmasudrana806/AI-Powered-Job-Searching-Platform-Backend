import { Worker } from "bullmq";
import redisConnection from "../../config/redis";
import { profileEmbeddingHandler } from "../workerHandlers/profile.worker.handler";
import { jobEmbeddingHandler } from "../workerHandlers/job.worker.handler";

console.log("Embedding worker is booting...");

/**
 * Worker for profile, job data embedding or any
 */
const embeddingWorker = new Worker(
  "embedding-queue",
  async (job) => {
    switch (job.name) {
      case "profile":
        return await profileEmbeddingHandler(job.data.profileId);
      case "job":
        return await jobEmbeddingHandler(job.data.jobId);
    }
  },
  {
    connection: redisConnection,
    concurrency: 3,
  }
);

// active job
embeddingWorker.on("active", (job, prev) => {
  console.log(`${job.name.toUpperCase()} embedding is active`);
});

// get job id
const getIdentifier = (job: any) => {
  const mapping: Record<string, string> = {
    profile: job.data.profileId,
    job: job.data.jobId,
  };
  return mapping[job.name] || "Unknown ID";
};

// log on any completed job
embeddingWorker.on("completed", (job) => {
  const id = getIdentifier(job);
  console.log(`${job.name.toUpperCase()} embedding is completed for ID: ${id}`);
});

// log on any failed job
embeddingWorker.on("failed", (job, err) => {
  if (job) {
    const id = getIdentifier(job);
    console.error(
      `${job.name.toUpperCase()} embedding failed for ID: ${id}. Reason: ${
        err.message
      }`
    );
  }
});

export default embeddingWorker;
