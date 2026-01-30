import { Worker } from "bullmq";
import redisConnection from "../../config/redis";
import { standardInterviewQuestionHandler } from "../workerHandlers/employer.handler";

// in this worker, i will keep many background jobs
const employerWorker = new Worker(
  "employer-queue",
  async (job) => {
    switch (job.name) {
      case "standard-interview-kit":
        await standardInterviewQuestionHandler(job.data.jobId);
    }
  },
  {
    connection: redisConnection,
    concurrency: 3,
  },
);

// active job
employerWorker.on("active", (job, prev) => {
  console.log(`${job.name.toUpperCase()} is active`);
});

// get job id
const getIdentifier = (job: any) => {
  const mapping: Record<string, string> = {
    "standard-interview-kit": job.data.jobId,
  };
  return mapping[job.name] || "Unknown ID";
};

// log on any completed job
employerWorker.on("completed", (job) => {
  const id = getIdentifier(job);
  console.log(`${job.name.toUpperCase()} is completed for ID: ${id}`);
});

// log on any failed job
employerWorker.on("failed", (job, err) => {
  if (job) {
    const id = getIdentifier(job);
    console.error(
      `${job.name.toUpperCase()} failed for ID: ${id}. Reason: ${err.message}`,
    );
  }
});

export default employerWorker;
