"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Auth_1 = __importDefault(require("../models/Auth"));
const env_config_1 = require("../utils/env.config");
const verifyToken = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        res.status(401).json({
            status: 401,
            message: "Access denied. No token provided.",
        });
        return;
    }
    try {
        if (!env_config_1.env.JWT_SECRET) {
            console.error("JWT_SECRET is not defined");
            res.status(500).json({
                status: 500,
                message: "Server configuration error.",
            });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, env_config_1.env.JWT_SECRET);
        const user = await Auth_1.default.findById(decoded._id);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        req.user = {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
        };
        next();
    }
    catch (error) {
        console.error("JWT verification error:", error);
        res.status(403).json({
            status: 403,
            message: "Invalid or expired token.",
        });
    }
};
exports.verifyToken = verifyToken;
const requireRole = (roles) => {
    return (req, res, next) => {
        console.log("DEBUG: requireRole - req.user:", req.user);
        console.log("DEBUG: requireRole - Required roles:", roles);
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({ message: "Akses ditolak. Role tidak sesuai." });
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
