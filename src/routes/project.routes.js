import express from "express";
import { 
    createProject, 
    getAllProjects, 
    getProjectById, 
    updateProject, 
    deleteProject 
} from "../controllers/project.controller.js";
import authenticate from "../middlewares/auth.middleware.js"; 
import authorize from "../middlewares/role.middleware.js"

const router = express.Router();

router.use(authenticate); // All project routes require login

// Admin only routes
router.post("/", authorize("ADMIN"), createProject);
router.put("/:id", authorize("ADMIN"), updateProject);
router.delete("/:id", authorize("ADMIN"), deleteProject);

// Mixed access (Admin sees all, User sees assigned)
router.get("/", getAllProjects);
router.get("/:id", getProjectById);

export default router;