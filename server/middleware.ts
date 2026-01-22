
import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import { cacheService } from "./services/cache.service";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}

// Validate SESSION_SECRET at runtime, not at module load
export function getJWTSecret(): string {
  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET environment variable is required");
  }
  return process.env.SESSION_SECRET;
}

// Middleware to verify JWT token
export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const decoded = jwt.verify(token, getJWTSecret()) as { id: string; email: string; role: string };
    
    // CAS CHING LAYER: Check cache first
    const cacheKey = `user:${decoded.id}`;
    const cachedUser = await cacheService.get<{id: string, email: string, role: string, status: string, name: string}>(cacheKey);
    
    if (cachedUser) {
        if (cachedUser.status !== "active") {
            return res.status(401).json({ error: "Unauthorized" });
        }
        req.user = { id: cachedUser.id, email: cachedUser.email, role: cachedUser.role, name: cachedUser.name || "User" };
        return next();
    }

    // Cache miss, fetch from DB
    const user = await storage.getUser(decoded.id);
    
    if (!user || user.status !== "active") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Update cache
    await cacheService.set(cacheKey, {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        name: user.name
    }, 300); // Cache: 5 minutes

    req.user = { id: user.id, email: user.email, role: user.role, name: user.name };
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
}


export function validateRequest(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Parse body against schema. This strips unknown keys if strict() is used,
      // or just ensures the shape is correct.
      // We perform parse (sync) or parseAsync. parseAsync is safer for refinements.
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message, details: error.errors });
      }
      return res.status(500).json({ error: "Internal validation error" });
    }
  };
}
