import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/github-wrap";

    await mongoose.connect(mongoURI);

    console.log("✓ MongoDB Connected Successfully");
    return mongoose;
  } catch (error) {
    console.error("✗ MongoDB Connection Failed:", error);
    process.exit(1);
  }
};

export default connectDB;
