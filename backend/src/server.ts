import dotenv from "dotenv";

// Load environment variables as early as possible
dotenv.config();

import app from "./app";
import connectDB from "./config/db";

const PORT = process.env.PORT || 5000;

// Initialize MongoDB connection once at startup
let mongoConnected = false;

const initMongo = async () => {
  if (!mongoConnected) {
    try {
      await connectDB();
      mongoConnected = true;
    } catch (error) {
      console.error("MongoDB connection error:", error);
      throw error;
    }
  }
};

// For local development
if (process.env.NODE_ENV !== "production") {
  const startServer = async () => {
    try {
      await initMongo();

      // Start Express server locally
      app.listen(PORT, () => {
        console.log(`
╔════════════════════════════════════╗
║   GitHub Wrapped Backend Running   ║
║   Port: ${PORT}                          
║   Environment: ${process.env.NODE_ENV || "development"}
╚════════════════════════════════════╝
        `);
      });
    } catch (error) {
      console.error("Failed to start server:", error);
      process.exit(1);
    }
  };

  startServer();
}

// Export app for Vercel serverless
export default app;
