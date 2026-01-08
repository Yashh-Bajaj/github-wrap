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

      const currentYear = new Date().getFullYear();
      const wrappedYear = year ? parseInt(year as string) : currentYear - 1;

      // Validate year
      if (isNaN(wrappedYear) || wrappedYear < 2008 || wrappedYear > currentYear) {
        return res.status(400).json({
          error: `Year must be between 2008 and ${currentYear}`,
        });
      }

      // Get wrapped stats
      const result = await WrappedService.getWrapped(username.toLowerCase(), wrappedYear);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
}
