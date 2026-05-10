/**
 * Runs once per Node.js server process (dev server, `next start`, or each new Vercel serverless instance).
 * Eagerly opens the shared Mongoose connection so the first API request does not pay cold-connect latency alone.
 * Edge runtime is skipped (no MongoDB).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') {
    return;
  }
  const { connectDB } = await import('@/lib/mongodb');
  await connectDB();
}
