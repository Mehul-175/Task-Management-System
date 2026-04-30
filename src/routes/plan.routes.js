import express from "express";
import {
  createPlan,
  getAllPlans,
  getPlanById,
  updatePlan,
  swapPlans,
  deletePlan,
  getAllPlansAdmin,
} from "../controllers/plan.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

const router = express.Router();


router.get("/", getAllPlans);
router.get("/admin/plans", authMiddleware, roleMiddleware("SUPER_ADMIN"), getAllPlansAdmin);
router.get("/:id", getPlanById);


router.post("/", authMiddleware, roleMiddleware("SUPER_ADMIN"), createPlan);
router.put("/:id", authMiddleware, roleMiddleware("SUPER_ADMIN"), updatePlan);
router.patch("/swap/status", authMiddleware, roleMiddleware("SUPER_ADMIN"), swapPlans);
router.delete("/:id", authMiddleware, roleMiddleware("SUPER_ADMIN"), deletePlan);

export default router;
