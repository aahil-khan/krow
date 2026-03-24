import { Request, Response, Router } from "express";

const router = Router();

router.get("/:id/progress", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.write(`data: ${JSON.stringify({ event: "connected", scanId: req.params.id })}\n\n`);

  const keepAlive = setInterval(() => {
    res.write(": keepalive\n\n");
  }, 15000);

  req.on("close", () => {
    clearInterval(keepAlive);
  });
});

export default router;
