import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { errorHandler } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/logger";
import scanRoutes from "./routes/scan.routes";
import sseRoutes from "./routes/sse.routes";
import assetRoutes from "./routes/asset.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import cbomRoutes from "./routes/cbom.routes";
import badgeRoutes from "./routes/badge.routes";
import reportRoutes from "./routes/report.routes";

dotenv.config({ path: "../.env" });

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
  }),
);
app.use(express.json());
app.use(requestLogger);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/scans", scanRoutes);
app.use("/api/scans", sseRoutes);
app.use("/api/scans", cbomRoutes);
app.use("/api/scans", reportRoutes);
app.use("/api", assetRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/badges", badgeRoutes);
app.use(errorHandler);

export default app;
