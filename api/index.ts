import type { VercelRequest, VercelResponse } from '@vercel/node';
import express, { Express } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import { registerRoutes } from "../server/routes";
import { EmailService } from "../server/services/email.service";

// Create Express app instance
let app: Express | null = null;

// Initialize the Express app
async function initializeApp(): Promise<Express> {
  if (app) return app;

  const newApp = express();

  // Security middleware
  newApp.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", "data:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Too many login attempts, please try again later.",
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
  });

  newApp.use("/api/", limiter);
  newApp.use("/api/auth/login", authLimiter);
  newApp.use("/api/auth/signup", authLimiter);

  // Initialize email service
  try {
    if (process.env.RESEND_API_KEY) {
      EmailService.initializeResend(process.env.RESEND_API_KEY);
      console.log("✓ Resend email service initialized");
    } else if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      EmailService.initialize({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        from: process.env.EMAIL_FROM || "noreply@quoteprogen.com",
      });
      console.log("✓ SMTP email service initialized");
    }
  } catch (error) {
    console.warn("⚠ Email service initialization failed:", error);
  }

  // Body parsing
  newApp.use(express.json({
    limit: '10mb',
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    }
  }));
  newApp.use(express.urlencoded({ extended: false, limit: '10mb' }));
  newApp.use(cookieParser());

  // Register routes
  await registerRoutes(newApp);

  app = newApp;
  return newApp;
}

// Vercel serverless function handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Validate required environment variables
    if (!process.env.DATABASE_URL) {
      console.error('Missing DATABASE_URL environment variable');
      return res.status(500).json({
        error: 'Server Configuration Error',
        message: 'Database connection is not configured'
      });
    }

    if (!process.env.SESSION_SECRET) {
      console.error('Missing SESSION_SECRET environment variable');
      return res.status(500).json({
        error: 'Server Configuration Error',
        message: 'Session secret is not configured'
      });
    }

    const expressApp = await initializeApp();

    // Convert Vercel request to Express request and handle
    return expressApp(req as any, res as any);
  } catch (error) {
    console.error('Error handling request:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    // Provide more detailed error information in development
    const isDevelopment = process.env.NODE_ENV !== 'production';

    return res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error',
      ...(isDevelopment && { stack: error instanceof Error ? error.stack : undefined })
    });
  }
}


