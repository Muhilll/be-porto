import { Hono } from "hono";
import { ContactController } from "../controller/contact.controller";
import { jwtMiddleware } from "../../../middleware/auth";

const router = new Hono();

// Public: send message from contact form
router.post("/send", ContactController.send);

// Protected: admin inbox
router.get("/messages", jwtMiddleware, ContactController.getAll);
router.put("/messages/:id/read", jwtMiddleware, ContactController.markAsRead);
router.delete("/messages/:id", jwtMiddleware, ContactController.delete);

export default router;
