import { NextFunction, Request, Response } from "express";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error(`[Error] ${err.message}`, err.stack);
  res.status(500).json({
    error: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
  });
}
