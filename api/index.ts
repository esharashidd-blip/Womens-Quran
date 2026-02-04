import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "../server/routes";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize routes once
let initialized = false;

async function initApp() {
  if (!initialized) {
    // Pass null for httpServer since we don't need WebSocket in serverless
    await registerRoutes(null as any, app);

    // Error handler
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      console.error("Error:", err);
      return res.status(status).json({ message });
    });

    initialized = true;
  }
  return app;
}

// Vercel serverless handler
export default async function handler(req: Request, res: Response) {
  const expressApp = await initApp();
  return expressApp(req, res);
}
