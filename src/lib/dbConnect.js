/**
 * MongoDB Database Connection Utility
 * ------------------------------------
 * Uses Mongoose to connect to MongoDB. Caches the connection
 * in a global variable to prevent multiple connections in
 * Next.js hot-reload during development.
 */

import mongoose from "mongoose";

/** Global cache to prevent reconnecting on every API call */
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

/**
 * We use a cached connection stored on the Node.js global object
 * so that the connection is reused across hot-reloads in dev mode.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Connect to MongoDB.
 * Returns the cached Mongoose connection if it already exists,
 * otherwise creates a new one and caches it.
 *
 * @returns {Promise<mongoose.Connection>} The Mongoose connection
 */
async function dbConnect() {
  // Return existing connection if available
  if (cached.conn) {
    return cached.conn;
  }

  // If no pending connection promise, create one
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable buffering for faster error detection
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null; // Reset on failure so we can retry
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
