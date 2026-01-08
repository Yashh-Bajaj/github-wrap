import dotenv from "dotenv";

// Load environment variables as early as possible
dotenv.config();

import app from "./app";
import connectDB from "./config/db";

const PORT = process.env.PORT || 5000;

// For local development only

  const startServer = async () => {
    try {
      await connectDB();

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


// Export app for Vercel serverless runtime
export default app;
