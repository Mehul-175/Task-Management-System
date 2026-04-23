import express from "express";
import { getTaskHistory } from "../controllers/activity.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

const router = express.Router();

// Apply global authentication
router.use(authMiddleware);

// Both Admin and User can view history of tasks they have access to
router.get("/:taskId", roleMiddleware("ADMIN", "USER"), getTaskHistory);

export default router;