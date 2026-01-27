"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheService = void 0;
var redis_1 = require("redis");
var lru_cache_1 = require("lru-cache");
var logger_1 = require("../utils/logger");
var CacheService = /** @class */ (function () {
    function CacheService() {
        this.redisClient = null;
        this.useRedis = false;
        this.isConnected = false;
        // Initialize in-memory cache as fallback
        this.memoryCache = new lru_cache_1.LRUCache({
            max: 500, // Maximum number of items
            ttl: 1000 * 60 * 60, // 1 hour default TTL
        });
        if (process.env.REDIS_URL) {
            this.initRedis();
        }
        else {
            logger_1.logger.info("Local: Cache service initialized with in-memory storage (No REDIS_URL provided)");
        }
    }
    CacheService.prototype.initRedis = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        this.redisClient = (0, redis_1.createClient)({
                            url: process.env.REDIS_URL,
                        });
                        this.redisClient.on("error", function (err) {
                            logger_1.logger.error("Redis Client Error", err);
                            _this.useRedis = false;
                            _this.isConnected = false;
                        });
                        this.redisClient.on("connect", function () {
                            logger_1.logger.info("Redis: Connected to Redis server");
                            _this.useRedis = true;
                            _this.isConnected = true;
                        });
                        this.redisClient.on("reconnecting", function () {
                            logger_1.logger.info("Redis: Reconnecting...");
                            _this.useRedis = false;
                            _this.isConnected = false;
                        });
                        return [4 /*yield*/, this.redisClient.connect()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        logger_1.logger.error("Failed to connect to Redis, falling back to memory cache:", error_1);
                        this.useRedis = false;
                        this.isConnected = false;
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get a value from the cache
     * @param key Cache key
     */
    CacheService.prototype.get = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var value, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        if (!(this.useRedis && this.isConnected && this.redisClient)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.redisClient.get(key)];
                    case 1:
                        value = _a.sent();
                        if (value) {
                            return [2 /*return*/, JSON.parse(value)];
                        }
                        return [2 /*return*/, null];
                    case 2: return [2 /*return*/, this.memoryCache.get(key) || null];
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        error_2 = _a.sent();
                        logger_1.logger.error("Cache get error for key ".concat(key, ":"), error_2);
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Set a value in the cache
     * @param key Cache key
     * @param value Value to store
     * @param ttlSeconds Time to live in seconds
     */
    CacheService.prototype.set = function (key_1, value_1) {
        return __awaiter(this, arguments, void 0, function (key, value, ttlSeconds) {
            var error_3;
            if (ttlSeconds === void 0) { ttlSeconds = 3600; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        if (!(this.useRedis && this.isConnected && this.redisClient)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.redisClient.set(key, JSON.stringify(value), {
                                EX: ttlSeconds,
                            })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        this.memoryCache.set(key, value, { ttl: ttlSeconds * 1000 });
                        _a.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        error_3 = _a.sent();
                        logger_1.logger.error("Cache set error for key ".concat(key, ":"), error_3);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Delete a value from the cache
     * @param key Cache key
     */
    CacheService.prototype.del = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        if (!(this.useRedis && this.isConnected && this.redisClient)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.redisClient.del(key)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        this.memoryCache.delete(key);
                        _a.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        error_4 = _a.sent();
                        logger_1.logger.error("Cache delete error for key ".concat(key, ":"), error_4);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Flush all keys from the cache
     */
    CacheService.prototype.flush = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        if (!(this.useRedis && this.isConnected && this.redisClient)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.redisClient.flushAll()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        this.memoryCache.clear();
                        _a.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        error_5 = _a.sent();
                        logger_1.logger.error("Cache flush error:", error_5);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return CacheService;
}());
exports.cacheService = new CacheService();
