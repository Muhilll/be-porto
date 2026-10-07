import { Hono } from "hono";
import { CertificateController } from "../controller/certificate.controller";
import { jwtMiddleware } from "../../../middleware/auth";

const router = new Hono();

// Public
router.get("/", CertificateController.getAll);
router.get("/:id", CertificateController.getOne);

// Protected
router.post("/", jwtMiddleware, CertificateController.create);
router.put("/:id", jwtMiddleware, CertificateController.update);
router.delete("/:id", jwtMiddleware, CertificateController.delete);

export default router;
