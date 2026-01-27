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
var test_1 = require("@playwright/test");
var storage_1 = require("../../server/storage");
var db_1 = require("../../server/db");
var schema_1 = require("../../shared/schema");
var drizzle_orm_1 = require("drizzle-orm");
var TEST_EMAIL = "security_test_serial_".concat(Date.now(), "@example.com");
var TEST_PASSWORD = 'TestPassword123!';
test_1.test.use({ baseURL: 'http://localhost:5001' });
test_1.test.describe.serial('Security Remediation Verification Serial', function () {
    (0, test_1.test)('Complete Security Flow', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var signupRes, signupBody, user, loginFailRes, loginFailBody, loginSuccessRes, loginSuccessBody;
        var request = _b.request;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, request.post('/api/auth/signup', {
                        data: {
                            email: TEST_EMAIL,
                            password: TEST_PASSWORD,
                            name: 'Security Test User'
                        }
                    })];
                case 1:
                    signupRes = _c.sent();
                    (0, test_1.expect)(signupRes.status(), "Signup status should be 200").toBe(200);
                    return [4 /*yield*/, signupRes.json()];
                case 2:
                    signupBody = _c.sent();
                    (0, test_1.expect)(signupBody.role, "Role should be guest").toBe('guest');
                    return [4 /*yield*/, storage_1.storage.getUserByEmail(TEST_EMAIL)];
                case 3:
                    user = _c.sent();
                    (0, test_1.expect)(user).toBeDefined();
                    (0, test_1.expect)(user === null || user === void 0 ? void 0 : user.role).toBe('guest');
                    (0, test_1.expect)(user === null || user === void 0 ? void 0 : user.status).toBe('pending');
                    return [4 /*yield*/, request.post('/api/auth/login', {
                            data: {
                                email: TEST_EMAIL,
                                password: TEST_PASSWORD
                            }
                        })];
                case 4:
                    loginFailRes = _c.sent();
                    (0, test_1.expect)(loginFailRes.status(), "Login should fail with 403").toBe(403);
                    return [4 /*yield*/, loginFailRes.json()];
                case 5:
                    loginFailBody = _c.sent();
                    (0, test_1.expect)(loginFailBody.error).toContain('pending approval');
                    // 3. Admin Approval
                    if (!user)
                        throw new Error("User not found for approval");
                    return [4 /*yield*/, db_1.db.update(schema_1.users)
                            .set({ status: 'active', role: 'viewer' })
                            .where((0, drizzle_orm_1.eq)(schema_1.users.id, user.id))];
                case 6:
                    _c.sent();
                    return [4 /*yield*/, request.post('/api/auth/login', {
                            data: {
                                email: TEST_EMAIL,
                                password: TEST_PASSWORD
                            }
                        })];
                case 7:
                    loginSuccessRes = _c.sent();
                    (0, test_1.expect)(loginSuccessRes.status(), "Login after approval should be 200").toBe(200);
                    return [4 /*yield*/, loginSuccessRes.json()];
                case 8:
                    loginSuccessBody = _c.sent();
                    (0, test_1.expect)(loginSuccessBody.email).toBe(TEST_EMAIL);
                    return [2 /*return*/];
            }
        });
    }); });
});
