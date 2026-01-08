import dotenv from "dotenv";
dotenv.config();

import { Request, Response } from "express";

import app from "../app";
import connectDB from "../config/db";

let isConnected = false;

/**
 * Vercel serverless handler
 */
export default async function handler(
  req: Request,
  res: Response
) {
  try {
    if (!isConnected) {
      await connectDB();
      isConnected = true;
      console.log("MongoDB connected");
    }

    return app(req as any, res as any);
  } catch (error) {
    console.error("Serverless handler error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}
