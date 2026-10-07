import { Hono } from "hono";
import { BlogController } from "../controller/blog.controller";
import { jwtMiddleware } from "../../../middleware/auth";

const router = new Hono();

// Public endpoints
router.get("/", BlogController.getAll);
router.get("/:slug", BlogController.getBySlug);

// Protected endpoints (Admin)
router.post("/", jwtMiddleware, BlogController.create);
router.put("/:id", jwtMiddleware, BlogController.update);
router.delete("/:id", jwtMiddleware, BlogController.delete);

export default router;
