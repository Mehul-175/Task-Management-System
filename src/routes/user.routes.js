import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js"; 
import roleMiddleware from "../middlewares/role.middleware.js"

import { 
    createSubUser, 
    getCompanyUsers, 
    updateSubUser, 
    deleteSubUser 
} from "../controllers/user.controller.js";

const router = express.Router();

// All routes here require the user to be logged in
router.use(authMiddleware);

// Only ADMIN can perform these actions
router.post("/add-member", roleMiddleware("ADMIN"), createSubUser);
router.get("/members", roleMiddleware("ADMIN"), getCompanyUsers);
router.put("/member/:id", roleMiddleware("ADMIN"), updateSubUser);
router.delete("/member/:id", roleMiddleware("ADMIN"), deleteSubUser);

export default router;