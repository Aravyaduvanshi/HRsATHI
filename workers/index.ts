/**
 * Worker entry point.
 * Run with: npm run worker  (which executes: tsx workers/index.ts)
 *
 * This file boots the BullMQ worker process independently of Next.js.
 * Deploy this as a separate Railway/Render worker service in production.
 */
import "dotenv/config"; // Load .env in local dev

import { resumeWorker } from "./resumeProcessor";

console.log("🚀 HRSathi resume processing worker started");
console.log(`   Queue: resume-processing`);
console.log(`   Concurrency: 3`);

// Graceful shutdown on SIGTERM (Docker stop, Railway deploy)
async function shutdown() {
  console.log("\n⏳ Shutting down worker gracefully…");
  await resumeWorker.close();
  console.log("✅ Worker closed.");
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
