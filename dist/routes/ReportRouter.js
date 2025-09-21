"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ReportController_1 = __importDefault(require("../controllers/ReportController"));
const auth_1 = require("../middleware/auth");
class ReportRouter {
    constructor() {
        this.router = express_1.default.Router();
        this.routes();
    }
    routes() {
        this.router.get("/reports/super-admin", auth_1.verifyToken, (0, auth_1.requireRole)(["super-admin"]), ReportController_1.default.superAdmin);
        this.router.get("/reports/campus/:campusId", auth_1.verifyToken, (0, auth_1.requireRole)(["campus", "super-admin"]), ReportController_1.default.campus);
        this.router.get("/reports/organizer/:orgId", auth_1.verifyToken, (0, auth_1.requireRole)(["organizer", "campus", "super-admin"]), ReportController_1.default.organizer);
    }
}
exports.default = new ReportRouter().router;
