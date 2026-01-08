import { Router } from "express";
import { WrappedController } from "../controllers/wrapped.controller";

const router = Router();

/**
 * GET /api/wrapped?username=<username>&year=<year>
 * Fetch or generate GitHub wrapped stats
 * 
 * Query Parameters:
 *   - username (required): GitHub username
 *   - year (optional): Year for stats (default: previous year)
 * 
 * Response:
 *   {
 *     success: true,
 *     data: {
 *       username,
 *       year,
 *       insights: { ... }
 *     }
 *   }
 */
router.get("/", WrappedController.getWrapped);

export default router;
