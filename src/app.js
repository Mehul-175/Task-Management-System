import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";
import projectRoutes from "./routes/project.routes.js";
import userRoutes from "./routes/user.routes.js";
import taskRoutes from "./routes/task.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import activityRoutes from "./routes/activity.routes.js";
import planRoutes from "./routes/plan.routes.js";

const app = express();

app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true
}));
app.use("/api/webhooks", express.json({ verify: (req, res, buf) => { req.rawBody = buf; } }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Api is working...");
});

app.use("/api/auth", authRoutes);
app.use("/api/webhooks", webhookRoutes);
app.use("/api/project", projectRoutes);
app.use("/api/user", userRoutes);
app.use("/api/task", taskRoutes);
app.use("/api/comment", commentRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/plan", planRoutes);

export default app;
