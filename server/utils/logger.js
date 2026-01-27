"use strict";
/**
 * Production-safe logging utility.
 *
 * In production, only logs errors and warnings.
 * In development, logs everything for debugging.
 */
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
var isDev = process.env.NODE_ENV !== 'production';
exports.logger = {
    /**
     * Debug level log - only in development
     */
    debug: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (isDev) {
            console.log.apply(console, __spreadArray(['[DEBUG]'], args, false));
        }
    },
    /**
     * Info level log - only in development
     */
    info: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (isDev) {
            console.log.apply(console, __spreadArray(['[INFO]'], args, false));
        }
    },
    /**
     * Warning level log - always
     */
    warn: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        console.warn.apply(console, __spreadArray(['[WARN]'], args, false));
    },
    /**
     * Error level log - always
     */
    error: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        console.error.apply(console, __spreadArray(['[ERROR]'], args, false));
    },
    /**
     * Stock operation logs - only in development
     */
    stock: function (message) {
        if (isDev) {
            console.log(message);
        }
    },
};
exports.default = exports.logger;
