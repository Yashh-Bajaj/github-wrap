import mongoose from "mongoose";

let cachedConnection: typeof mongoose | null = null;

const connectDB = async () => {
  try {
    // Reuse existing connection if available
    if (cachedConnection && mongoose.connection.readyState === 1) {
      console.log("✓ Using cached MongoDB connection");
      return cachedConnection;
    }

    const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/github-wrap";

    if (!mongoURI) {
      throw new Error("MONGODB_URI environment variable is not set");
    }

    await mongoose.connect(mongoURI);
    cachedConnection = mongoose;

    console.log("✓ MongoDB Connected Successfully");
    return mongoose;
  } catch (error) {
    console.error("✗ MongoDB Connection Failed:", error);
    // Don't exit in serverless; let handlers deal with it
    throw error;
  }
};

export default connectDB;
