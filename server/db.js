"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.pool = void 0;
var serverless_1 = require("@neondatabase/serverless");
var neon_serverless_1 = require("drizzle-orm/neon-serverless");
var schema = require("@shared/schema");
// Only use ws in non-serverless environments
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    // Use dynamic import to avoid issues in serverless
    Promise.resolve().then(function () { return require("ws"); }).then(function (ws) {
        serverless_1.neonConfig.webSocketConstructor = ws.default;
    }).catch(function () {
        console.warn("ws not available, using native WebSocket");
    });
}
if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}
// Add connection pooling configuration for Vercel
var connectionString = process.env.DATABASE_URL.includes('?')
    ? process.env.DATABASE_URL
    : "".concat(process.env.DATABASE_URL, "?sslmode=require");
exports.pool = new serverless_1.Pool({
    connectionString: connectionString,
    connectionTimeoutMillis: 10000,
});
exports.db = (0, neon_serverless_1.drizzle)(exports.pool, { schema: schema });
