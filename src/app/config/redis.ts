import IORedis from "ioredis";
import config from "./env";

const redisConnection = new IORedis(config.redis_connection_url as string, {
  maxRetriesPerRequest: null,
});

// on connect log
redisConnection.on("connect", () => {
  console.log("Redis is connectd!");
});

// on ready log
redisConnection.on("ready", () => {
  console.log("Redis is ready!");
});

// on error log
redisConnection.on("error", (err) => {
  console.error(
    "Error: You may forgot to run Redis server!. Reason: ",
    err.message,
  );
});

redisConnection.on("close", () => {
  console.log("Redis connection closed!");
});

export default redisConnection;
