import { Queue, Worker, QueueEvents } from "bullmq";
import IORedis from "ioredis";

/**
 * Shared Redis connection used by both the Queue (producer side in Next.js)
 * and the Worker (consumer side in the sidecar process).
 *
 * Uses Upstash Redis with TLS via ioredis.
 * Note: Upstash free-tier enforces max 1 connection — use maxRetriesPerRequest: null
 * to prevent BullMQ from exhausting the connection pool.
 */
export function createRedisConnection() {
  const url = process.env.UPSTASH_REDIS_URL;
  if (!url) throw new Error("UPSTASH_REDIS_URL is not set");

  return new IORedis(url, {
    maxRetriesPerRequest: null, // Required by BullMQ
    enableReadyCheck: false,
    tls: { rejectUnauthorized: false }, // Upstash uses self-signed certs on some regions
  });
}

export const RESUME_QUEUE_NAME = "resume-processing";

/** Queue instance — import in API routes to enqueue jobs */
export function createResumeQueue() {
  return new Queue(RESUME_QUEUE_NAME, {
    connection: createRedisConnection(),
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: "exponential", delay: 5000 },
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 200 },
    },
  });
}

/** QueueEvents — import in webhooks/status polling */
export function createResumeQueueEvents() {
  return new QueueEvents(RESUME_QUEUE_NAME, {
    connection: createRedisConnection(),
  });
}
