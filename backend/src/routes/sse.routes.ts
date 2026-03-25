import { Request, Response, Router } from "express";

import { scanEvents } from "../services/scan-events";

const router = Router();

router.get("/:id/progress", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.write(`data: ${JSON.stringify({ event: "connected", scanId: req.params.id })}\n\n`);

  const scanId = req.params.id;

  const handler = (event: any) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  scanEvents.on(`scan:${scanId}`, handler);

  const heartbeat = setInterval(() => {
    res.write(": heartbeat\n\n");
  }, 15000);

  req.on("close", () => {
    scanEvents.off(`scan:${scanId}`, handler);
    clearInterval(heartbeat);
  });
});

export default router;
