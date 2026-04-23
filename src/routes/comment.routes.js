import express from "express";
import { addComment, getTaskComments, deleteComment } from "../controllers/comment.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

const router = express.Router();

router.use(authMiddleware);

// Both Admin and User can participate in discussions
router.post("/", roleMiddleware("ADMIN", "USER"), addComment);
router.get("/:taskId", roleMiddleware("ADMIN", "USER"), getTaskComments);
router.delete("/:id", roleMiddleware("ADMIN", "USER"), deleteComment);

export default router;