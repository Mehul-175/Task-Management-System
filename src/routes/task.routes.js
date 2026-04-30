import express from "express";
import {
  createTask,
  updateTaskStatus,
  getProjectTasks,
  updateTask,
  deleteTask,
  getAllTasks
} from "../controllers/task.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

const router = express.Router();

router.use(authMiddleware);

// CREATE
router.post("/", roleMiddleware("ADMIN"), createTask);

// UPDATE FULL TASK (FIX)
router.put("/:id", roleMiddleware("ADMIN"), updateTask);

// UPDATE STATUS
router.patch("/:id/status", roleMiddleware("ADMIN", "USER"), updateTaskStatus);

// DELETE
router.delete("/:id", roleMiddleware("ADMIN"), deleteTask);

// GET
router.get("/", roleMiddleware("ADMIN", "USER"), getAllTasks);
router.get("/project/:projectId", roleMiddleware("ADMIN", "USER"), getProjectTasks);

export default router;