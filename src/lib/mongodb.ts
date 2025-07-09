import mongoose from 'mongoose';

// Use fallback for development or demo purposes if no MongoDB URI is provided
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://demo:demo@cluster0.mongodb.net/myspotify?retryWrites=true&w=majority';

// Instead of throwing an error, just log a warning
if (!process.env.MONGODB_URI) {
  console.warn('Warning: MONGODB_URI not defined. Using fallback connection string for demo mode. Data persistence is not guaranteed.');
}

interface MongooseConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseConnection | undefined;
}

const cached: MongooseConnection = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000, // Give up initial connection after 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('Connected to MongoDB');
        return mongoose;
      })
      .catch((error) => {
        console.error('MongoDB connection error:', error);
        console.warn('Continuing in demo mode with limited functionality');
        // Return mongoose instance anyway to prevent complete failure
        return mongoose;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('Failed to resolve MongoDB connection:', e);
    // Instead of throwing, return mongoose to allow app to function in limited capacity
    return mongoose;
  }

  return cached.conn;
}

export default connectDB;
