import { Hono } from "hono";
import { ServiceController } from "../controller/service.controller";
import { jwtMiddleware } from "../../../middleware/auth";

const router = new Hono();

// Public
router.get("/", ServiceController.getAll);
router.get("/:id", ServiceController.getOne);

// Protected
router.post("/", jwtMiddleware, ServiceController.create);
router.put("/:id", jwtMiddleware, ServiceController.update);
router.delete("/:id", jwtMiddleware, ServiceController.delete);

export default router;
