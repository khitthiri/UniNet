import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import assignmentRoutes from "./routes/assignments.js";
import submissionRoutes from "./routes/submissions.js";
import fileRoutes from "./routes/files.js";
import feedbackRoutes from "./routes/feedback.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(",") || "*" }));
app.use(express.json({ limit: "8mb" }));

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/feedback", feedbackRoutes);

// 404 + error fallthrough
app.use((req, res) => res.status(404).json({ message: "Route not found." }));

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`UniNet API running on port ${PORT}`));
});
