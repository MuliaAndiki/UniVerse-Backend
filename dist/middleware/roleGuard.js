"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleGuard = void 0;
const roleGuard = (roles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user?.role) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!roles.includes(user.role)) {
            return res.status(403).json({ message: "Forbidden: insufficient role" });
        }
        next();
    };
};
exports.roleGuard = roleGuard;
exports.default = exports.roleGuard;
