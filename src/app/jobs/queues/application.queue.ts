import { Queue } from "bullmq";
import redisConnection from "../../config/redis";

/**
 * aplicant match score, rank score and ai notes for a job
 */
const applicationQueue = new Queue("application-queue", {
  connection: redisConnection,
});

export default applicationQueue;
