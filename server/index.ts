import "dotenv/config"; // load environment variables early
import express, { type Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { registerRoutes } from "./routes";
import { registerReportRoutes } from "./reports-routes";
import { setupVite, serveStatic, log } from "./vite";
import { EmailService } from "./services/email.service";
import { PaymentReminderScheduler } from "./services/payment-reminder.service";
import { WebSocketService } from "./services/websocket.service";
import { SchedulerService } from "./services/scheduler.service";
import { BackupService } from "./services/backup.service";

const app = express();

// Trust proxy - required when running behind a reverse proxy/load balancer
// This allows express-rate-limit to properly identify users via X-Forwarded-For header
app.set('trust proxy', 1);

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}

// Security middleware - disable CSP in development (Vite needs inline scripts)
if (process.env.NODE_ENV === 'production') {
  app.use(helmet());
} else {
  // Development: relaxed CSP to allow Vite inline scripts
  app.use(helmet({
    contentSecurityPolicy: false,
  }));
}

// Rate limiting - disabled for testing (Playwright tests)
const isTestEnv = Boolean(process.env.PLAYWRIGHT_TEST_BASE_URL || process.env.TESTING === 'true');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isTestEnv ? 10000 : 5000, // Much higher limit in test mode or dev
  message: "Too many requests from this IP, please try again later.",
  skip: () => isTestEnv, // Skip rate limiting entirely in test mode
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isTestEnv ? 10000 : 1000, // Much higher limit in test mode or dev
  message: "Too many login attempts, please try again later.",
  skipSuccessfulRequests: true,
  skip: () => isTestEnv, // Skip rate limiting entirely in test mode
});

if (!isTestEnv) {
  app.use("/api/", limiter);
  app.use("/api/auth/login", authLimiter);
  app.use("/api/auth/signup", authLimiter);
}

// Initialize email service
if (process.env.RESEND_API_KEY) {
  // Priority: Use Resend if API key is provided
  console.log("✓ Initializing Resend email service...");
  EmailService.initializeResend(process.env.RESEND_API_KEY);
  console.log("✓ Resend email service initialized successfully");
} else if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  // Fallback: Use SMTP if Resend is not configured
  console.log("✓ Initializing SMTP email service...");
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
} else {
  console.log("⚠ No email service configured - using Ethereal Email for testing");
}

app.use(express.json({
  limit: '50mb',
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

app.use(cookieParser());

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);
  
  // Initialize WebSocket service for real-time collaboration and notifications
  WebSocketService.initialize(server);
  
  registerReportRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);

  // Removed reusePort (not supported on macOS / Node ENOTSUP)
  server.listen(port, '0.0.0.0', () => {
    log(`serving on port ${port}`);
    
    // Start automatic payment reminder scheduler
    PaymentReminderScheduler.start();
    
    // Start general scheduler (subscriptions etc)
    SchedulerService.init();

    // Start backup service
    BackupService.initialize();
  });
})();
