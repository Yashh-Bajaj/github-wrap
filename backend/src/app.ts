import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import wrappedRoutes from "./routes/wrapped.routes";
import connectDB from "./config/db";

const app = express();

// Lazy MongoDB initialization (connect on first request for serverless)
let mongoInitialized = false;

app.use(async (req: Request, res: Response, next: NextFunction) => {
  if (!mongoInitialized && process.env.NODE_ENV === "production") {
    try {
      await connectDB();
      mongoInitialized = true;
    } catch (error) {
      console.error("MongoDB init error:", error);
      return res.status(503).json({ error: "Database unavailable" });
    }
  }
  next();
});

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      /\.vercel\.app$/,  // Allow Vercel deployments
    ];
    
    if (!origin || allowedOrigins.some(o => 
      typeof o === 'string' ? o === origin : o.test(origin)
    )) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());

// Routes
app.use("/api/wrapped", wrappedRoutes);

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Error:", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

export default app;
