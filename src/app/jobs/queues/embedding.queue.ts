import { Queue } from "bullmq";
import redisConnection from "../../config/redis";

/**
 * Queue for profile, job or any embedding
 */
export const embeddingQueue = new Queue("embedding-queue", {
  connection: redisConnection,
});

// error
embeddingQueue.on("error", (err) => {
  if (err) console.log("Embedding queue throws error!");
});
