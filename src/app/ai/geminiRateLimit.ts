import Bottleneck from "bottleneck";
import redisConnection from "../config/redis";

const geminiRateLimiter = new Bottleneck({
  id: "gemini-api-limit",
  datastore: "ioredis",
  clientOptions: redisConnection,

  minTime: 5000,
  maxConcurrent: 1,
});

export default geminiRateLimiter;
