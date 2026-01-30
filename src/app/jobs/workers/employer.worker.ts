import { Worker } from "bullmq";
import redisConnection from "../../config/redis";

// in this worker, i will keep many background jobs
const employerWorker = new Worker(
  "employer-queue",
  async (job) => {
    switch (job.name) {
      case "interview-question-generate":
        console.log("yes interview question is generated");
    }
  },
  {
    connection: redisConnection,
    concurrency: 3,
  },
);

export default employerWorker;
