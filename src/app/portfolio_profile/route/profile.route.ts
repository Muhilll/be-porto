import { Hono } from "hono";
import { ProfileController } from "../controller/profile.controller";
import { jwtMiddleware } from "../../../middleware/auth";

const router = new Hono();

// GET /api/profile (Public)
router.get("/", ProfileController.get);

// PUT /api/profile (Protected)
router.put("/", jwtMiddleware, ProfileController.upsert);

export default router;
