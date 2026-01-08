import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import wrappedRoutes from "./routes/wrapped.routes";

const app = express();

/**
 * CORS configuration
 */
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        /\.vercel\.app$/,
      ];

      if (
        !origin ||
        allowedOrigins.some((o) =>
          typeof o === "string" ? o === origin : o.test(origin)
        )
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

/**
 * Routes
 */
app.use("/api/wrapped", wrappedRoutes);

/**
 * Health check
 */
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

/**
 * 404 handler
 */
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

/**
 * Global error handler
 */
app.use(
  (err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Error:", err);

    res.status(err.statusCode || 500).json({
      error: err.message || "Internal Server Error",
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  }
);

export default app;
