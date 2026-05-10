import mongoose from 'mongoose';

/**
 * Single connection per Node process. Every `connectDB()` call awaits the same promise — no connection pool spam.
 * Optional eager connect: `instrumentation.ts` calls this at server boot so routes reuse an already-ready client.
 */
const cached: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } = {
  conn: null,
  promise: null,
};

/** One shared completion per process so concurrent requests do not duplicate seed work (race on QR inserts, etc.). */
let ensureSeedPromise: Promise<void> | null = null;

function getMongoUri() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      'MONGODB_URI is not defined — set it in Vercel Project Settings → Environment Variables'
    );
  }
  return uri;
}

async function ensureOnce() {
  if (!ensureSeedPromise) {
    const { ensureApplicationDefaults } = await import('@/lib/ensure-seed');
    ensureSeedPromise = ensureApplicationDefaults().catch((err) => {
      ensureSeedPromise = null;
      throw err;
    });
  }
  await ensureSeedPromise;
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(getMongoUri(), {
        serverSelectionTimeoutMS: 12_000,
        connectTimeoutMS: 12_000,
      })
      .then((mongoose) => mongoose)
      .catch((err) => {
        cached.promise = null;
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  await ensureOnce();

  return cached.conn;
}
