"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.DatabaseStorage = void 0;
var db_1 = require("./db");
var drizzle_orm_1 = require("drizzle-orm");
var schema_1 = require("@shared/schema");
var cache_service_1 = require("./services/cache.service");
var DatabaseStorage = /** @class */ (function () {
    function DatabaseStorage() {
    }
    DatabaseStorage.prototype.getUser = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, id))];
                    case 1:
                        user = (_a.sent())[0];
                        return [2 /*return*/, user || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.getUserByEmail = function (email) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.email, email))];
                    case 1:
                        user = (_a.sent())[0];
                        return [2 /*return*/, user || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.getUserByRefreshToken = function (token) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.refreshToken, token))];
                    case 1:
                        user = (_a.sent())[0];
                        return [2 /*return*/, user || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.getUserByResetToken = function (token) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.resetToken, token))];
                    case 1:
                        user = (_a.sent())[0];
                        return [2 /*return*/, user || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.createUser = function (user) {
        return __awaiter(this, void 0, void 0, function () {
            var newUser;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .insert(schema_1.users)
                            .values(user)
                            .returning()];
                    case 1:
                        newUser = (_a.sent())[0];
                        return [2 /*return*/, newUser];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateUser = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var updated;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .update(schema_1.users)
                            .set(__assign(__assign({}, data), { updatedAt: new Date() }))
                            .where((0, drizzle_orm_1.eq)(schema_1.users.id, id))
                            .returning()];
                    case 1:
                        updated = (_a.sent())[0];
                        if (!updated) return [3 /*break*/, 3];
                        return [4 /*yield*/, cache_service_1.cacheService.del("user:".concat(id))];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, updated || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateUserWithTokenCheck = function (id, token, data) {
        return __awaiter(this, void 0, void 0, function () {
            var updated;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .update(schema_1.users)
                            .set(__assign(__assign({}, data), { updatedAt: new Date() }))
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.users.id, id), (0, drizzle_orm_1.eq)(schema_1.users.resetToken, token)))
                            .returning()];
                    case 1:
                        updated = (_a.sent())[0];
                        if (!updated) return [3 /*break*/, 3];
                        return [4 /*yield*/, cache_service_1.cacheService.del("user:".concat(id))];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, updated || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.deleteUser = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // Audit Fix: Use Soft Delete instead of hard delete
                    // Hard deleting users breaks foreign key constraints on quotes, invoices, etc.
                    // preserving financial history is critical.
                    // 1. Mark user as inactive
                    // 2. Clear security tokens (force logout)
                    // 3. Keep the record for historical integrity
                    return [4 /*yield*/, db_1.db.update(schema_1.users)
                            .set({
                            status: "inactive",
                            refreshToken: null,
                            refreshTokenExpiry: null,
                            resetToken: null,
                            resetTokenExpiry: null,
                            updatedAt: new Date()
                        })
                            .where((0, drizzle_orm_1.eq)(schema_1.users.id, id))];
                    case 1:
                        // Audit Fix: Use Soft Delete instead of hard delete
                        // Hard deleting users breaks foreign key constraints on quotes, invoices, etc.
                        // preserving financial history is critical.
                        // 1. Mark user as inactive
                        // 2. Clear security tokens (force logout)
                        // 3. Keep the record for historical integrity
                        _a.sent();
                        // Log the "deletion" (deactivation)
                        // Note: We don't delete their created content.
                        console.log("[Storage] User ".concat(id, " soft-deleted (set to inactive)."));
                        return [4 /*yield*/, cache_service_1.cacheService.del("user:".concat(id))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.getAllUsers = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.users).orderBy((0, drizzle_orm_1.desc)(schema_1.users.createdAt))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.getUsersByRole = function (role) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.role, role))];
                    case 1: 
                    // Cast role to any to match enum type if needed, or string match
                    return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    // Clients
    DatabaseStorage.prototype.getClient = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var client;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.clients).where((0, drizzle_orm_1.eq)(schema_1.clients.id, id))];
                    case 1:
                        client = (_a.sent())[0];
                        return [2 /*return*/, client || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.getClientsByCreator = function (createdBy) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.clients).where((0, drizzle_orm_1.eq)(schema_1.clients.createdBy, createdBy))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.getAllClients = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.clients).orderBy((0, drizzle_orm_1.desc)(schema_1.clients.createdAt))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.createClient = function (client) {
        return __awaiter(this, void 0, void 0, function () {
            var newClient;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.insert(schema_1.clients).values(client).returning()];
                    case 1:
                        newClient = (_a.sent())[0];
                        return [2 /*return*/, newClient];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateClient = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var updated;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .update(schema_1.clients)
                            .set(data)
                            .where((0, drizzle_orm_1.eq)(schema_1.clients.id, id))
                            .returning()];
                    case 1:
                        updated = (_a.sent())[0];
                        return [2 /*return*/, updated || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.deleteClient = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // Audit Fix: Use soft delete for clients to prevent orphaned quotes/invoices
                    return [4 /*yield*/, db_1.db.update(schema_1.clients)
                            .set({
                            isActive: false
                        })
                            .where((0, drizzle_orm_1.eq)(schema_1.clients.id, id))];
                    case 1:
                        // Audit Fix: Use soft delete for clients to prevent orphaned quotes/invoices
                        _a.sent();
                        // Log the soft deletion
                        console.log("[Storage] Client ".concat(id, " soft-deleted (set to inactive)."));
                        return [2 /*return*/];
                }
            });
        });
    };
    // Quotes
    DatabaseStorage.prototype.getQuote = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var quote;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.quotes).where((0, drizzle_orm_1.eq)(schema_1.quotes.id, id))];
                    case 1:
                        quote = (_a.sent())[0];
                        return [2 /*return*/, quote || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.getQuoteByToken = function (token) {
        return __awaiter(this, void 0, void 0, function () {
            var quote;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.quotes).where((0, drizzle_orm_1.eq)(schema_1.quotes.publicToken, token))];
                    case 1:
                        quote = (_a.sent())[0];
                        return [2 /*return*/, quote || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.getQuotesByCreator = function (createdBy) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.quotes).where((0, drizzle_orm_1.eq)(schema_1.quotes.createdBy, createdBy)).orderBy((0, drizzle_orm_1.desc)(schema_1.quotes.createdAt))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.getAllQuotes = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.quotes).orderBy((0, drizzle_orm_1.desc)(schema_1.quotes.createdAt))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.createQuote = function (quote) {
        return __awaiter(this, void 0, void 0, function () {
            var newQuote;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.insert(schema_1.quotes).values(quote).returning()];
                    case 1:
                        newQuote = (_a.sent())[0];
                        return [2 /*return*/, newQuote];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateQuote = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var updated;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .update(schema_1.quotes)
                            .set(__assign(__assign({}, data), { updatedAt: new Date() }))
                            .where((0, drizzle_orm_1.eq)(schema_1.quotes.id, id))
                            .returning()];
                    case 1:
                        updated = (_a.sent())[0];
                        return [2 /*return*/, updated || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.deleteQuote = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.delete(schema_1.quotes).where((0, drizzle_orm_1.eq)(schema_1.quotes.id, id))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.createQuoteTransaction = function (quote, items) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                            var newQuote, _i, items_1, item;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, tx.insert(schema_1.quotes).values(quote).returning()];
                                    case 1:
                                        newQuote = (_a.sent())[0];
                                        _i = 0, items_1 = items;
                                        _a.label = 2;
                                    case 2:
                                        if (!(_i < items_1.length)) return [3 /*break*/, 5];
                                        item = items_1[_i];
                                        return [4 /*yield*/, tx.insert(schema_1.quoteItems).values(__assign(__assign({}, item), { quoteId: newQuote.id }))];
                                    case 3:
                                        _a.sent();
                                        _a.label = 4;
                                    case 4:
                                        _i++;
                                        return [3 /*break*/, 2];
                                    case 5: return [2 /*return*/, newQuote];
                                }
                            });
                        }); })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateQuoteTransaction = function (id, data, items) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                            var updated, _i, items_2, item;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, tx
                                            .update(schema_1.quotes)
                                            .set(__assign(__assign({}, data), { updatedAt: new Date() }))
                                            .where((0, drizzle_orm_1.eq)(schema_1.quotes.id, id))
                                            .returning()];
                                    case 1:
                                        updated = (_a.sent())[0];
                                        if (!updated)
                                            return [2 /*return*/, undefined];
                                        // 2. Replace Items
                                        return [4 /*yield*/, tx.delete(schema_1.quoteItems).where((0, drizzle_orm_1.eq)(schema_1.quoteItems.quoteId, id))];
                                    case 2:
                                        // 2. Replace Items
                                        _a.sent();
                                        _i = 0, items_2 = items;
                                        _a.label = 3;
                                    case 3:
                                        if (!(_i < items_2.length)) return [3 /*break*/, 6];
                                        item = items_2[_i];
                                        return [4 /*yield*/, tx.insert(schema_1.quoteItems).values(__assign(__assign({}, item), { quoteId: id }))];
                                    case 4:
                                        _a.sent();
                                        _a.label = 5;
                                    case 5:
                                        _i++;
                                        return [3 /*break*/, 3];
                                    case 6: return [2 /*return*/, updated];
                                }
                            });
                        }); })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.getLastQuoteNumber = function () {
        return __awaiter(this, void 0, void 0, function () {
            var lastQuote;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.quotes).orderBy((0, drizzle_orm_1.desc)(schema_1.quotes.createdAt)).limit(1)];
                    case 1:
                        lastQuote = (_a.sent())[0];
                        return [2 /*return*/, lastQuote === null || lastQuote === void 0 ? void 0 : lastQuote.quoteNumber];
                }
            });
        });
    };
    // Quote Items
    DatabaseStorage.prototype.getQuoteItems = function (quoteId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.quoteItems).where((0, drizzle_orm_1.eq)(schema_1.quoteItems.quoteId, quoteId)).orderBy(schema_1.quoteItems.sortOrder)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.createQuoteItem = function (item) {
        return __awaiter(this, void 0, void 0, function () {
            var newItem;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.insert(schema_1.quoteItems).values(item).returning()];
                    case 1:
                        newItem = (_a.sent())[0];
                        return [2 /*return*/, newItem];
                }
            });
        });
    };
    DatabaseStorage.prototype.deleteQuoteItems = function (quoteId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.delete(schema_1.quoteItems).where((0, drizzle_orm_1.eq)(schema_1.quoteItems.quoteId, quoteId))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // Invoices
    DatabaseStorage.prototype.getInvoice = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var invoice;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.invoices).where((0, drizzle_orm_1.eq)(schema_1.invoices.id, id))];
                    case 1:
                        invoice = (_a.sent())[0];
                        return [2 /*return*/, invoice || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.getAllInvoices = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.invoices).orderBy((0, drizzle_orm_1.desc)(schema_1.invoices.createdAt))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.createInvoice = function (invoice) {
        return __awaiter(this, void 0, void 0, function () {
            var newInvoice;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.insert(schema_1.invoices).values(invoice).returning()];
                    case 1:
                        newInvoice = (_a.sent())[0];
                        return [2 /*return*/, newInvoice];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateInvoice = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var updated;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .update(schema_1.invoices)
                            .set(__assign(__assign({}, data), { updatedAt: new Date() }))
                            .where((0, drizzle_orm_1.eq)(schema_1.invoices.id, id))
                            .returning()];
                    case 1:
                        updated = (_a.sent())[0];
                        return [2 /*return*/, updated || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.getLastInvoiceNumber = function () {
        return __awaiter(this, void 0, void 0, function () {
            var lastInvoice;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.invoices).orderBy((0, drizzle_orm_1.desc)(schema_1.invoices.createdAt)).limit(1)];
                    case 1:
                        lastInvoice = (_a.sent())[0];
                        return [2 /*return*/, lastInvoice === null || lastInvoice === void 0 ? void 0 : lastInvoice.invoiceNumber];
                }
            });
        });
    };
    // Payment History
    DatabaseStorage.prototype.getPaymentHistory = function (invoiceId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .select()
                            .from(schema_1.paymentHistory)
                            .where((0, drizzle_orm_1.eq)(schema_1.paymentHistory.invoiceId, invoiceId))
                            .orderBy((0, drizzle_orm_1.desc)(schema_1.paymentHistory.paymentDate))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.getPaymentById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var payment;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .select()
                            .from(schema_1.paymentHistory)
                            .where((0, drizzle_orm_1.eq)(schema_1.paymentHistory.id, id))];
                    case 1:
                        payment = (_a.sent())[0];
                        return [2 /*return*/, payment || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.createPaymentHistory = function (payment) {
        return __awaiter(this, void 0, void 0, function () {
            var newPayment;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.insert(schema_1.paymentHistory).values(payment).returning()];
                    case 1:
                        newPayment = (_a.sent())[0];
                        return [2 /*return*/, newPayment];
                }
            });
        });
    };
    DatabaseStorage.prototype.deletePaymentHistory = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.delete(schema_1.paymentHistory).where((0, drizzle_orm_1.eq)(schema_1.paymentHistory.id, id))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // Templates
    DatabaseStorage.prototype.getTemplate = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var template;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.templates).where((0, drizzle_orm_1.eq)(schema_1.templates.id, id))];
                    case 1:
                        template = (_a.sent())[0];
                        return [2 /*return*/, template || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.getAllTemplates = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.templates).where((0, drizzle_orm_1.eq)(schema_1.templates.isActive, true))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.getTemplatesByType = function (type) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .select()
                            .from(schema_1.templates)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.templates.type, type), (0, drizzle_orm_1.eq)(schema_1.templates.isActive, true)))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.getTemplatesByStyle = function (style) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .select()
                            .from(schema_1.templates)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.templates.style, style), (0, drizzle_orm_1.eq)(schema_1.templates.isActive, true)))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.getDefaultTemplate = function (type) {
        return __awaiter(this, void 0, void 0, function () {
            var template;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .select()
                            .from(schema_1.templates)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.templates.type, type), (0, drizzle_orm_1.eq)(schema_1.templates.isDefault, true)))];
                    case 1:
                        template = (_a.sent())[0];
                        return [2 /*return*/, template || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.createTemplate = function (template) {
        return __awaiter(this, void 0, void 0, function () {
            var newTemplate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.insert(schema_1.templates).values(template).returning()];
                    case 1:
                        newTemplate = (_a.sent())[0];
                        return [2 /*return*/, newTemplate];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateTemplate = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var updated;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .update(schema_1.templates)
                            .set(__assign(__assign({}, data), { updatedAt: new Date() }))
                            .where((0, drizzle_orm_1.eq)(schema_1.templates.id, id))
                            .returning()];
                    case 1:
                        updated = (_a.sent())[0];
                        return [2 /*return*/, updated || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.deleteTemplate = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var existingQuote;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.quotes).where((0, drizzle_orm_1.eq)(schema_1.quotes.templateId, id)).limit(1)];
                    case 1:
                        existingQuote = (_a.sent())[0];
                        if (existingQuote) {
                            throw new Error("Cannot delete template: it is referenced by existing quotes.");
                        }
                        return [4 /*yield*/, db_1.db.delete(schema_1.templates).where((0, drizzle_orm_1.eq)(schema_1.templates.id, id))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // Activity Logs
    DatabaseStorage.prototype.createActivityLog = function (log) {
        return __awaiter(this, void 0, void 0, function () {
            var newLog;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.insert(schema_1.activityLogs).values(log).returning()];
                    case 1:
                        newLog = (_a.sent())[0];
                        return [2 /*return*/, newLog];
                }
            });
        });
    };
    DatabaseStorage.prototype.getActivityLogs = function (userId_1) {
        return __awaiter(this, arguments, void 0, function (userId, limit) {
            if (limit === void 0) { limit = 50; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .select()
                            .from(schema_1.activityLogs)
                            .where((0, drizzle_orm_1.eq)(schema_1.activityLogs.userId, userId))
                            .orderBy((0, drizzle_orm_1.desc)(schema_1.activityLogs.timestamp))
                            .limit(limit)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.getAllActivityLogs = function () {
        return __awaiter(this, arguments, void 0, function (limit) {
            var result;
            if (limit === void 0) { limit = 50; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .select({
                            id: schema_1.activityLogs.id,
                            userId: schema_1.activityLogs.userId,
                            action: schema_1.activityLogs.action,
                            entityType: schema_1.activityLogs.entityType,
                            entityId: schema_1.activityLogs.entityId,
                            metadata: schema_1.activityLogs.metadata,
                            timestamp: schema_1.activityLogs.timestamp,
                            userName: schema_1.users.name,
                        })
                            .from(schema_1.activityLogs)
                            .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.activityLogs.userId, schema_1.users.id))
                            .orderBy((0, drizzle_orm_1.desc)(schema_1.activityLogs.timestamp))
                            .limit(limit)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    // Settings
    DatabaseStorage.prototype.getSetting = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var setting;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.settings).where((0, drizzle_orm_1.eq)(schema_1.settings.key, key))];
                    case 1:
                        setting = (_a.sent())[0];
                        return [2 /*return*/, setting || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.getAllSettings = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.settings)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.upsertSetting = function (setting) {
        return __awaiter(this, void 0, void 0, function () {
            var existing, updated, newSetting;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getSetting(setting.key)];
                    case 1:
                        existing = _a.sent();
                        if (!existing) return [3 /*break*/, 3];
                        return [4 /*yield*/, db_1.db
                                .update(schema_1.settings)
                                .set(__assign(__assign({}, setting), { updatedAt: new Date() }))
                                .where((0, drizzle_orm_1.eq)(schema_1.settings.key, setting.key))
                                .returning()];
                    case 2:
                        updated = (_a.sent())[0];
                        return [2 /*return*/, updated];
                    case 3: return [4 /*yield*/, db_1.db.insert(schema_1.settings).values(setting).returning()];
                    case 4:
                        newSetting = (_a.sent())[0];
                        return [2 /*return*/, newSetting];
                }
            });
        });
    };
    DatabaseStorage.prototype.deleteSetting = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.delete(schema_1.settings).where((0, drizzle_orm_1.eq)(schema_1.settings.key, key))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // Bank Details
    DatabaseStorage.prototype.getBankDetails = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var detail;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.bankDetails).where((0, drizzle_orm_1.eq)(schema_1.bankDetails.id, id))];
                    case 1:
                        detail = (_a.sent())[0];
                        return [2 /*return*/, detail || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.getAllBankDetails = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.bankDetails).orderBy((0, drizzle_orm_1.desc)(schema_1.bankDetails.createdAt))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.getActiveBankDetails = function () {
        return __awaiter(this, void 0, void 0, function () {
            var detail;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .select()
                            .from(schema_1.bankDetails)
                            .where((0, drizzle_orm_1.eq)(schema_1.bankDetails.isActive, true))
                            .orderBy((0, drizzle_orm_1.desc)(schema_1.bankDetails.updatedAt))
                            .limit(1)];
                    case 1:
                        detail = (_a.sent())[0];
                        return [2 /*return*/, detail || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.createBankDetails = function (details) {
        return __awaiter(this, void 0, void 0, function () {
            var newDetail;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.insert(schema_1.bankDetails).values(details).returning()];
                    case 1:
                        newDetail = (_a.sent())[0];
                        return [2 /*return*/, newDetail];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateBankDetails = function (id, data, updatedBy) {
        return __awaiter(this, void 0, void 0, function () {
            var updated;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .update(schema_1.bankDetails)
                            .set(__assign(__assign({}, data), { updatedAt: new Date(), updatedBy: updatedBy || data.updatedBy }))
                            .where((0, drizzle_orm_1.eq)(schema_1.bankDetails.id, id))
                            .returning()];
                    case 1:
                        updated = (_a.sent())[0];
                        return [2 /*return*/, updated];
                }
            });
        });
    };
    DatabaseStorage.prototype.deleteBankDetails = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.delete(schema_1.bankDetails).where((0, drizzle_orm_1.eq)(schema_1.bankDetails.id, id))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // PHASE 3 - Client Tags
    DatabaseStorage.prototype.getClientTags = function (clientId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.clientTags).where((0, drizzle_orm_1.eq)(schema_1.clientTags.clientId, clientId))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.addClientTag = function (tag) {
        return __awaiter(this, void 0, void 0, function () {
            var newTag;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.insert(schema_1.clientTags).values(tag).returning()];
                    case 1:
                        newTag = (_a.sent())[0];
                        return [2 /*return*/, newTag];
                }
            });
        });
    };
    DatabaseStorage.prototype.removeClientTag = function (tagId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.delete(schema_1.clientTags).where((0, drizzle_orm_1.eq)(schema_1.clientTags.id, tagId))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // PHASE 3 - Client Communications
    DatabaseStorage.prototype.getClientCommunications = function (clientId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .select()
                            .from(schema_1.clientCommunications)
                            .where((0, drizzle_orm_1.eq)(schema_1.clientCommunications.clientId, clientId))
                            .orderBy((0, drizzle_orm_1.desc)(schema_1.clientCommunications.date))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.createClientCommunication = function (communication) {
        return __awaiter(this, void 0, void 0, function () {
            var newComm;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.insert(schema_1.clientCommunications).values(communication).returning()];
                    case 1:
                        newComm = (_a.sent())[0];
                        return [2 /*return*/, newComm];
                }
            });
        });
    };
    DatabaseStorage.prototype.deleteClientCommunication = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.delete(schema_1.clientCommunications).where((0, drizzle_orm_1.eq)(schema_1.clientCommunications.id, id))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // PHASE 3 - Tax Rates
    DatabaseStorage.prototype.getTaxRate = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var rate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.taxRates).where((0, drizzle_orm_1.eq)(schema_1.taxRates.id, id))];
                    case 1:
                        rate = (_a.sent())[0];
                        return [2 /*return*/, rate || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.getTaxRateByRegion = function (region) {
        return __awaiter(this, void 0, void 0, function () {
            var rate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .select()
                            .from(schema_1.taxRates)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.taxRates.region, region), (0, drizzle_orm_1.eq)(schema_1.taxRates.isActive, true)))
                            .orderBy((0, drizzle_orm_1.desc)(schema_1.taxRates.effectiveFrom))
                            .limit(1)];
                    case 1:
                        rate = (_a.sent())[0];
                        return [2 /*return*/, rate || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.getAllTaxRates = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.taxRates).orderBy((0, drizzle_orm_1.desc)(schema_1.taxRates.effectiveFrom))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.getActiveTaxRates = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .select()
                            .from(schema_1.taxRates)
                            .where((0, drizzle_orm_1.eq)(schema_1.taxRates.isActive, true))
                            .orderBy((0, drizzle_orm_1.desc)(schema_1.taxRates.effectiveFrom))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.createTaxRate = function (rate) {
        return __awaiter(this, void 0, void 0, function () {
            var newRate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.insert(schema_1.taxRates).values(rate).returning()];
                    case 1:
                        newRate = (_a.sent())[0];
                        return [2 /*return*/, newRate];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateTaxRate = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var updated;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.update(schema_1.taxRates).set(data).where((0, drizzle_orm_1.eq)(schema_1.taxRates.id, id)).returning()];
                    case 1:
                        updated = (_a.sent())[0];
                        return [2 /*return*/, updated || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.deleteTaxRate = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.delete(schema_1.taxRates).where((0, drizzle_orm_1.eq)(schema_1.taxRates.id, id))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // PHASE 3 - Pricing Tiers
    DatabaseStorage.prototype.getPricingTier = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var tier;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.pricingTiers).where((0, drizzle_orm_1.eq)(schema_1.pricingTiers.id, id))];
                    case 1:
                        tier = (_a.sent())[0];
                        return [2 /*return*/, tier || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.getAllPricingTiers = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.pricingTiers)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.getPricingTierByAmount = function (amount) {
        return __awaiter(this, void 0, void 0, function () {
            var tiers;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.pricingTiers).where((0, drizzle_orm_1.eq)(schema_1.pricingTiers.isActive, true))];
                    case 1:
                        tiers = _a.sent();
                        return [2 /*return*/, tiers.find(function (t) {
                                var min = parseFloat(t.minAmount.toString());
                                var max = t.maxAmount ? parseFloat(t.maxAmount.toString()) : Infinity;
                                return amount >= min && amount <= max;
                            })];
                }
            });
        });
    };
    DatabaseStorage.prototype.createPricingTier = function (tier) {
        return __awaiter(this, void 0, void 0, function () {
            var newTier;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.insert(schema_1.pricingTiers).values(tier).returning()];
                    case 1:
                        newTier = (_a.sent())[0];
                        return [2 /*return*/, newTier];
                }
            });
        });
    };
    DatabaseStorage.prototype.updatePricingTier = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var updated;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.update(schema_1.pricingTiers).set(data).where((0, drizzle_orm_1.eq)(schema_1.pricingTiers.id, id)).returning()];
                    case 1:
                        updated = (_a.sent())[0];
                        return [2 /*return*/, updated || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.deletePricingTier = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.delete(schema_1.pricingTiers).where((0, drizzle_orm_1.eq)(schema_1.pricingTiers.id, id))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // PHASE 3 - Currency Settings
    DatabaseStorage.prototype.getCurrencySettings = function () {
        return __awaiter(this, void 0, void 0, function () {
            var settings;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.currencySettings).limit(1)];
                    case 1:
                        settings = (_a.sent())[0];
                        return [2 /*return*/, settings || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.upsertCurrencySettings = function (settings) {
        return __awaiter(this, void 0, void 0, function () {
            var existing, updated, newSettings;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCurrencySettings()];
                    case 1:
                        existing = _a.sent();
                        if (!existing) return [3 /*break*/, 3];
                        return [4 /*yield*/, db_1.db
                                .update(schema_1.currencySettings)
                                .set(__assign(__assign({}, settings), { updatedAt: new Date() }))
                                .where((0, drizzle_orm_1.eq)(schema_1.currencySettings.id, existing.id))
                                .returning()];
                    case 2:
                        updated = (_a.sent())[0];
                        return [2 /*return*/, updated];
                    case 3: return [4 /*yield*/, db_1.db.insert(schema_1.currencySettings).values(settings).returning()];
                    case 4:
                        newSettings = (_a.sent())[0];
                        return [2 /*return*/, newSettings];
                }
            });
        });
    };
    // NEW FEATURE - Vendors
    DatabaseStorage.prototype.getVendor = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var vendor;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.vendors).where((0, drizzle_orm_1.eq)(schema_1.vendors.id, id))];
                    case 1:
                        vendor = (_a.sent())[0];
                        return [2 /*return*/, vendor || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.getAllVendors = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.vendors).orderBy((0, drizzle_orm_1.desc)(schema_1.vendors.createdAt))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.getActiveVendors = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.vendors).where((0, drizzle_orm_1.eq)(schema_1.vendors.isActive, true)).orderBy(schema_1.vendors.name)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.createVendor = function (vendor) {
        return __awaiter(this, void 0, void 0, function () {
            var newVendor;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.insert(schema_1.vendors).values(vendor).returning()];
                    case 1:
                        newVendor = (_a.sent())[0];
                        return [2 /*return*/, newVendor];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateVendor = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var updated;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .update(schema_1.vendors)
                            .set(__assign(__assign({}, data), { updatedAt: new Date() }))
                            .where((0, drizzle_orm_1.eq)(schema_1.vendors.id, id))
                            .returning()];
                    case 1:
                        updated = (_a.sent())[0];
                        return [2 /*return*/, updated || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.deleteVendor = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var pos;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select({ id: schema_1.vendorPurchaseOrders.id }).from(schema_1.vendorPurchaseOrders).where((0, drizzle_orm_1.eq)(schema_1.vendorPurchaseOrders.vendorId, id)).limit(1)];
                    case 1:
                        pos = _a.sent();
                        if (pos.length > 0) {
                            throw new Error("Cannot delete vendor: there are existing purchase orders for this vendor.");
                        }
                        return [4 /*yield*/, db_1.db.delete(schema_1.vendors).where((0, drizzle_orm_1.eq)(schema_1.vendors.id, id))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // NEW FEATURE - Vendor Purchase Orders
    DatabaseStorage.prototype.getVendorPo = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var po;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.vendorPurchaseOrders).where((0, drizzle_orm_1.eq)(schema_1.vendorPurchaseOrders.id, id))];
                    case 1:
                        po = (_a.sent())[0];
                        return [2 /*return*/, po || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.getVendorPosByQuote = function (quoteId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.vendorPurchaseOrders).where((0, drizzle_orm_1.eq)(schema_1.vendorPurchaseOrders.quoteId, quoteId)).orderBy((0, drizzle_orm_1.desc)(schema_1.vendorPurchaseOrders.createdAt))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.getAllVendorPos = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.vendorPurchaseOrders).orderBy((0, drizzle_orm_1.desc)(schema_1.vendorPurchaseOrders.createdAt))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.createVendorPo = function (po) {
        return __awaiter(this, void 0, void 0, function () {
            var newPo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.insert(schema_1.vendorPurchaseOrders).values(po).returning()];
                    case 1:
                        newPo = (_a.sent())[0];
                        return [2 /*return*/, newPo];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateVendorPo = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var updated;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .update(schema_1.vendorPurchaseOrders)
                            .set(__assign(__assign({}, data), { updatedAt: new Date() }))
                            .where((0, drizzle_orm_1.eq)(schema_1.vendorPurchaseOrders.id, id))
                            .returning()];
                    case 1:
                        updated = (_a.sent())[0];
                        return [2 /*return*/, updated || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.deleteVendorPo = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.delete(schema_1.vendorPurchaseOrders).where((0, drizzle_orm_1.eq)(schema_1.vendorPurchaseOrders.id, id))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.getLastPoNumber = function () {
        return __awaiter(this, void 0, void 0, function () {
            var lastPo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.vendorPurchaseOrders).orderBy((0, drizzle_orm_1.desc)(schema_1.vendorPurchaseOrders.createdAt)).limit(1)];
                    case 1:
                        lastPo = (_a.sent())[0];
                        return [2 /*return*/, lastPo === null || lastPo === void 0 ? void 0 : lastPo.poNumber];
                }
            });
        });
    };
    // NEW FEATURE - Vendor PO Items
    DatabaseStorage.prototype.getVendorPoItems = function (vendorPoId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.vendorPoItems).where((0, drizzle_orm_1.eq)(schema_1.vendorPoItems.vendorPoId, vendorPoId)).orderBy(schema_1.vendorPoItems.sortOrder)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.createVendorPoItem = function (item) {
        return __awaiter(this, void 0, void 0, function () {
            var newItem;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.insert(schema_1.vendorPoItems).values(item).returning()];
                    case 1:
                        newItem = (_a.sent())[0];
                        return [2 /*return*/, newItem];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateVendorPoItem = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var updated;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .update(schema_1.vendorPoItems)
                            .set(__assign(__assign({}, data), { updatedAt: new Date() }))
                            .where((0, drizzle_orm_1.eq)(schema_1.vendorPoItems.id, id))
                            .returning()];
                    case 1:
                        updated = (_a.sent())[0];
                        return [2 /*return*/, updated || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.deleteVendorPoItems = function (vendorPoId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.delete(schema_1.vendorPoItems).where((0, drizzle_orm_1.eq)(schema_1.vendorPoItems.vendorPoId, vendorPoId))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // NEW FEATURE - Invoice Items
    DatabaseStorage.prototype.getInvoiceItems = function (invoiceId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.invoiceItems).where((0, drizzle_orm_1.eq)(schema_1.invoiceItems.invoiceId, invoiceId)).orderBy(schema_1.invoiceItems.sortOrder)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.getInvoiceItem = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var item;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.invoiceItems).where((0, drizzle_orm_1.eq)(schema_1.invoiceItems.id, id))];
                    case 1:
                        item = (_a.sent())[0];
                        return [2 /*return*/, item || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.createInvoiceItem = function (item) {
        return __awaiter(this, void 0, void 0, function () {
            var newItem;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.insert(schema_1.invoiceItems).values(item).returning()];
                    case 1:
                        newItem = (_a.sent())[0];
                        return [2 /*return*/, newItem];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateInvoiceItem = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var updated;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .update(schema_1.invoiceItems)
                            .set(__assign(__assign({}, data), { updatedAt: new Date() }))
                            .where((0, drizzle_orm_1.eq)(schema_1.invoiceItems.id, id))
                            .returning()];
                    case 1:
                        updated = (_a.sent())[0];
                        return [2 /*return*/, updated || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.deleteInvoiceItems = function (invoiceId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.delete(schema_1.invoiceItems).where((0, drizzle_orm_1.eq)(schema_1.invoiceItems.invoiceId, invoiceId))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.createInvoiceAttachment = function (attachment) {
        return __awaiter(this, void 0, void 0, function () {
            var newAttachment;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.insert(schema_1.invoiceAttachments).values(attachment).returning()];
                    case 1:
                        newAttachment = (_a.sent())[0];
                        return [2 /*return*/, newAttachment];
                }
            });
        });
    };
    DatabaseStorage.prototype.getInvoicesBySalesOrder = function (salesOrderId) {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.invoices).where((0, drizzle_orm_1.eq)(schema_1.invoices.salesOrderId, salesOrderId)).orderBy((0, drizzle_orm_1.desc)(schema_1.invoices.createdAt))];
                case 1: return [2 /*return*/, _a.sent()];
            }
        }); });
    };
    DatabaseStorage.prototype.getInvoicesByQuote = function (quoteId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.invoices).where((0, drizzle_orm_1.eq)(schema_1.invoices.quoteId, quoteId)).orderBy((0, drizzle_orm_1.desc)(schema_1.invoices.createdAt))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    // Serial Numbers
    DatabaseStorage.prototype.getSerialNumber = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var serialNumbers, serial;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require("@shared/schema"); })];
                    case 1:
                        serialNumbers = (_a.sent()).serialNumbers;
                        return [4 /*yield*/, db_1.db.select().from(serialNumbers).where((0, drizzle_orm_1.eq)(serialNumbers.id, id))];
                    case 2:
                        serial = (_a.sent())[0];
                        return [2 /*return*/, serial || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.getSerialNumberByValue = function (serialNumber) {
        return __awaiter(this, void 0, void 0, function () {
            var serialNumbers, serial;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require("@shared/schema"); })];
                    case 1:
                        serialNumbers = (_a.sent()).serialNumbers;
                        return [4 /*yield*/, db_1.db.select().from(serialNumbers).where((0, drizzle_orm_1.eq)(serialNumbers.serialNumber, serialNumber))];
                    case 2:
                        serial = (_a.sent())[0];
                        return [2 /*return*/, serial || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.createSerialNumber = function (serial) {
        return __awaiter(this, void 0, void 0, function () {
            var serialNumbers, newSerial;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require("@shared/schema"); })];
                    case 1:
                        serialNumbers = (_a.sent()).serialNumbers;
                        return [4 /*yield*/, db_1.db.insert(serialNumbers).values(serial).returning()];
                    case 2:
                        newSerial = (_a.sent())[0];
                        return [2 /*return*/, newSerial];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateSerialNumber = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var serialNumbers, updated;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require("@shared/schema"); })];
                    case 1:
                        serialNumbers = (_a.sent()).serialNumbers;
                        return [4 /*yield*/, db_1.db
                                .update(serialNumbers)
                                .set(__assign(__assign({}, data), { updatedAt: new Date() }))
                                .where((0, drizzle_orm_1.eq)(serialNumbers.id, id))
                                .returning()];
                    case 2:
                        updated = (_a.sent())[0];
                        return [2 /*return*/, updated || undefined];
                }
            });
        });
    };
    // NEW FEATURE - Goods Received Notes (GRN)
    DatabaseStorage.prototype.getGrn = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var grn;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.goodsReceivedNotes).where((0, drizzle_orm_1.eq)(schema_1.goodsReceivedNotes.id, id))];
                    case 1:
                        grn = (_a.sent())[0];
                        return [2 /*return*/, grn || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.getGrnByNumber = function (grnNumber) {
        return __awaiter(this, void 0, void 0, function () {
            var grn;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.goodsReceivedNotes).where((0, drizzle_orm_1.eq)(schema_1.goodsReceivedNotes.grnNumber, grnNumber))];
                    case 1:
                        grn = (_a.sent())[0];
                        return [2 /*return*/, grn || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.getAllGrns = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.goodsReceivedNotes).orderBy((0, drizzle_orm_1.desc)(schema_1.goodsReceivedNotes.createdAt))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.getGrnsByVendorPo = function (vendorPoId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.goodsReceivedNotes).where((0, drizzle_orm_1.eq)(schema_1.goodsReceivedNotes.vendorPoId, vendorPoId)).orderBy((0, drizzle_orm_1.desc)(schema_1.goodsReceivedNotes.createdAt))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.createGrn = function (grn) {
        return __awaiter(this, void 0, void 0, function () {
            var newGrn;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.insert(schema_1.goodsReceivedNotes).values(grn).returning()];
                    case 1:
                        newGrn = (_a.sent())[0];
                        return [2 /*return*/, newGrn];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateGrn = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var updated;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .update(schema_1.goodsReceivedNotes)
                            .set(__assign(__assign({}, data), { updatedAt: new Date() }))
                            .where((0, drizzle_orm_1.eq)(schema_1.goodsReceivedNotes.id, id))
                            .returning()];
                    case 1:
                        updated = (_a.sent())[0];
                        return [2 /*return*/, updated || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.deleteGrn = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // Audit Fix: Reverse stock transaction logic before deletion
                    return [4 /*yield*/, db_1.db.transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                            var grn, poItem;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, tx.select().from(schema_1.goodsReceivedNotes).where((0, drizzle_orm_1.eq)(schema_1.goodsReceivedNotes.id, id))];
                                    case 1:
                                        grn = (_a.sent())[0];
                                        if (!grn)
                                            return [2 /*return*/]; // Nothing to delete
                                        return [4 /*yield*/, tx.select().from(schema_1.vendorPoItems).where((0, drizzle_orm_1.eq)(schema_1.vendorPoItems.id, grn.vendorPoItemId))];
                                    case 2:
                                        poItem = (_a.sent())[0];
                                        if (!(poItem && poItem.productId)) return [3 /*break*/, 4];
                                        // Decrease stockQuantity and availableQuantity by the received quantity
                                        // GRN creation (presumably) added to stock and available. So we subtract.
                                        return [4 /*yield*/, tx.update(schema_1.products)
                                                .set({
                                                stockQuantity: (0, drizzle_orm_1.sql)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["", " - ", ""], ["", " - ", ""])), schema_1.products.stockQuantity, grn.quantityReceived),
                                                availableQuantity: (0, drizzle_orm_1.sql)(templateObject_2 || (templateObject_2 = __makeTemplateObject(["", " - ", ""], ["", " - ", ""])), schema_1.products.availableQuantity, grn.quantityReceived),
                                                updatedAt: new Date()
                                            })
                                                .where((0, drizzle_orm_1.eq)(schema_1.products.id, poItem.productId))];
                                    case 3:
                                        // Decrease stockQuantity and availableQuantity by the received quantity
                                        // GRN creation (presumably) added to stock and available. So we subtract.
                                        _a.sent();
                                        console.log("[Storage] Reversing GRN stock for product ".concat(poItem.productId, ": -").concat(grn.quantityReceived));
                                        _a.label = 4;
                                    case 4: 
                                    // 3. Delete GRN
                                    return [4 /*yield*/, tx.delete(schema_1.goodsReceivedNotes).where((0, drizzle_orm_1.eq)(schema_1.goodsReceivedNotes.id, id))];
                                    case 5:
                                        // 3. Delete GRN
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                    case 1:
                        // Audit Fix: Reverse stock transaction logic before deletion
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // Quote Versions
    DatabaseStorage.prototype.createQuoteVersion = function (version) {
        return __awaiter(this, void 0, void 0, function () {
            var newVersion;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.insert(schema_1.quoteVersions).values(version).returning()];
                    case 1:
                        newVersion = (_a.sent())[0];
                        return [2 /*return*/, newVersion];
                }
            });
        });
    };
    DatabaseStorage.prototype.getQuoteVersions = function (quoteId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .select()
                            .from(schema_1.quoteVersions)
                            .where((0, drizzle_orm_1.eq)(schema_1.quoteVersions.quoteId, quoteId))
                            .orderBy((0, drizzle_orm_1.desc)(schema_1.quoteVersions.version))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.getQuoteVersion = function (quoteId, version) {
        return __awaiter(this, void 0, void 0, function () {
            var ver;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .select()
                            .from(schema_1.quoteVersions)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.quoteVersions.quoteId, quoteId), (0, drizzle_orm_1.eq)(schema_1.quoteVersions.version, version)))];
                    case 1:
                        ver = (_a.sent())[0];
                        return [2 /*return*/, ver || undefined];
                }
            });
        });
    };
    // Sales Orders
    DatabaseStorage.prototype.createSalesOrder = function (order) {
        return __awaiter(this, void 0, void 0, function () {
            var newOrder;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.insert(schema_1.salesOrders).values(order).returning()];
                    case 1:
                        newOrder = (_a.sent())[0];
                        return [2 /*return*/, newOrder];
                }
            });
        });
    };
    DatabaseStorage.prototype.getSalesOrder = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var order;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.salesOrders).where((0, drizzle_orm_1.eq)(schema_1.salesOrders.id, id))];
                    case 1:
                        order = (_a.sent())[0];
                        return [2 /*return*/, order || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.getSalesOrderByQuote = function (quoteId) {
        return __awaiter(this, void 0, void 0, function () {
            var order;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.salesOrders).where((0, drizzle_orm_1.eq)(schema_1.salesOrders.quoteId, quoteId))];
                    case 1:
                        order = (_a.sent())[0];
                        return [2 /*return*/, order || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.getAllSalesOrders = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.salesOrders).orderBy((0, drizzle_orm_1.desc)(schema_1.salesOrders.createdAt))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateSalesOrder = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var updatedOrder;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .update(schema_1.salesOrders)
                            .set(__assign(__assign({}, data), { updatedAt: new Date() }))
                            .where((0, drizzle_orm_1.eq)(schema_1.salesOrders.id, id))
                            .returning()];
                    case 1:
                        updatedOrder = (_a.sent())[0];
                        return [2 /*return*/, updatedOrder || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.deleteSalesOrder = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.delete(schema_1.salesOrders).where((0, drizzle_orm_1.eq)(schema_1.salesOrders.id, id))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.getLastSalesOrderNumber = function () {
        return __awaiter(this, void 0, void 0, function () {
            var lastOrder;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .select()
                            .from(schema_1.salesOrders)
                            .orderBy((0, drizzle_orm_1.desc)(schema_1.salesOrders.orderNumber))
                            .limit(1)];
                    case 1:
                        lastOrder = (_a.sent())[0];
                        return [2 /*return*/, lastOrder === null || lastOrder === void 0 ? void 0 : lastOrder.orderNumber];
                }
            });
        });
    };
    // Sales Order Items
    DatabaseStorage.prototype.createSalesOrderItem = function (item) {
        return __awaiter(this, void 0, void 0, function () {
            var newItem;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.insert(schema_1.salesOrderItems).values(item).returning()];
                    case 1:
                        newItem = (_a.sent())[0];
                        return [2 /*return*/, newItem];
                }
            });
        });
    };
    DatabaseStorage.prototype.getSalesOrderItems = function (salesOrderId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .select()
                            .from(schema_1.salesOrderItems)
                            .where((0, drizzle_orm_1.eq)(schema_1.salesOrderItems.salesOrderId, salesOrderId))
                            .orderBy(schema_1.salesOrderItems.sortOrder)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.deleteSalesOrderItems = function (salesOrderId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.delete(schema_1.salesOrderItems).where((0, drizzle_orm_1.eq)(schema_1.salesOrderItems.salesOrderId, salesOrderId))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // Products
    DatabaseStorage.prototype.getProduct = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var product;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.products).where((0, drizzle_orm_1.eq)(schema_1.products.id, id))];
                    case 1:
                        product = (_a.sent())[0];
                        return [2 /*return*/, product || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateProduct = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var updated;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .update(schema_1.products)
                            .set(__assign(__assign({}, data), { updatedAt: new Date() }))
                            .where((0, drizzle_orm_1.eq)(schema_1.products.id, id))
                            .returning()];
                    case 1:
                        updated = (_a.sent())[0];
                        return [2 /*return*/, updated || undefined];
                }
            });
        });
    };
    // Approval Rules
    DatabaseStorage.prototype.getApprovalRules = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.approvalRules).where((0, drizzle_orm_1.eq)(schema_1.approvalRules.isActive, true))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.createApprovalRule = function (rule) {
        return __awaiter(this, void 0, void 0, function () {
            var newRule;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.insert(schema_1.approvalRules).values(rule).returning()];
                    case 1:
                        newRule = (_a.sent())[0];
                        return [2 /*return*/, newRule];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateApprovalRule = function (id, rule) {
        return __awaiter(this, void 0, void 0, function () {
            var updated;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .update(schema_1.approvalRules)
                            .set(__assign(__assign({}, rule), { updatedAt: new Date() }))
                            .where((0, drizzle_orm_1.eq)(schema_1.approvalRules.id, id))
                            .returning()];
                    case 1:
                        updated = (_a.sent())[0];
                        return [2 /*return*/, updated];
                }
            });
        });
    };
    DatabaseStorage.prototype.deleteApprovalRule = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.delete(schema_1.approvalRules).where((0, drizzle_orm_1.eq)(schema_1.approvalRules.id, id))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // Quote Comments for Interactive Public Quotes
    DatabaseStorage.prototype.getQuoteComments = function (quoteId_1) {
        return __awaiter(this, arguments, void 0, function (quoteId, includeInternal) {
            if (includeInternal === void 0) { includeInternal = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!includeInternal) return [3 /*break*/, 2];
                        return [4 /*yield*/, db_1.db.select().from(schema_1.quoteComments).where((0, drizzle_orm_1.eq)(schema_1.quoteComments.quoteId, quoteId)).orderBy(schema_1.quoteComments.createdAt)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2: return [4 /*yield*/, db_1.db.select().from(schema_1.quoteComments).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.quoteComments.quoteId, quoteId), (0, drizzle_orm_1.eq)(schema_1.quoteComments.isInternal, false))).orderBy(schema_1.quoteComments.createdAt)];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.createQuoteComment = function (comment) {
        return __awaiter(this, void 0, void 0, function () {
            var newComment;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.insert(schema_1.quoteComments).values(comment).returning()];
                    case 1:
                        newComment = (_a.sent())[0];
                        return [2 /*return*/, newComment];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateQuoteItemSelection = function (itemId, isSelected) {
        return __awaiter(this, void 0, void 0, function () {
            var updated;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .update(schema_1.quoteItems)
                            .set({ isSelected: isSelected })
                            .where((0, drizzle_orm_1.eq)(schema_1.quoteItems.id, itemId))
                            .returning()];
                    case 1:
                        updated = (_a.sent())[0];
                        return [2 /*return*/, updated || undefined];
                }
            });
        });
    };
    // Sales Order Comments
    DatabaseStorage.prototype.getSalesOrderComments = function (salesOrderId_1) {
        return __awaiter(this, arguments, void 0, function (salesOrderId, includeInternal) {
            if (includeInternal === void 0) { includeInternal = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!includeInternal) return [3 /*break*/, 2];
                        return [4 /*yield*/, db_1.db.select().from(schema_1.salesOrderComments).where((0, drizzle_orm_1.eq)(schema_1.salesOrderComments.salesOrderId, salesOrderId)).orderBy(schema_1.salesOrderComments.createdAt)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2: return [4 /*yield*/, db_1.db.select().from(schema_1.salesOrderComments).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.salesOrderComments.salesOrderId, salesOrderId), (0, drizzle_orm_1.eq)(schema_1.salesOrderComments.isInternal, false))).orderBy(schema_1.salesOrderComments.createdAt)];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.createSalesOrderComment = function (comment) {
        return __awaiter(this, void 0, void 0, function () {
            var newComment;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.insert(schema_1.salesOrderComments).values(comment).returning()];
                    case 1:
                        newComment = (_a.sent())[0];
                        return [2 /*return*/, newComment];
                }
            });
        });
    };
    // Vendor PO Comments
    DatabaseStorage.prototype.getVendorPoComments = function (vendorPoId_1) {
        return __awaiter(this, arguments, void 0, function (vendorPoId, includeInternal) {
            if (includeInternal === void 0) { includeInternal = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!includeInternal) return [3 /*break*/, 2];
                        return [4 /*yield*/, db_1.db.select().from(schema_1.vendorPoComments).where((0, drizzle_orm_1.eq)(schema_1.vendorPoComments.vendorPoId, vendorPoId)).orderBy(schema_1.vendorPoComments.createdAt)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2: return [4 /*yield*/, db_1.db.select().from(schema_1.vendorPoComments).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.vendorPoComments.vendorPoId, vendorPoId), (0, drizzle_orm_1.eq)(schema_1.vendorPoComments.isInternal, false))).orderBy(schema_1.vendorPoComments.createdAt)];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.createVendorPoComment = function (comment) {
        return __awaiter(this, void 0, void 0, function () {
            var newComment;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.insert(schema_1.vendorPoComments).values(comment).returning()];
                    case 1:
                        newComment = (_a.sent())[0];
                        return [2 /*return*/, newComment];
                }
            });
        });
    };
    // Invoice Comments
    DatabaseStorage.prototype.getInvoiceComments = function (invoiceId_1) {
        return __awaiter(this, arguments, void 0, function (invoiceId, includeInternal) {
            if (includeInternal === void 0) { includeInternal = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!includeInternal) return [3 /*break*/, 2];
                        return [4 /*yield*/, db_1.db.select().from(schema_1.invoiceComments).where((0, drizzle_orm_1.eq)(schema_1.invoiceComments.invoiceId, invoiceId)).orderBy(schema_1.invoiceComments.createdAt)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2: return [4 /*yield*/, db_1.db.select().from(schema_1.invoiceComments).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.invoiceComments.invoiceId, invoiceId), (0, drizzle_orm_1.eq)(schema_1.invoiceComments.isInternal, false))).orderBy(schema_1.invoiceComments.createdAt)];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.createInvoiceComment = function (comment) {
        return __awaiter(this, void 0, void 0, function () {
            var newComment;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.insert(schema_1.invoiceComments).values(comment).returning()];
                    case 1:
                        newComment = (_a.sent())[0];
                        return [2 /*return*/, newComment];
                }
            });
        });
    };
    // ==================== WORKFLOW AUTOMATION STORAGE METHODS ====================
    // Workflows
    DatabaseStorage.prototype.getWorkflow = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var workflow;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.workflows).where((0, drizzle_orm_1.eq)(schema_1.workflows.id, id))];
                    case 1:
                        workflow = (_a.sent())[0];
                        return [2 /*return*/, workflow || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.getAllWorkflows = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.workflows).orderBy((0, drizzle_orm_1.desc)(schema_1.workflows.createdAt))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.getWorkflowsByEntity = function (entityType) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.workflows).where((0, drizzle_orm_1.eq)(schema_1.workflows.entityType, entityType)).orderBy((0, drizzle_orm_1.desc)(schema_1.workflows.priority))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.getActiveWorkflows = function (entityType) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.workflows).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.workflows.entityType, entityType), (0, drizzle_orm_1.eq)(schema_1.workflows.status, "active"))).orderBy((0, drizzle_orm_1.desc)(schema_1.workflows.priority))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.createWorkflow = function (workflow) {
        return __awaiter(this, void 0, void 0, function () {
            var newWorkflow;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.insert(schema_1.workflows).values(workflow).returning()];
                    case 1:
                        newWorkflow = (_a.sent())[0];
                        return [2 /*return*/, newWorkflow];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateWorkflow = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var createdAt, _, updateData, updated;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        createdAt = data.createdAt, _ = data.id, updateData = __rest(data, ["createdAt", "id"]);
                        return [4 /*yield*/, db_1.db
                                .update(schema_1.workflows)
                                .set(__assign(__assign({}, updateData), { updatedAt: new Date() }))
                                .where((0, drizzle_orm_1.eq)(schema_1.workflows.id, id))
                                .returning()];
                    case 1:
                        updated = (_a.sent())[0];
                        return [2 /*return*/, updated || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.deleteWorkflow = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // Hard delete: Clean up executions first (no cascade), then delete workflow (cascades to triggers/actions)
                    return [4 /*yield*/, db_1.db.delete(schema_1.workflowExecutions).where((0, drizzle_orm_1.eq)(schema_1.workflowExecutions.workflowId, id))];
                    case 1:
                        // Hard delete: Clean up executions first (no cascade), then delete workflow (cascades to triggers/actions)
                        _a.sent();
                        return [4 /*yield*/, db_1.db.delete(schema_1.workflows).where((0, drizzle_orm_1.eq)(schema_1.workflows.id, id))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // Workflow Triggers
    DatabaseStorage.prototype.getWorkflowTriggers = function (workflowId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.workflowTriggers).where((0, drizzle_orm_1.eq)(schema_1.workflowTriggers.workflowId, workflowId))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.createWorkflowTrigger = function (trigger) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, createdAt, _, triggerData, newTrigger;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = trigger, createdAt = _a.createdAt, _ = _a.id, triggerData = __rest(_a, ["createdAt", "id"]);
                        return [4 /*yield*/, db_1.db.insert(schema_1.workflowTriggers).values(triggerData).returning()];
                    case 1:
                        newTrigger = (_b.sent())[0];
                        return [2 /*return*/, newTrigger];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateWorkflowTrigger = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var updated;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .update(schema_1.workflowTriggers)
                            .set(data)
                            .where((0, drizzle_orm_1.eq)(schema_1.workflowTriggers.id, id))
                            .returning()];
                    case 1:
                        updated = (_a.sent())[0];
                        return [2 /*return*/, updated || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.deleteWorkflowTriggers = function (workflowId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.delete(schema_1.workflowTriggers).where((0, drizzle_orm_1.eq)(schema_1.workflowTriggers.workflowId, workflowId))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // Workflow Actions
    DatabaseStorage.prototype.getWorkflowActions = function (workflowId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.workflowActions)
                            .where((0, drizzle_orm_1.eq)(schema_1.workflowActions.workflowId, workflowId))
                            .orderBy(schema_1.workflowActions.executionOrder)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.createWorkflowAction = function (action) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, createdAt, _, actionData, newAction;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = action, createdAt = _a.createdAt, _ = _a.id, actionData = __rest(_a, ["createdAt", "id"]);
                        return [4 /*yield*/, db_1.db.insert(schema_1.workflowActions).values(actionData).returning()];
                    case 1:
                        newAction = (_b.sent())[0];
                        return [2 /*return*/, newAction];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateWorkflowAction = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var updated;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .update(schema_1.workflowActions)
                            .set(data)
                            .where((0, drizzle_orm_1.eq)(schema_1.workflowActions.id, id))
                            .returning()];
                    case 1:
                        updated = (_a.sent())[0];
                        return [2 /*return*/, updated || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.deleteWorkflowActions = function (workflowId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.delete(schema_1.workflowActions).where((0, drizzle_orm_1.eq)(schema_1.workflowActions.workflowId, workflowId))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // Workflow Executions
    DatabaseStorage.prototype.getWorkflowExecution = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var execution;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.workflowExecutions).where((0, drizzle_orm_1.eq)(schema_1.workflowExecutions.id, id))];
                    case 1:
                        execution = (_a.sent())[0];
                        return [2 /*return*/, execution || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.getWorkflowExecutions = function (workflowId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.workflowExecutions)
                            .where((0, drizzle_orm_1.eq)(schema_1.workflowExecutions.workflowId, workflowId))
                            .orderBy((0, drizzle_orm_1.desc)(schema_1.workflowExecutions.triggeredAt))
                            .limit(100)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.getEntityWorkflowExecutions = function (entityType, entityId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.workflowExecutions)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.workflowExecutions.entityType, entityType), (0, drizzle_orm_1.eq)(schema_1.workflowExecutions.entityId, entityId)))
                            .orderBy((0, drizzle_orm_1.desc)(schema_1.workflowExecutions.triggeredAt))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.createWorkflowExecution = function (execution) {
        return __awaiter(this, void 0, void 0, function () {
            var newExecution;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.insert(schema_1.workflowExecutions).values(execution).returning()];
                    case 1:
                        newExecution = (_a.sent())[0];
                        return [2 /*return*/, newExecution];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateWorkflowExecution = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var updated;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .update(schema_1.workflowExecutions)
                            .set(data)
                            .where((0, drizzle_orm_1.eq)(schema_1.workflowExecutions.id, id))
                            .returning()];
                    case 1:
                        updated = (_a.sent())[0];
                        return [2 /*return*/, updated || undefined];
                }
            });
        });
    };
    // Workflow Schedules
    DatabaseStorage.prototype.getWorkflowSchedule = function (workflowId) {
        return __awaiter(this, void 0, void 0, function () {
            var schedule;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.workflowSchedules).where((0, drizzle_orm_1.eq)(schema_1.workflowSchedules.workflowId, workflowId))];
                    case 1:
                        schedule = (_a.sent())[0];
                        return [2 /*return*/, schedule || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.getAllWorkflowSchedules = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.workflowSchedules).orderBy(schema_1.workflowSchedules.nextRunAt)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.getActiveWorkflowSchedules = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.workflowSchedules)
                            .where((0, drizzle_orm_1.eq)(schema_1.workflowSchedules.isActive, true))
                            .orderBy(schema_1.workflowSchedules.nextRunAt)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.createWorkflowSchedule = function (schedule) {
        return __awaiter(this, void 0, void 0, function () {
            var newSchedule;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.insert(schema_1.workflowSchedules).values(schedule).returning()];
                    case 1:
                        newSchedule = (_a.sent())[0];
                        return [2 /*return*/, newSchedule];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateWorkflowSchedule = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var updated;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .update(schema_1.workflowSchedules)
                            .set(data)
                            .where((0, drizzle_orm_1.eq)(schema_1.workflowSchedules.id, id))
                            .returning()];
                    case 1:
                        updated = (_a.sent())[0];
                        return [2 /*return*/, updated || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.deleteWorkflowSchedule = function (workflowId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.delete(schema_1.workflowSchedules).where((0, drizzle_orm_1.eq)(schema_1.workflowSchedules.workflowId, workflowId))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // User Devices
    DatabaseStorage.prototype.createUserDevice = function (device) {
        return __awaiter(this, void 0, void 0, function () {
            var newItem;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.insert(schema_1.userDevices).values(device).returning()];
                    case 1:
                        newItem = (_a.sent())[0];
                        return [2 /*return*/, newItem];
                }
            });
        });
    };
    DatabaseStorage.prototype.getUserDevices = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, db_1.db.select().from(schema_1.userDevices).where((0, drizzle_orm_1.eq)(schema_1.userDevices.userId, userId)).orderBy((0, drizzle_orm_1.desc)(schema_1.userDevices.lastActive))];
            });
        });
    };
    DatabaseStorage.prototype.getUserDevice = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var device;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.userDevices).where((0, drizzle_orm_1.eq)(schema_1.userDevices.id, id))];
                    case 1:
                        device = (_a.sent())[0];
                        return [2 /*return*/, device];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateUserDevice = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var updated;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.update(schema_1.userDevices).set(data).where((0, drizzle_orm_1.eq)(schema_1.userDevices.id, id)).returning()];
                    case 1:
                        updated = (_a.sent())[0];
                        return [2 /*return*/, updated];
                }
            });
        });
    };
    DatabaseStorage.prototype.deleteUserDevice = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.delete(schema_1.userDevices).where((0, drizzle_orm_1.eq)(schema_1.userDevices.id, id))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return DatabaseStorage;
}());
exports.DatabaseStorage = DatabaseStorage;
exports.storage = new DatabaseStorage();
var templateObject_1, templateObject_2;
