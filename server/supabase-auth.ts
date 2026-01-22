import type { Express, RequestHandler, Request, Response, NextFunction } from "express";
import { supabaseAdmin as supabase } from "./supabase";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        firstName?: string;
        lastName?: string;
      };
    }
  }
}

// Middleware to extract and verify Supabase JWT token
export const authMiddleware: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    req.user = undefined;
    return next();
  }

  const token = authHeader.substring(7);

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      req.user = undefined;
      return next();
    }

    // Extract name from user_metadata (set during signup or profile update)
    const metadata = user.user_metadata || {};

    // Get the first name - prioritize display_name, then other fields
    let firstName = metadata.display_name || metadata.first_name || metadata.firstName || metadata.name?.split(' ')[0] || '';
    firstName = firstName.split(/\s+/)[0]; // Ensure only first word

    req.user = {
      id: user.id,
      email: user.email,
      firstName: firstName || undefined,
      lastName: metadata.last_name || metadata.lastName || metadata.name?.split(' ').slice(1).join(' '),
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    req.user = undefined;
    next();
  }
};

// Middleware to require authentication
export const requireAuth: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

// Setup auth middleware
export function setupAuth(app: Express) {
  // Apply auth middleware to all routes
  app.use(authMiddleware);
}

// Register auth-related routes
export function registerAuthRoutes(app: Express) {
  // Get current user info
  app.get("/api/auth/user", (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    res.json({
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
    });
  });
}
