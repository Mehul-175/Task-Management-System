import { Router } from "express";
import { login, logout, refreshAccessToken, register } from "../controllers/auth.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { razorpayWebhook } from "../controllers/webhook.controller.js";

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshAccessToken);
router.post('/logout', authMiddleware, logout)

router.post("/webhooks/razorpay", razorpayWebhook);

export default router;