import { Hono } from "hono";
import { AboutController } from "../controller/about.controller";
import { jwtMiddleware } from "../../../middleware/auth";

export const experienceRouter = new Hono();
// Public
experienceRouter.get("/", AboutController.getExperiences);
// Protected
experienceRouter.post("/", jwtMiddleware, AboutController.createExperience);
experienceRouter.put("/:id", jwtMiddleware, AboutController.updateExperience);
experienceRouter.delete("/:id", jwtMiddleware, AboutController.deleteExperience);

export const educationRouter = new Hono();
// Public
educationRouter.get("/", AboutController.getEducations);
// Protected
educationRouter.post("/", jwtMiddleware, AboutController.createEducation);
educationRouter.put("/:id", jwtMiddleware, AboutController.updateEducation);
educationRouter.delete("/:id", jwtMiddleware, AboutController.deleteEducation);

export const skillRouter = new Hono();
// Public
skillRouter.get("/", AboutController.getSkills);
// Protected
skillRouter.post("/", jwtMiddleware, AboutController.createSkillCategory);
skillRouter.put("/:id", jwtMiddleware, AboutController.updateSkillCategory);
skillRouter.delete("/:id", jwtMiddleware, AboutController.deleteSkillCategory);
