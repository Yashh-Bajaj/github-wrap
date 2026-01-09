import { Request, Response, NextFunction } from "express";
import { WrappedService } from "../services/wrapped.service";

export class WrappedController {
  /**
   * GET /api/wrapped
   * Query params: username (required), year (optional)
   */
  static async getWrapped(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, year } = req.query;

      // Validation
      if (!username || typeof username !== "string") {
        return res.status(400).json({
          error: "Username is required and must be a string",
        });
      }

      // Validate username format (GitHub usernames: alphanumeric and hyphens, 1-39 chars)
      const usernameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/;
      const trimmedUsername = username.trim();
      if (
        trimmedUsername.length === 0 ||
        trimmedUsername.length > 39 ||
        !usernameRegex.test(trimmedUsername)
      ) {
        return res.status(400).json({
          error: "Invalid GitHub username format",
        });
      }

      const currentYear = new Date().getFullYear();
      const wrappedYear = year ? parseInt(year as string, 10) : currentYear - 1;

      // Validate year
      if (isNaN(wrappedYear) || wrappedYear < 2008 || wrappedYear > currentYear) {
        return res.status(400).json({
          error: `Year must be between 2008 and ${currentYear}`,
        });
      }

      // Get wrapped stats
      const result = await WrappedService.getWrapped(
        trimmedUsername.toLowerCase(),
        wrappedYear
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      // Provide more specific error messages
      if (error.message?.includes("not found")) {
        return res.status(404).json({
          error: error.message,
        });
      }
      if (error.message?.includes("GitHub API error")) {
        return res.status(502).json({
          error: error.message,
        });
      }
      // Let other errors go to the error handler middleware
      return next(error);
    }
  }
}
