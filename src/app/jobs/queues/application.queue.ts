import { Queue } from "bullmq";
import redisConnection from "../../config/redis";

/**
 * aplicant match score, rank score and ai notes for a job
 */
const applicationQueue = new Queue("application-queue", {
  connection: redisConnection,
});

// error
applicationQueue.on("error", (err) => {
  if (err) console.log("Application queue throws error!");
});

export default applicationQueue;
