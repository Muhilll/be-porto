import { Hono } from "hono";
import { ProjectController } from "../controller/project.controller";
import { jwtMiddleware } from "../../../middleware/auth";

const router = new Hono();

// Public endpoints
router.get("/", ProjectController.getAll);
router.get("/:idOrSlug", ProjectController.getOne);

// Protected endpoints (Admin)
router.post("/", jwtMiddleware, ProjectController.create);
router.put("/:id", jwtMiddleware, ProjectController.update);
router.delete("/:id", jwtMiddleware, ProjectController.delete);

export default router;
