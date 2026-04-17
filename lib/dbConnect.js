import mongoose from 'mongoose';

// Get MongoDB URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

// Only throw error if we're in production and URI is missing
if (!MONGODB_URI) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Please define the MONGODB_URI environment variable for production');
  } else {
    console.error('MONGODB_URI not defined. Using development fallback');
  }
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { promise: null };
}

// Serverless (e.g. Vercel): idle connections drop; clear the cached promise so the next
// invocation opens a fresh connection instead of reusing a resolved promise while disconnected.
if (!global.mongooseDisconnectListener) {
  global.mongooseDisconnectListener = true;
  mongoose.connection.on('disconnected', () => {
    if (global.mongoose) {
      global.mongoose.promise = null;
    }
  });
}

async function dbConnect() {
  if (!MONGODB_URI) return null;

  // Healthy reuse — avoid trusting a stale cached handle when the socket is gone.
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // Fully disconnected: allow a new connect() (resolved promise is useless after drop).
  if (mongoose.connection.readyState === 0) {
    cached.promise = null;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 20000,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then(() => mongoose.connection)
      .catch((err) => {
        cached.promise = null;
        console.error('MongoDB connection error:', err);
        throw err;
      });
  }

  try {
    await cached.promise;
  } catch (e) {
    throw e;
  }

  if (mongoose.connection.readyState !== 1) {
    cached.promise = null;
    throw new Error('MongoDB did not reach a connected state');
  }

  return mongoose.connection;
}

export default dbConnect;