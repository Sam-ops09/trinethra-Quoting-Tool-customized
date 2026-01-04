import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from "@shared/schema";

// Only use ws in non-serverless environments
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  // Use dynamic import to avoid issues in serverless
  import("ws").then((ws) => {
    neonConfig.webSocketConstructor = ws.default;
  }).catch(() => {
    console.warn("ws not available, using native WebSocket");
  });
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Add connection pooling configuration for Vercel
const connectionString = process.env.DATABASE_URL.includes('?')
  ? process.env.DATABASE_URL
  : `${process.env.DATABASE_URL}?sslmode=require`;

export const pool = new Pool({
  connectionString,
  connectionTimeoutMillis: 10000,
});

export const db = drizzle(pool, { schema });
