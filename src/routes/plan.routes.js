import express from "express";
import {
  createPlan,
  getAllPlans,
  getPlanById,
  updatePlan,
  swapPlans,
  deletePlan,
} from "../controllers/plan.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getAllPlans);
router.get("/:id", getPlanById);

router.post("/", roleMiddleware("SUPER_ADMIN"), createPlan);
router.put("/:id", roleMiddleware("SUPER_ADMIN"), updatePlan);
router.patch("/swap/status", roleMiddleware("SUPER_ADMIN"), swapPlans);
router.delete("/:id", roleMiddleware("SUPER_ADMIN"), deletePlan);

export default router;
