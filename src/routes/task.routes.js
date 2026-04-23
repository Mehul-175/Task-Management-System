import express from "express";
import { createTask, updateTaskStatus, getProjectTasks } from "../controllers/task.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

const router = express.Router();

router.use(authMiddleware);

// Only ADMIN can create tasks
router.post("/", roleMiddleware("ADMIN"), createTask);

// ADMIN and USER can both update status
router.patch("/:id/status", roleMiddleware("ADMIN", "USER"), updateTaskStatus);

// Scoped view: Admin sees all project tasks, User only their own
router.get("/project/:projectId", roleMiddleware("ADMIN", "USER"), getProjectTasks);

export default router;