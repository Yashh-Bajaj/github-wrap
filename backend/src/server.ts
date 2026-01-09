import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import connectDB from "./config/db";

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`
=====================================
 Local server running successfully
-------------------------------------
 URL: http://localhost:${PORT}
 Environment: ${process.env.NODE_ENV || "development"}
=====================================
      `);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
