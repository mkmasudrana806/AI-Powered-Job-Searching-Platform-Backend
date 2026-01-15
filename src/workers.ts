import { Worker } from "bullmq";
import embeddingWorker from "./app/jobs/workers/embedding.worker";

const allWorkers: Worker[] = [embeddingWorker];

allWorkers.forEach((worker) => {
  // worker is connected
  worker.on("ready", () => {
    console.log(`[SYSTEM] ${worker.name} is connected to Redis.`);
  });

  // any worker connection error
  worker.on("error", (err) => {
    console.error(`[CRITICAL] ${worker.name} connection error:`, err);
  });

  // if any worker stucked
  worker.on("stalled", (jobId) => {
    console.warn(`[STALLED] Job ${jobId} on ${worker.name} is stuck.`);
  });
});

// shutdown gracefully this processes
process.on("SIGINT", async () => {
  console.log("🛑 Worker shutting down");
  process.exit(0);
});
